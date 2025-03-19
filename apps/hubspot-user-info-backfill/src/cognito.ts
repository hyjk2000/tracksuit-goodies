import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { fromEntries, map, pipe } from "remeda";

for (const envVar of ["AWS_DEFAULT_REGION", "COGNITO_USER_POOL_ID"]) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not set`);
  }
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_DEFAULT_REGION as string,
});

export const listAllUsers = async (PaginationToken?: string): Promise<Record<string, string>> => {
  const { Users, PaginationToken: nextPaginationToken } = await cognitoClient.send(
    new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
      Filter: 'status = "Enabled"',
      PaginationToken,
    }),
  );

  return {
    ...pipe(
      Users ?? [],
      map(({ Username, Attributes }) => [
        Username!,
        Attributes?.find(({ Name }) => Name === "email")?.Value,
      ]),
      fromEntries,
    ),
    ...(nextPaginationToken ? await listAllUsers(nextPaginationToken) : {}),
  };
};

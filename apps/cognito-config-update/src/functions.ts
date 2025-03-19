import {
  CognitoIdentityProviderClient,
  DescribeUserPoolCommand,
  UpdateUserPoolCommand,
  type UserPoolType,
} from "@aws-sdk/client-cognito-identity-provider";

if (!process.env.AWS_DEFAULT_REGION) {
  throw new Error("AWS_DEFAULT_REGION is not set");
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_DEFAULT_REGION,
});

export const describeUserPool = async (userPoolId: string) =>
  cognitoClient.send(
    new DescribeUserPoolCommand({
      UserPoolId: userPoolId,
    })
  );

export const updateUserPool = async (
  userPoolId: string,
  config: UserPoolType
) =>
  await cognitoClient.send(
    new UpdateUserPoolCommand({
      UserPoolId: userPoolId,
      ...config,
    })
  );

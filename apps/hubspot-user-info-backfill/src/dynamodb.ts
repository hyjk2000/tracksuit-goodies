import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { addProp, map, mapValues, omit, piped } from "remeda";

for (const envVar of ["AWS_DEFAULT_REGION", "DYNAMODB_TABLE"]) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not set`);
  }
}

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_DEFAULT_REGION as string,
});

const displayNames = new Intl.DisplayNames("en", { type: "region" });

export type UserInfo = {
  oiCity: string;
  oiMarketingUpdatesOptIn: boolean;
  oiConfidence: string;
  oiOJArea: string;
  oiFName: string;
  oiLName: string;
  oiAgency: boolean;
  oiCountry: string;
  oiJArea: string;
  sub: string;
  country: string;
};

export async function getUsers() {
  const command = new ScanCommand({
    TableName: process.env.DYNAMODB_TABLE as string,
    FilterExpression: "begins_with(hk, :hk)",
    ExpressionAttributeValues: {
      ":hk": { S: "ONBOARD_INFO#" },
    },
    ReturnConsumedCapacity: "TOTAL",
  });

  const { Items, Count, ConsumedCapacity } = await dynamoClient.send(command);

  console.info(
    `\x1b[36mDynamoDB Table: ${ConsumedCapacity?.TableName}\nCount: ${Count}\nConsumedCapacity: ${ConsumedCapacity?.CapacityUnits}\x1b[0m`,
  );

  if (!Items) {
    throw new Error("No items found");
  }

  return map(
    Items,
    piped(
      mapValues((value) => Object.values(value)[0]),
      (item) => addProp(item, "sub", item.hk.split("#")[1]),
      (item) => addProp(item, "country", displayNames.of(item.oiCountry)),
      omit(["hk", "rk"]),
    ),
  ) as Array<UserInfo>;
}

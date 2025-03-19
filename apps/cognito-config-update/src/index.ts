import confirm from "@inquirer/confirm";
import { writeFile } from "node:fs/promises";
import { omit, pipe } from "remeda";
import { describeUserPool, updateUserPool } from "./functions.ts";

const { UserPool: existingConfig } = await describeUserPool(
  process.env.COGNITO_USER_POOL_ID as string,
);

if (!existingConfig) {
  throw new Error("Loading existing config failed");
}

await writeFile("existing-config.json", JSON.stringify(existingConfig, null, 2));

/**
 * Manipulation of Cognito User Pool configuration
 * @see https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-updating.html#cognito-user-pool-updating-api-cli
 */
const config = pipe(
  existingConfig,
  omit([
    "Arn",
    "CreationDate",
    "CustomDomain",
    "Domain",
    "EmailConfigurationFailure",
    "EstimatedNumberOfUsers",
    "Id",
    "LastModifiedDate",
    "Name",
    "SchemaAttributes",
    "SmsConfigurationFailure",
    "Status",
  ]),
  (config) => ({
    ...config,
    LambdaConfig: {
      ...config.LambdaConfig,
      CustomEmailSender: {
        LambdaVersion: "V1_0" as const,
        LambdaArn: process.env.COGNITO_CUSTOM_EMAIL_SENDER_LAMBDA_ARN as string,
      },
      PostConfirmation: process.env.COGNITO_CUSTOM_EMAIL_SENDER_LAMBDA_ARN as string,
      KMSKeyID: process.env.COGNITO_KMS_KEY_ARN as string,
    },
  }),
  // Uncomment this when you want to REMOVE the email sender lambdas
  // (config) => ({
  //   ...config,
  //   LambdaConfig: omit(config.LambdaConfig, ["CustomEmailSender", "PostConfirmation", "KMSKeyID"]),
  // }),
);

console.log(config, "\n");

if (await confirm({ message: "Are you sure you want to update the user pool?" })) {
  console.log("Updating user pool...");
  await updateUserPool(process.env.COGNITO_USER_POOL_ID as string, config);
}

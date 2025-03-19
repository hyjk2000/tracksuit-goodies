import confirm from "@inquirer/confirm";
import editor from "@inquirer/editor";
import { readFile, writeFile } from "node:fs/promises";
import { map, mapValues, piped } from "remeda";
import { getUsers, type UserInfo } from "./dynamodb.ts";
import { batchUpdateContacts } from "./hubspot.ts";

const USER_INFO_FILE = "out/user-info.json";

let userInfo: UserInfo[] = [];

try {
  userInfo = JSON.parse(await readFile(USER_INFO_FILE, "utf-8"));
} catch (err) {
  console.info("Retrieving user info from DynamoDB...", err);
  userInfo = await getUsers();
  await writeFile(USER_INFO_FILE, JSON.stringify(userInfo, null, 2));
}

const hubspotContacts = map(
  userInfo,
  piped(
    (o) => ({
      tracksuit_user_id: o.sub,
      firstname: o.oiFName,
      lastname: o.oiLName,
      city_contact_enriched: o.oiCity,
      country_contact_enriched: o.country,
      job_area: o.oiJArea,
      agency_status: o.oiAgency,
      confidence_with_brand_tracking: o.oiConfidence,
      newsletter_subscriber: o.oiMarketingUpdatesOptIn,
    }),
    mapValues((o) => `${o}`),
  ),
);

await editor({
  message: "Confirm contacts to update",
  waitForUseInput: false,
  default: JSON.stringify(hubspotContacts, null, 2),
});

if (await confirm({ message: "Continue?" })) {
  const batchSize = 100;
  for (let i = 0; i < hubspotContacts.length; i += batchSize) {
    await batchUpdateContacts({
      inputs: hubspotContacts
        .slice(i, i + batchSize)
        .map(({ tracksuit_user_id, ...properties }) => ({
          idProperty: "tracksuit_user_id",
          id: tracksuit_user_id,
          properties,
        })),
    });
  }
}

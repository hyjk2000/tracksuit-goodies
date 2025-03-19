import { FilterOperatorEnum } from "@hubspot/api-client/lib/codegen/crm/contacts/index.js";
import { pipe, tap } from "remeda";
import { client } from "./hubspot.ts";

const email = "james.shih@gotracksuit.com";
const tracksuit_user_id = "d7cd1a25-09d9-4f97-b3ef-08315810b86d";

const contactId = pipe(
  await client.crm.contacts.searchApi.doSearch({
    filterGroups: [
      {
        filters: [
          {
            propertyName: "email",
            operator: FilterOperatorEnum.Eq,
            value: email,
          },
        ],
      },
      {
        filters: [
          {
            propertyName: "tracksuit_user_id",
            operator: FilterOperatorEnum.Eq,
            value: tracksuit_user_id,
          },
        ],
      },
    ],
    properties: [
      "tracksuit_user_id",
      "email",
      "firstname",
      "lastname",
      "city_contact_enriched",
      "country_contact_enriched",
      "job_area",
      "agency_status",
      "confidence_with_brand_tracking",
      "newsletter_subscriber",
      "tracksuit_invite",
      "user_activation_date",
    ],
  }),
  ({ total, results }) => {
    if (total === 0) {
      throw new Error("Contact not found");
    }

    if (total > 1) {
      console.warn(
        `Found ${total} contacts for email ${email} or tracksuit_user_id ${tracksuit_user_id}`,
      );
    }

    return results[0];
  },
  tap((contact) => console.log("🚰 Found HubSpot contact:\n", contact)),
  ({ id }) => id,
);

console.log(
  await client.crm.contacts.basicApi.update(contactId, {
    objectWriteTraceId: Date.now().toString(),
    properties: {
      firstname: "James",
      lastname: "Shih",
      city_contact_enriched: "San Francisco",
      country_contact_enriched: "United States of America",
      job_area: "Marketing",
      agency_status: "true",
      confidence_with_brand_tracking: "3",
      newsletter_subscriber: "false",
    },
  }),
);

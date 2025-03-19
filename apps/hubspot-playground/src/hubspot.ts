import { Client } from "@hubspot/api-client";

for (const envVar of ["HUBSPOT_ACCESS_TOKEN"]) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is not set`);
  }
}

export const client = new Client({
  accessToken: process.env.HUBSPOT_ACCESS_TOKEN,
  limiterOptions: { minTime: 1000 / 9, maxConcurrent: 6 },
});

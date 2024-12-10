import { createJwtToken } from "./jwtUtils";
import { H3Event } from "h3";
import { $fetch } from "ofetch";
import * as jwt from "atlassian-jwt";
import prisma from "~~/lib/prisma";

export async function callJiraApi(
  event: H3Event,
  method: string,
  apiPath: string,
  body?: any
) {
  const clientKey = event.context?.auth?.clientKey ?? process.env.CLIENT_KEY;
  const userSourceId = event.context?.auth?.userSourceId;
  const org = event.context.auth.org;
  const orgId = event.context.auth.org.org_id;
  const verifiedClaims = event.context.auth.verifiedClaims;
  if (userSourceId) {
    const user = await prisma.user.findFirst({
      where: {
        user_source_id: userSourceId,
        org_id: orgId,
      },
    });
    if (!user) {
      await prisma.user.create({
        data: {
          user_source_id: userSourceId,
          org_id: orgId,
          updated_at: new Date(),
        },
      });
    }
  }

  if (!clientKey) {
    throw new Error("Client key not found in request context");
  }

  const baseUrl =
    event.context?.auth?.org?.base_url ?? (await getBaseUrl(clientKey));

  const fullUrl = `${baseUrl}${apiPath}`;

  const req = jwt.fromMethodAndUrl(method, apiPath);

  const token = await createJwtToken(clientKey, req, org, verifiedClaims);

  try {
    const response = await $fetch(fullUrl, {
      headers: {
        Authorization: `JWT ${token}`,
        Accept: "application/json",
      },
      method: method,
      body: body ? JSON.stringify(body) : undefined,
    });

    return response;
  } catch (error) {
    console.error(`Error calling Jira API: ${error}`);
    throw error;
  }
}

async function getBaseUrl(clientKey: string): Promise<string> {
  const org = await prisma.organization.findFirst({
    where: { client_key: clientKey },
  });

  if (!org) {
    throw new Error("User not found");
  }

  return org.base_url ?? "";
}

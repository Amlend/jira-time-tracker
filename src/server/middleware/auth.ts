import { defineEventHandler, createError } from "h3";
import { decodeSymmetric, SymmetricAlgorithm } from "atlassian-jwt";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  if (process.env.DEV_ENV === "Local") {
    const org = await prisma.organization.findFirst({
      where: {
        client_key: process.env.CLIENT_KEY,
      },
    });
    const verifiedClaims = {sub:process.env.USER_SOURCE_ID}
    event.context.auth = {
      clientKey: process.env.CLIENT_KEY,
      org: org,
      userSourceId: process.env.USER_SOURCE_ID,
      verifiedClaims:verifiedClaims
    };
  } else {
    try {
      // Get the JWT token from the request
      let token;
      const referer = event.node.req.headers.referer;
      console.log("referer", referer);

      // Extract the token from referer if it exists
      if (referer) {
        const url = new URL(referer);
        token = url.searchParams.get("jwt");
        console.log(token);
      }

      if (!token) {
        console.warn("No JWT token found in referer");
        token = null;
      }

      if (token) {
        const [, payload] = token.split(".");
        const decodedPayload = JSON.parse(
          Buffer.from(payload, "base64").toString("utf8")
        );
        const clientKey: string = decodedPayload.iss;
        const userSourceId: string = decodedPayload.sub;
        console.log("clientKey", clientKey);
        console.log("userSourceId", userSourceId);
        console.log("typeof clientKey", typeof clientKey);

        // Fetch org details from the database
        const org = await prisma.organization.findFirst({
          where: {
            client_key: clientKey,
          },
        });

        if (!org) {
          throw createError({
            statusCode: 401,
            statusMessage: "Unknown client key",
          });
        }

        // Verify the token
        const verifiedClaims = decodeSymmetric(
          token,
          org.shared_secret ?? "",
          SymmetricAlgorithm.HS256
        );
        console.log("verifiedClaims", verifiedClaims);

        // Check token expiration
        const now = Math.floor(Date.now() / 1000);
        if (verifiedClaims.exp && verifiedClaims.exp < now) {
          throw createError({
            statusCode: 401,
            statusMessage: "Token has expired",
          });
        }

        // If everything is valid, set the auth context
        event.context.auth = {
          clientKey: clientKey,
          org: org,
          userSourceId: userSourceId,
          verifiedClaims: verifiedClaims,
        };
      } else {
        console.warn(
          "No valid JWT found; continuing execution without authentication context."
        );
      }
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: "Authentication failed",
      });
    }
  }
});

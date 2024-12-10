import * as jwt from "atlassian-jwt";
import prisma from "~~/lib/prisma";
import moment from "moment";

export async function createJwtToken(
  clientKey: string,
  req: any,
  org: any,
  verifiedClaims: any
): Promise<string> {
  const now = moment().utc();
  const claims = {
    iss: process.env.ISS_KEY,
    iat: now.unix(),
    exp: now.add(59, "minutes").unix(),
    sub: verifiedClaims.sub,
    qsh: jwt.createQueryStringHash(req),
    aud: [clientKey],
    context: {},
  };
  if (verifiedClaims.context) {
    claims.context = verifiedClaims.context;
  }
  return jwt.encodeSymmetric(
    claims,
    org.shared_secret,
    jwt.SymmetricAlgorithm.HS256
  );
}

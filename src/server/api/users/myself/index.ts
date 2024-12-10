import { defineEventHandler, readBody } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import { createJwtToken } from "~/utils/jwtUtils";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const userSourceId = event.context.auth.userSourceId
 if (method === "GET") {
    return await getOneUser();
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function getOneUser() {
    try {
    const apiPath = `/rest/api/3/user?accountId=${userSourceId}`
    const myself = await callJiraApi(event ?? "", 'GET', apiPath)

      response.data = {
        ...myself,
      };
      return response
    } catch (error) {
      console.error(error);
      response.error = {
        message: "Data Fetching Error, Please Try Again Later",
      };
    }
  }
});
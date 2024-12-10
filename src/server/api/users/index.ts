import { defineEventHandler, readBody } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import { createJwtToken } from "~/utils/jwtUtils";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id
  const userSourceId = event.context.auth.user_source_id
 if (method === "GET") {
    return await getOneUser();
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function getOneUser() {
    try {
      // Get all the events table details      
      const fetchedUser = await prisma.user.findFirst({
        where: {
          user_source_id: userSourceId,
          org_id: orgId
        },
        select: {
          user_id: true,
          username: true,
          email: true
        },
      });
        

      const modifiedUser = {
        id: fetchedUser?.user_id,
        username: fetchedUser?.username,
        email: fetchedUser?.email
      };

      response.data = {
        ...modifiedUser,
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
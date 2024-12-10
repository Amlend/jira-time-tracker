import { defineEventHandler, readBody } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import { createJwtToken } from "~/utils/jwtUtils";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id
 if (method === "GET") {
    return await getOneUser();
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function getOneUser() {
    try {
       const userId = event.context.params?.userId
        ? parseInt(event.context.params.userId, 10) // Parse as base 10 integer
        : null; //
      console.log("userId", userId)

      if(!userId){
        throw new Error("userId is not provided");
      }
      // Get all the events table details      
      const fetchedUser = await prisma.user.findFirst({
        where: {
          user_id: userId,
          org_id: orgId
        },
        select: {
          user_id: true,
          username: true,
          email: true
        },
      });
       

    //   const apiPath = `/rest/api/3/myself`
    // const myself = await callJiraApi(event ?? "", 'GET', apiPath)
    // console.log("myself", myself)

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
import { defineEventHandler, readBody } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import prisma from "~~/lib/prisma";
import TaskKey from "../[taskKey]";
 

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id
  const userSourceId = event.context.auth.userSourceId

  if (method === "DELETE") {
    const entryBody = await readBody(event);
    // const dataJira = await deleteJiraEntry(entryBody);
    // if(dataJira){
      const data = await deleteEntry(entryBody.timeEntryId);
    // }
    return data;
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function deleteEntry(entryId: number) {
    try {
      let timeEntry = await prisma.timeEntry.delete({
        where: {
          time_entry_id: entryId,
        },
      });
      response.data = {
        ...timeEntry,
      };
      return response
    } catch (error) {
      console.error(error);
      response.error = {
        message: "Something Went Wrong, Please Try Again Later!",
      };
      return response;
    }
  }

  async function deleteJiraEntry(entryBody: any){
    try{
      const api = `/rest/api/3/issue/${entryBody.taskKey}/worklog/${entryBody.sourceEntryId}`
      const result = await callJiraApi(event ?? "", 'DELETE', api)
      console.log("result", result)
      return result
    } catch (error) {
      console.error(error);
      response.error = {
        message: "Something Went Wrong, Please Try Again Later!",
      };
      return response;
    }
  }

});

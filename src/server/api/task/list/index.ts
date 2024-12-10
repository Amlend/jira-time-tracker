import { defineEventHandler, readBody, getQuery } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import prisma from "~~/lib/prisma";
 

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id
  const userSourceId = event.context.auth.userSourceId

  if (method === "GET") {
    const entryBody = await getQuery(event);
    const data = await getReport(entryBody);
    return data;
  } else {
    response.error = { message: "Invalid Request Method"};
    return response;
  }

  async function getReport(entryBody: any) {
    try {
        const { userIds, fromDate, toDate } = entryBody;

//         SELECT ts.task_id, ts.task_key, ts.task_source_id
// FROM "Task" as ts
// left join "TimeEntry" as te on te.task_id = ts.task_id
// left join "User" as u on u.user_id = te.user_id
// WHERE ts.org_id=1 and te.entry_time >= '2024-11-10' and te.entry_time <= '2024-11-22' and te.user_id=3
// ORDER BY "task_id";

        let query =
      'SELECT ts.task_id, ts.task_key, ts.task_source_id FROM "Task" as ts \n';
    query =
      query +
      ' left join "TimeEntry" as te on te.task_id = ts.task_id \n' +
      ' left join "User" as u on u.user_id = te.user_id \n'+
      ` where  ts.org_id=${orgId} and te.user_id in(${userIds}) and te.entry_time >= '${fromDate}' and te.entry_time <= '${toDate}'`;
    query = query + 'ORDER BY "task_id"';
    const report: any[] = await prisma.$queryRawUnsafe(query);
    
      response.data = {
        ...report,
      };
      return response

    } catch (error) {
      console.error(error);
      response.error = {
        message: "Something Went Wrong, Please Try Again Later!",
      };
      return response;
    }

    return response;
  } 

});

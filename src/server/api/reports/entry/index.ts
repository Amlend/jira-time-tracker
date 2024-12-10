import { defineEventHandler, readBody, getQuery } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id;
  const userSourceId = event.context.auth.userSourceId;

  if (method === "GET") {
    const entryBody = await getQuery(event);
    const data = await getReport(entryBody);
    return data;
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function getReport(entryBody: any) {
    try {
      const { userIds, fromDate, toDate, projectSourceId } = entryBody;
      const userList = userIds.split(",").map(Number);


//       SELECT ts.task_id, ts.task_key, ts.task_source_id, ts.icon, ts.title, ts.project_id, pj.project_source_id,
// te.time_entry_id, te.source_entry_id ,te.user_id, te.minutes, te.notes, te.entry_time,
// u.user_id, u.user_source_id, u.username
// FROM "TimeEntry" as te
// left join "Task" as ts on te.task_id = ts.task_id
// left join "Project" as pj on pj.project_id = ts.project_id
// left join "User" as u on u.user_id = te.user_id
// WHERE ts.org_id=2 and pj.project_source_id='10000' and te.entry_time >= '2024-11-10' and te.entry_time <= '2024-11-25' and te.user_id in (3)
// ORDER BY "task_id";

      const report = await prisma.timeEntry.findMany({
        where: {
          AND: [
            { task: { org_id: orgId } },
            { task: { project: { project_source_id: String(projectSourceId) } } },
            { entry_time: { gte: new Date(fromDate), lte: new Date(toDate) } },
            { user_id: { in: userList } }
          ]
        },
        include: {
          task: {
            select: {
              task_id: true,
              task_key: true,
              task_source_id: true,
              icon: true,
              title: true,
              project_id: true,
              project: { select: { project_source_id: true } }
            }
          },
          user: {
            select: {
              user_id: true,
              user_source_id: true,
              username: true
            }
          }
        },
        orderBy: {
          task_id: 'asc'
        }
      });

      response.data = {
        ...report,
      };
      return response;
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

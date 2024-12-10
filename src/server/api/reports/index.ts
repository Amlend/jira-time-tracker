import { defineEventHandler, readBody, getQuery } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import prisma from "~~/lib/prisma";
// import TaskKey from "../[taskKey]";
 

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id
  const userSourceId = event.context.auth.userSourceId
  // console.log("orgId", orgId)
  // console.log("event.context.auth", event.context.auth)

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

//         SELECT ts.task_id, ts.task_key, ts.task_source_id, ts.icon, ts.title,
// te.user_id, te.minutes, te.notes, te.entry_time,
// u.user_source_id, u.username
// FROM "Task" as ts
// left join "TimeEntry" as te on te.task_id = ts.task_id
// left join "User" as u on u.user_id = te.user_id
// WHERE ts.org_id=1 and te.entry_time >= '2024-11-10' and te.entry_time <= '2024-11-22' and te.user_id=3
// ORDER BY "task_id" LIMIT 300 OFFSET 0;

    //     let query =
    //   'SELECT ts.task_id, ts.task_key, ts.task_source_id, ts.icon, ts.title, ' +
    //   'te.user_id, te.minutes, te.notes, te.entry_time, u.user_source_id, u.username FROM "Task" as ts\n';
    // query =
    //   query +
    //   'left join "TimeEntry" as te on te.task_id = ts.task_id\n' +
    //   'left join "User" as u on u.user_id = te.user_id\n'+
    //   ` where  ts.org_id=${orgId} and te.user_id in(${userIds}) and te.entry_time >= '${fromDate}' and te.entry_time <= '${toDate}'`;
    // query = query + 'ORDER BY "task_id"';
    // const report: any[] = await prisma.$queryRawUnsafe(query);


    //   const TimeEntry = {
    //     id: createTimeEntry?.time_entry_id,
    //     orgId: createTimeEntry?.org_id,
    //     userId: createTimeEntry?.user_id,
    //     taskId: createTimeEntry?.task_id,
    //     projectId: createTimeEntry?.project_id,
    //     minutes: createTimeEntry?.minutes,
    //     entryDate: createTimeEntry?.entry_time,
    //     notes: createTimeEntry?.notes,
    //    };

    const report = await prisma.task.findMany({
      where: {
        org_id: orgId,
      },
      select: {
        task_id: true,
        task_key: true,
        task_source_id: true,
        icon: true,
        title: true,
        timeEntries: {
          where: {
            entry_time:{
              lte: new Date(toDate),
              gte: new Date(fromDate),
            }
          },
          select: {
            user_id: true,            
            minutes: true, 
            notes: true, 
            entry_time: true,
            user:{
              where: {
                user_id:{
                  in: [1, 3],
                }
              },
              select: {
                user_id: true,            
                user_source_id: true, 
                username: true,
              },

            }
          },
        },
      },
      orderBy: {
        task_id: "asc",
      },
    });

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

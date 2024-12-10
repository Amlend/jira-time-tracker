import { en } from "element-plus/es/locale/index.mjs";
import { defineEventHandler } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id
  
 if (method === "GET") {
    return await getOneTask();
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function getOneTask() {
    try {
      const taskKey = event.context.params?.taskKey;
      const queryData = await getQuery(event);

      const api = `/rest/api/3/issue/${taskKey}`
      const taskRes = await callJiraApi(event ?? "", 'GET', api)

      const task = await prisma.task.findFirst({
        where: {
          task_source_id: taskRes?.id,
          org_id: orgId
        },
        select: {
          task_id: true
        },
      });
      let wh = {}
      console.log("task", task)
      const entryDate: string = String(queryData?.entryDate ?? "")
      if (entryDate) {
        const parsedDate = new Date(entryDate);
        if (isNaN(parsedDate.getTime())) {
          throw new Error("Invalid entry Date format");
        }
        wh = {
         entry_time: {
           gte: new Date(parsedDate.setHours(0, 0, 0, 0)), // Start of the day
           lt: new Date(parsedDate.setHours(24, 0, 0, 0))  // Start of the next day
         }
       }
      }

      const fetchEntry = await prisma.timeEntry.findMany({
        where: {
          task_id: task?.task_id,
          org_id: orgId,
          ...wh
        },
        select: {
          time_entry_id: true,
          source_entry_id: true,
          user_id: true,
          org_id: true,
          task_id: true,
          project_id: true,
          entry_time: true,
          minutes: true,
          notes: true,
          task:{
            select: {
              task_id: true,
              task_source_id: true,
              task_key: true,
              title: true,
              icon: true
            }
          },
          user:{
            select: {
              user_id: true,            
              user_source_id: true, 
              username: true,
              photo_url: true,
            },
          }
        },
      });
      const timeEntry:any[] = [];

      fetchEntry.forEach((entry) => {
        timeEntry.push({
          timeEntryId: entry.time_entry_id,
          sourceEntryId: entry.source_entry_id,
          userId: entry.user_id,
          orgId: entry.org_id,
          taskId: entry.task_id,
          projectId: entry.project_id,
          entryTime: entry.entry_time,
          minutes: entry.minutes,
          notes: entry.notes,
          task: entry.task
            ? {
                taskId: entry.task.task_id,
                taskSourceId: entry.task.task_source_id,
                taskKey: entry.task.task_key,
                title: entry.task.title,
                icon: entry.task.icon
              }
            : null,
            user: entry.user
            ? {
                userId: entry.user.user_id,
                userSourceId: entry.user.user_source_id,
                username: entry.user.username,
                photoUrl: entry.user.photo_url,
              }
            : null,
        });
      });

      response.data = {
        ...timeEntry,
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
import { defineEventHandler, readBody } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import prisma from "~~/lib/prisma";
import TaskKey from "../[taskKey]";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id;
  const userSourceId = event.context.auth.userSourceId;

  if (method === "PUT") {
    const entryBody = await readBody(event);
    let dataJira;
    if (entryBody?.entries) {
      for (let entry of entryBody?.entries) {
        if (
          (entry?.timeEntryId && entry?.timeEntryId != "") ||
          (entry?.sourceEntryId && entry?.sourceEntryId != "")
        ) {
          if (entry?.timeEntryId && entry?.timeEntryId != "") {
            const data = await updateEntry(entry);
          }
          if (entry?.sourceEntryId && entry?.sourceEntryId != "") {
            dataJira = await updateJiraEntry(entry);
          }
        } else {
          dataJira = await createJiraEntry(entry);
          if (dataJira?.id) {
            const data = await createEntry(entry, dataJira?.id);
          }
        }
      }
    }
    return dataJira;
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function updateEntry(entryBody: any) {
    try {
      const entryData = {
        minutes: entryBody.minutes,
        entry_time: new Date(entryBody.entryDate),
        notes: entryBody?.notes,
      };

      const updateTimeEntry = await prisma.timeEntry.update({
        where: {
          time_entry_id: entryBody.timeEntryId
        },
        data: entryData,
      });

      const TimeEntry = {
        id: updateTimeEntry?.time_entry_id,
        sourceEntryID: updateTimeEntry?.source_entry_id,
        orgId: updateTimeEntry?.org_id,
        userId: updateTimeEntry?.user_id,
        taskId: updateTimeEntry?.task_id,
        projectId: updateTimeEntry?.project_id,
        minutes: updateTimeEntry?.minutes,
        entryDate: updateTimeEntry?.entry_time,
        notes: updateTimeEntry?.notes,
      };

      response.data = {
        ...TimeEntry,
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

  async function updateJiraEntry(entryBody: any) {
    try {
      const logSeconds = Math.round(entryBody.minutes * 60);
      const worklogData = {
        comment: {
          content: [
            {
              content: [
                {
                  text: entryBody.notes,
                  type: "text",
                },
              ],
              type: "paragraph",
            },
          ],
          type: "doc",
          version: 1,
        },
        started:
          new Date(entryBody.entryDate).toISOString().slice(0, -1) + "+0000",
        timeSpentSeconds: logSeconds,
      };

      const api = `/rest/api/3/issue/${entryBody.taskKey}/worklog/${entryBody.sourceEntryId}`;
      const taskRes = await callJiraApi(event ?? "", "PUT", api, worklogData);
      return taskRes;
    } catch (error) {
      console.error(error);
      response.error = {
        message: "Something Went Wrong, Please Try Again Later!",
      };
      return response;
    }
  }

  async function createEntry(entryBody: any, workLogId: string) {
    try {
      let task = await prisma.task.findFirst({
        where: {
          task_key: entryBody.taskKey,
          org_id: orgId,
        },
        select: {
          task_id: true,
          project_id: true,
        },
      });
      console.log("task from db", task);
      if (!task) {
        const api = `/rest/api/3/issue/${entryBody.taskKey}`;
        const taskRes = await callJiraApi(event ?? "", "GET", api);

        let project = await prisma.project.findFirst({
          where: {
            project_source_id: taskRes?.fields?.project?.id,
            org_id: orgId,
          },
          select: {
            project_id: true,
          },
        });
        if (!project) {
          project = await prisma.project.create({
            data: {
              project_source_id: taskRes?.fields?.project?.id,
              project_key: taskRes?.fields?.project?.key,
              name: taskRes?.fields?.project?.name,
              org_id: orgId,
            },
          });
        }
        task = await prisma.task.create({
          data: {
            task_source_id: taskRes?.id,
            task_key: taskRes?.key,
            org_id: orgId,
            title: taskRes?.fields?.summary,
            icon: taskRes?.fields?.issuetype?.iconUrl,
            project_id: project.project_id,
          },
        });
      }

      const user = await prisma.user.findFirst({
        where: {
          user_source_id: event.context.auth.userSourceId,
          org_id: orgId,
        },
        select: {
          user_id: true,
        },
      });

      const entryData = {
        org_id: orgId,
        user_id: user?.user_id,
        task_id: task.task_id,
        project_id: task.project_id,
        minutes: entryBody.minutes,
        source_entry_id: workLogId,
        entry_time: new Date(entryBody.entryDate),
        notes: entryBody?.notes,
      };
      console.log("entryData", entryData);

      const createTimeEntry = await prisma.timeEntry.create({
        data: entryData,
      });

      const TimeEntry = {
        id: createTimeEntry?.time_entry_id,
        sourceEntryID: createTimeEntry?.source_entry_id,
        orgId: createTimeEntry?.org_id,
        userId: createTimeEntry?.user_id,
        taskId: createTimeEntry?.task_id,
        projectId: createTimeEntry?.project_id,
        minutes: createTimeEntry?.minutes,
        entryDate: createTimeEntry?.entry_time,
        notes: createTimeEntry?.notes,
      };

      response.data = {
        ...TimeEntry,
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

  async function createJiraEntry(entryBody: any) {
    try {
      const logSeconds = Math.round(entryBody.minutes * 60);
      const worklogData = {
        comment: {
          content: [
            {
              content: [
                {
                  text: entryBody.notes,
                  type: "text",
                },
              ],
              type: "paragraph",
            },
          ],
          type: "doc",
          version: 1,
        },
        started:
          new Date(entryBody.entryDate).toISOString().slice(0, -1) + "+0000",
        timeSpentSeconds: logSeconds,
      };

      const api = `/rest/api/3/issue/${entryBody.taskKey}/worklog`;
      const taskRes = await callJiraApi(event ?? "", "POST", api, worklogData);
      return taskRes;
    } catch (error) {
      console.error(error);
      response.error = {
        message: "Something Went Wrong, Please Try Again Later!",
      };
      return response;
    }
  }
});

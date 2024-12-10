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
      const api = `/rest/api/3/issue/${taskKey}`;
      const taskRes = await callJiraApi(event ?? "", "GET", api);      

      let task = await prisma.task.findFirst({
        where: {
          task_key: taskKey,
          org_id: orgId
        },
        select: {
          task_id: true,
          project_id: true
        },
      });
      if(!task){
        let project = await prisma.project.findFirst({
          where: {
            project_source_id: taskRes?.fields?.project?.id
          },
          select: {
            project_id: true
          },
        });
        if(!project){
          project = await prisma.project.create({
            data: {
              project_source_id: taskRes?.fields?.project?.id,
              project_key: taskRes?.fields?.project?.key,
              name: taskRes?.fields?.project?.name,
              org_id: orgId
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
            project_id: project.project_id
          },
        });
      }

      const taskDetails = {
        taskId: task.task_id,
        taskSourceId: taskRes?.id,
        key: taskRes?.key,
        name: taskRes?.fields?.summary,
        icon: taskRes?.fields?.issuetype?.iconUrl,
        projectSourceId: taskRes?.fields?.project?.id,
      };

      response.data = {
        ...taskDetails,
      };
      return response;
    } catch (error) {
      console.error(error);
      response.error = {
        message: "Data Fetching Error, Please Try Again Later",
      };
    }
  }
});

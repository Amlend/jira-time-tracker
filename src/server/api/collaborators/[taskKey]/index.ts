import { defineEventHandler } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const orgId = event.context.auth.org.org_id
  const userSourceId = event.context.auth.userSourceId
  
 if (method === "GET") {
    return await getDetail();
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function getDetail() {
    try {
        const taskKey = event.context.params?.taskKey;
        const collaboratorsMap = new Map();
        if (!taskKey) {
            throw new Error("Task key is not provided");
          }
        if (userSourceId) {
          const user = await prisma.user.findFirst({
            where: {
              user_source_id: userSourceId,
              org_id: orgId,
              OR: [
                { username: null },
                { username: '' },
              ],
            },
            select: {
              user_id: true,
            },
          });
        
          if (user?.user_id) {
            const userApi = `/rest/api/3/user?accountId=${userSourceId}`;
            const userRes = await callJiraApi(event ?? "", "GET", userApi);
            await prisma.user.update({
              where: {
                user_id: user.user_id,
              },
              data: {
                username: userRes.displayName,
                photo_url: userRes.avatarUrls['48x48']
              },
            });
          }
        }

    const taskApi = `/rest/api/3/issue/${taskKey}`;
    const taskRes = await callJiraApi(event ?? "", "GET", taskApi);
    const originalEstimateSeconds =  Math.round(taskRes.fields.timetracking?.originalEstimateSeconds/60)
    const remainingEstimateSeconds = Math.round(taskRes.fields.timetracking?.remainingEstimateSeconds/60)
    const logged =   Math.round(taskRes.fields.timetracking?.timeSpentSeconds/60)

    const api = `/rest/api/3/issue/${taskKey}/worklog`
    const worklogData = await callJiraApi(event ?? "", 'GET', api)

    worklogData.worklogs.forEach((worklog:any) => {
      const excludedUsername = "Samay";
      const excludedUsername2 = "Timesheets by Appforest"
      // console.log("worklog", worklog)
      const displayName = worklog.author.displayName;
      if (displayName === excludedUsername || displayName === excludedUsername2) return;
      const accountId = worklog.author.accountId;
      const timeSpentSeconds = parseFloat(worklog.timeSpentSeconds);

      if (collaboratorsMap.has(accountId)) {
        collaboratorsMap.get(accountId).totalTime += timeSpentSeconds;
      } else {
        collaboratorsMap.set(accountId, {
          displayName,
          totalTime: Math.round(timeSpentSeconds/60),
        });
      }
    });

      const remoteWorklogData = await prisma.timeEntry.findMany({
        where: {
          task: { task_key: taskKey },
          org_id: orgId,
        },
        select: {
          task_id: true,
          minutes: true,
          user: {
            select: {
              user_source_id: true,
              username: true,
            },
          },
        },
      });

    remoteWorklogData.forEach((worklog) => {
      const accountId = worklog.user?.user_source_id;
      const timeSpentSeconds = worklog.minutes;
      const userName = worklog.user?.username;
    
      if (!accountId) return;
    
      if (collaboratorsMap.has(accountId)) {
        collaboratorsMap.get(accountId).totalTime += timeSpentSeconds;
      } else {
        collaboratorsMap.set(accountId, {
          displayName: userName,
          totalTime: timeSpentSeconds,
        });
      }
    });

    const result = Array.from(collaboratorsMap, ([accountId, { displayName, totalTime }]) => ({
      accountId,
      displayName,
      totalTime,
    }));

    const finalResult = {
      "result": result,
      "estimated": originalEstimateSeconds,
      "timeRemaining": remainingEstimateSeconds,
      "logged": logged
    }
      response.data = {
        ...finalResult,
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
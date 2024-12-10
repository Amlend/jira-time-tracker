import { defineEventHandler, readBody } from "h3";
import { callJiraApi } from "~/utils/jiraApi";
import { createJwtToken } from "~/utils/jwtUtils";
import prisma from "~~/lib/prisma";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.req.method;
  const userSourceId = event.context.auth.userSourceId
 if (method === "POST") {
    return await getJiraReport();
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function getJiraReport() {
    try {

    const {taskIds} = await readBody(event);
//     const formattedTaskIds = taskIds
//   .split(",") // Split the string by commas into an array
//   .map((id: string) => `${id.trim()}`).map(Number) // Add quotes around each ID and trim whitespace
//   .join(", ");
//   console.log("formattedTaskIds", formattedTaskIds)

const body = {
    "jql": "issue in ("+taskIds+")",
    "fields": [
        "project",
        "issuetype",
        "timeestimate",
        "timeoriginalestimate",
        "timetracking",
        "summary",
        "parent",
        "components",
        "fixVersions",
        "io.tempo.jira__team",
        "io.tempo.jira__account",
        "status",
        "account",
        "versions",
        "assignee",
        "labels"
    ],
    "properties": [
        "internal"
    ],
    "startAt": 0,
    "maxResults": 1000,
    "validateQuery": "warn"
}

     
    const apiPath = `/rest/api/2/search/`
    const tasks = await callJiraApi(event ?? "", 'POST', apiPath, body)
    console.log("tasks", tasks)

    

      response.data = {
        ...tasks,
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
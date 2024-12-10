import { defineEventHandler } from "h3";
import { callJiraApi } from "~/utils/jiraApi";

export default defineEventHandler(async (event) => {
  const response: { data: any; error: any } = { data: null, error: null };
  const method = event.node.req.method;
  const baseURL = event.context?.auth?.org?.base_url;

  if (method === "GET") {
    return await getOneTask();
  } else {
    response.error = { message: "Invalid Request Method" };
    return response;
  }

  async function getOneTask() {
    try {
      const { value } = getQuery(event);
      if (!value) {
        throw new Error(`Parameter value is empty!`);
      }
      const api = `/rest/api/3/issue/picker?currentJQL=project%20in%20projectsWhereUserHasPermission(%22Work%20on%20issues%22)%20order%20by%20lastViewed%20DESC&showSubTasks=true&showSubTaskParent=true&validateQuery=false&query=${value}`;
      const result = await callJiraApi(event ?? "", "GET", api);

      response.data = {
        baseURL,
        ...result,
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

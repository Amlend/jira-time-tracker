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
      const { userIds, fromDate, toDate } = entryBody;
      const startDate = new Date(fromDate);
      const endDate = new Date(toDate);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error("Invalid date format in parameters");
      }

      if (startDate > endDate) {
        throw new Error(
          "'from' date must be earlier than or equal to 'to' date"
        );
      }
      const days = [];
      let currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Check for weekends

        days.push({
          date: currentDate.toISOString().split("T")[0], // Format as YYYY-MM-DD
          dayOpen: true,
          requiredSeconds: isWeekend ? 0 : 28800, // 8 hours (28800 seconds) for working days
          type: isWeekend ? "NON_WORKING_DAY" : "WORKING_DAY",
        });

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      response.data = {
        ...days,
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

import { defineEventHandler, readBody } from "h3";
import prisma from "~~/lib/prisma";
import { callJiraApi } from "~/utils/jiraApi";


export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  const { clientKey, sharedSecret, baseUrl } = body;
  console.log(body)
  try {
    const org  = await prisma.organization.findFirst({
      where:{
        client_key: clientKey
      }
    })

    if(org){
      await prisma.organization.update({
        where: {
          org_id: org?.org_id,
        },
        data: {                 
          client_key: clientKey,
          shared_secret: sharedSecret,
          base_url: baseUrl,
          updated_at: new Date(),
          deleted_at: null
        }
      });
    }
    else{
      await prisma.organization.create({
        data: {
          client_key: clientKey,
          shared_secret: sharedSecret,
          base_url: baseUrl,
        }
      });
    }

    return {
      status: "success",
      message: "Installation data stored successfully",
    };
  } catch (error) {
    console.error("Error storing installation data:", error);
    return { status: "error", message: "Failed to store installation data" };
  }
});

import { defineEventHandler, readBody } from "h3";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { clientKey } = body;

  try {
    await prisma.organization.update({
      where: {
        client_key: clientKey,
      },
      data:{
        deleted_at: new Date()
      }
    });

    return {
      status: "success",
      message: "Uninstallation completed successfully",
    };
  } catch (error) {
    console.error("Error during uninstallation:", error);
    return { status: "error", message: "Failed to complete uninstallation" };
  }
});

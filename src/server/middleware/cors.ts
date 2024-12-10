import { defineEventHandler, setHeader } from "h3";

export default defineEventHandler((event) => {
  setHeader(
    event,
    "Access-Control-Allow-Origin",
    process.env.BASE_URL || "http://localhost:3000"
  );
  setHeader(
    event,
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  setHeader(
    event,
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  setHeader(event, "Access-Control-Allow-Credentials", "true");

  if (event.req.method === "OPTIONS") {
    event.res.statusCode = 204;
    event.res.statusMessage = "No Content";
    return "OK";
  }
});

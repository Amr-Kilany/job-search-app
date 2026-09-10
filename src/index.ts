import bootstrap from "./app.controller.js";

bootstrap().catch((err: unknown) => {
  console.error("Error during bootstrap:", err);
  process.exit(1);
});

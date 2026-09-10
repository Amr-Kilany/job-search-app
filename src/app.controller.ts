import "reflect-metadata";

import { createServer } from "node:http";
import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import chalk from "chalk";
import { graphqlHTTP } from "express-graphql";

import { env } from "./config/config.service.js";
import connectDB from "./DB/connection.js";
import { corsOptions } from "./Utils/cors/cors.utils.js";
import { customRateLimiter } from "./Middlewares/rate-limit.middleware.js";
import { successResponse } from "./Utils/response/success.response.js";
import { globalErrorHandler, NotFoundException } from "./Utils/response/error.response.js";
import { initSocket } from "./Utils/socket/socket.utils.js";
import { initCronJobs } from "./Utils/cron/cron.utils.js";
import { adminGraphQLSchema } from "./Modules/Admin/admin.graphql.js";
import { authenticate } from "./Middlewares/auth.middleware.js";
import {
  authRoutes,
  companyRoutes,
  userRoutes,
  applicationRoutes,
  chatRoutes,
  jobOpportunityRoutes,
} from "./Modules/index.js";
import { RoleEnum } from "./Utils/enums/user.enum.js";

const bootstrap = async (): Promise<void> => {
  const app: Express = express();
  const httpServer = createServer(app);

  initSocket(httpServer);
  initCronJobs();

  app.use(express.json());
  app.use(cors(corsOptions()));
  app.use(helmet());
  app.use(customRateLimiter());

  await connectDB();

  app.get("/", (req: Request, res: Response) => {
    successResponse({ res, message: `Welcome to the ${env.APP_NAME} API`, data: { status: "success" } });
  });

  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/company", companyRoutes);
  app.use("/api/v1/job", jobOpportunityRoutes);
  app.use("/api/v1/application", applicationRoutes);
  app.use("/api/v1/chat", chatRoutes);

  app.use("/api/v1/graphql", authenticate({ roles: [RoleEnum.ADMIN] }), (req: Request, res: Response) => {
    graphqlHTTP({
      schema: adminGraphQLSchema,
      graphiql: true,
      context: { headers: req.headers, user: (req as any).user, req },
    })(req, res);
  });

  app.all("/*dummy", (req: Request, res: Response) => {
    NotFoundException("Not Found Handler!!");
  });

  app.use(globalErrorHandler);

  httpServer.listen(env.PORT, () => {
    console.log(chalk.bgBlue(`Server running on port ${env.PORT}! (HTTP, WebSockets & GraphQL)`));
  });
};

export default bootstrap;

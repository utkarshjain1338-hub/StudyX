import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { CLERK_PROXY_PATH, clerkProxyMiddleware } from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

if (process.env.NODE_ENV === "production" && !process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is required in production");
}

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(clerkMiddleware());

app.use("/api", router);

app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

app.use(
  (err: unknown, req: Request, res: Response, next: NextFunction) => {
    logger.error({ err, path: req.path, body: req.body }, "Unhandled error");
    if (res.headersSent) {
      return next(err as Error);
    }

    const status =
      err && typeof err === "object" && "status" in err && typeof (err as any).status === "number"
        ? (err as any).status
        : 500;
    const message =
      err && typeof err === "object" && "message" in err && typeof (err as any).message === "string"
        ? (err as any).message
        : "Internal Server Error";

    res.status(status).json({ error: message });
  },
);

export default app;

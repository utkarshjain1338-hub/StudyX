import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tasksRouter from "./tasks";
import completionsRouter from "./completions";
import streaksRouter from "./streaks";
import dashboardRouter from "./dashboard";
import historyRouter from "./history";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/tasks", tasksRouter);
router.use("/completions", completionsRouter);
router.use("/streaks", streaksRouter);
router.use("/dashboard", dashboardRouter);
router.use("/history", historyRouter);

export default router;

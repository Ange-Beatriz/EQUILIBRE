import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { listSprints, createSprint } from "./sprint.controller";

const router = Router();

router.get("/", requireAuth, listSprints);
router.post("/", requireAuth, createSprint);

export default router;

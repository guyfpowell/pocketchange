import { Router } from "express";
import { registerSchema, loginSchema, refreshSchema } from "@pocketchange/shared";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
} from "./auth.controller";

const router = Router();

router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);
router.post("/refresh", validate(refreshSchema), refreshHandler);
router.post("/logout", authenticate, logoutHandler);

export default router;

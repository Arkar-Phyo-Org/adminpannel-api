import {
  getResetPasswordUserInfo,
  me,
  resetPassword,
} from "./../controllers/AuthController";
import { IsAuth } from "./../middlewares/auth";
import { Router } from "express";
import { body } from "express-validator";
import { Signin } from "../controllers/AuthController";

export const AuthRouter = Router();

AuthRouter.get("/me", IsAuth, me);

AuthRouter.get("/getResetPasswordUserInfo/:id", getResetPasswordUserInfo);

AuthRouter.post(
  "/signin",
  [body("email").notEmpty(), body("password").notEmpty()],
  Signin
);

AuthRouter.post(
  "/reset-password/:id",
  IsAuth,
  [body("password").notEmpty()],
  resetPassword
);

import { IsAuth } from "../middlewares/auth";
import {
  GetAllUser,
  CreateUser,
  UpdateUser,
  DeleteUser,
} from "./../controllers/UserController";
import { Router } from "express";
import { body } from "express-validator";

export const UserRouter = Router();

UserRouter.get("/", IsAuth, GetAllUser);

UserRouter.post(
  "/createUser",
  [body("name").notEmpty(), body("email").notEmpty()],
  IsAuth,
  CreateUser
);

UserRouter.put("/updateUser:id", IsAuth, UpdateUser);
UserRouter.delete("/:id", IsAuth, DeleteUser);

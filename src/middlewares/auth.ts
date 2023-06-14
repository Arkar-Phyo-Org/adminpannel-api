import { CreateError } from "./../helpers/errors";
import { NextFunction } from "express";
import { verifyToken } from "../helpers";

export const IsAuth = (req: any, res: any, next: NextFunction) => {
  try {
    const authHeader = req.get("Authorization");

    if (!authHeader)
      return next(CreateError(401, "authHeader Not Found or ERROR"));

    const accessToken = authHeader.split(" ")[1];

    if (!accessToken)
      next(CreateError(401, "accessToken Not found or ERROR !!"));

    const user = verifyToken(accessToken);

    if (!user)
      next(
        CreateError(401, "employee on verifyToken Not found or ERROR @@!", res)
      );
    req.user = user;
    next();
  } catch (error: any) {
    next(CreateError(500, error));
  }
};

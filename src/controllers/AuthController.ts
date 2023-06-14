import { hashedPassword, signinToken } from "./../helpers/index";
import { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma";
import { CreateError } from "../helpers/errors";
import { comparePassword } from "../helpers";
import { validationResult } from "express-validator";
import { v4 } from "uuid";

export const Signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentDate = new Date();
    const user = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        phoneNumber: true,
        role: true,
        accountStatus: true,
        userStatus: true,
        mailStatus: true,
        accountStatusTime: true,
      },
    });
    if (!user) {
      res.status(404).json({
        statusCode: 404,
        message: "User Not Found",
        success: false,
      });
      return next(CreateError(404, "USER NOT FOUND !!"));
    }
    const isPasswordCorrect = comparePassword(req.body.password, user.password);
    if (!isPasswordCorrect)
      return next(CreateError(404, "PASSWORD INCORRECT."));

    if (user.userStatus == 0 || user.accountStatus == 1) {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          userStatus: 1,
          accountStatusTime: currentDate,
          accountStatus: 2,
        },
      });
    }

    const accessToken = signinToken({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
    if (accessToken) {
      const { password, ...others } = user;
      res
        .cookie("accessToken", accessToken, {
          httpOnly: true,
        })
        .status(200)
        .json({
          success: true,
          statusCode: 200,
          message: "success",
          data: others,
          accessToken,
        });
    }
  } catch (error) {
    next(error);
  }
};

export const me = async (req: any, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error: any = new Error("Authenticated user");
      error.data = errors.array();
      error.statusCode = 422;
      throw error;
    } else {
      const user = req.user;

      const { password, ...others } = user;
      if (user) {
        res.status(200).json({
          data: others,
          message: "You are now authenticated.",
          statusCode: 200,
          success: true,
        });
      } else {
        res.status(401).json({
          statusCode: 401,
          message: `Authenticated no User`,
          success: false,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const getResetPasswordUserInfo = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    if (user) {
      const accessToken = signinToken({
        id: user.id,
        name: user.name,
        email: user.email,
      });
      res.status(200).json({
        success: true,
        statusCode: 200,
        message: "success",
        data: user,
        accessToken,
      });
    } else {
      res.status(200).json({
        success: false,
        statusCode: 404,
        message: "No User Found",
      });
    }
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: any = new Error("Authentication Error");
      error.data = errors.array();
      error.statusCode = 422;
      throw error;
    } else {
      const user = await prisma.user.update({
        where: {
          id: req.params.id,
        },
        data: {
          id: v4(),
          password: hashedPassword(req.body.password),
          accountStatus: 1,
          passwordOption: "newPassword",
        },
      });
      if (user) {
        res.status(200).json({
          statusCode: 200,
          success: true,
          message: "Password Reset Success.",
        });
      } else {
        res.status(422).json({
          statusCode: 422,
          success: false,
          message: "Password Reset Fail",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

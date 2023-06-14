import { NextFunction, Response } from "express";
import { validationResult } from "express-validator";
import prisma from "../lib/prisma";
import { SERVER_PORT } from "../config";

export const CreateSiteSettings = async (
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
      const user = req.user;
      const fileNm =
        req &&
        req.files &&
        req.files.siteLogo &&
        req.files.siteLogo[0].filename;
      const filePath = `http://127.0.0.1:${SERVER_PORT}/images/upload/${fileNm}`;

      const siteLogo = {
        optionName: "siteLogo",
        optionValue: filePath,
        createdById: user.id,
      };
      const transformedObject = Object.entries(req.body).map(
        ([key, value]) => ({
          optionName: key,
          optionValue: value,
          createdById: user.id,
        })
      );

      const options: any[] = [...transformedObject, siteLogo];
      const optionsWithNewOption = options.filter(
        (option) =>
          option.optionValue !== `http://127.0.0.1:8800/images/upload/undefined`
      );

      try {
        for (const data of optionsWithNewOption) {
          await prisma.siteSettings.upsert({
            where: {
              optionName: data.optionName,
            },
            update: {
              optionValue: data.optionValue,
              updatedById: data.createdById,
            },
            create: {
              optionName: data.optionName,
              optionValue: data.optionValue,
              createdById: data.createdById,
            },
          });
        }
        res.status(200)
          ? res.status(200).json({
              success: true,
              statusCode: 200,
              message: "Setting Create Success.",
            })
          : res.status(422).json({
              success: false,
              statusCode: 422,
              message: "Setting Create Fail",
            });
      } catch (error) {
        next(error);
      }
    }
  } catch (error) {
    next(error);
  }
};

export const GetSiteMetaSettings = async (
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
      const siteMetaSettings = await prisma.siteSettings.findMany({
        select: {
          id: true,
          optionName: true,
          optionValue: true,
        },
      });
      res.status(200).json({
        success: true,
        message: "success",
        statusCode: 200,
        data: siteMetaSettings,
      });
    }
  } catch (error) {
    next(error);
  }
};

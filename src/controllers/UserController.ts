import { validationResult } from "express-validator";
import { hashedPassword } from "../helpers/index";
import { NextFunction, Response } from "express";
import prisma from "../lib/prisma";
import generateDepartmentUserAddTemplate from "../templates/departmentUserAddTemplate";
import { sendEmail } from "../config/nodemailerConfig";
import Logging from "../lib/Logging";

/**
 * Status Definition
 * 1. mailStatus ( 0 = not-sent, 1 = sent )
 * 2. accountStatus ( 0 = pending, 1 = accepted, 2 = active, 4 = Inactive, 5 = Bann )
 * 3. userStatus ( 0 = new user, freshly created and not sign-in yet, 1 = user signed-in )
 *--------------------------------------------------------------------------------
 *
 * 1. Welcome Email
 *      - User Account Create စလုပ်ရင် Welcome EMail ပို့တယ်
 *      - mailStatus -> 1
 *      - accountStatus -> 0
 *      - userStatus -> 0
 * 2. User Reset Password
 *      - update password
 *      - set accountStatus to 1
 * 3. User Login
 *      - set accountStatus to 2
 *      - set userStatus to 1
 *      - set accountStatusTime to DateTime
 */

export const CreateUser = async (
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
      const authenticatedUser = req.user;

      const user = await prisma.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword(req.body.password),
          phoneNumber: req.body.phoneNumber,
          passwordOption: req.body.passwordOption,
          passwordReset: req.body.passwordReset,
          role: req.body.role,
          userStatus: 0,
          createdById: authenticatedUser.id,
        },
      });

      if (user) {
        // Sent Email for User Creation
        const data = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
        const mailReturn = await sentGreedingEmail(data);
        if (mailReturn) {
          await updateMailStatus(user.id, 1, 0);
        } else {
          return undefined;
        }
        // Normal Return
        res.status(200).json({
          statusCode: 200,
          success: true,
          message: "User Create Success.",
        });
      } else {
        res.status(422).json({
          statusCode: 422,
          success: false,
          message: "User Create Fail",
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const GetAllUser = async (
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
      const userLists = await prisma.user.findMany({
        where: {
          NOT: {
            role: "super_admin",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              createdAt: true,
            },
          },
          updatedBy: {
            select: {
              id: true,
              name: true,
              updatedAt: true,
            },
          },
        },
      });
      if (userLists.length > 0) {
        const usersWithoutPassword = userLists.map(
          ({ password, passwordReset, ...user }) => {
            return {
              ...user,
              passwordReset: !!passwordReset, // Convert number to boolean
            };
          }
        );

        res.status(200).json({
          message: "success",
          statusCode: 200,
          data: usersWithoutPassword,
        });
      } else {
        res.status(404).json({
          message: "No users found",
          statusCode: 404,
        });
      }
    }
  } catch (error) {
    next(error);
  }
};

/**
 * To do in future
 * Is it possible to update only user wanted to updte even on single request.
 * current saturation is prisma required update all of records in database.
 */
export const UpdateUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: any = new Error("UpdateUser");
      error.data = errors.array();
      error.statusCode = 422;
      throw error.data;
    } else {
      const authenticatedUser = req.user;
      const user = await prisma.user.update({
        where: {
          id: req.params.id,
        },
        data: {
          name: req.body.name,
          email: req.body.email,
          phoneNumber: req.body.phoneNumber,
          role: req.body.role,
          updatedById: authenticatedUser.id,
        },
      });
      {
        user
          ? res.status(200).json({
              success: true,
              message: "User Update Success",
              statusCode: 200,
            })
          : res.status(422).json({
              success: false,
              message: "User Update Fail",
              statusCode: 422,
            });
      }
    }
  } catch (error) {
    next(error);
  }
};

export const DeleteUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error: any = new Error("DeleteUser");
      error.data = errors.array();
      error.statusCode = 422;
      throw error.data;
    } else {
      const user = await prisma.user.delete({
        where: {
          id: req.params.id,
        },
      });
      {
        user
          ? res.status(200).json({
              success: true,
              message: "User Deleted Success",
              statusCode: 200,
            })
          : res.status(422).json({
              success: false,
              message: "User Delete Fail",
              statusCode: 422,
            });
      }
    }
  } catch (error) {
    next(error);
  }
};

interface sentGreedingEmail {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const sentGreedingEmail = async ({
  id,
  name,
  email,
  role,
}: sentGreedingEmail) => {
  const emailTemplate = generateDepartmentUserAddTemplate(
    `http://localhost:3000/auth/reset-password/${id}`,
    name,
    role
  );
  const mailResult = await sendEmail({
    to: email,
    subject: "Onboarding Invitation",
    html: emailTemplate.html,
  });
  return mailResult;
};

const updateMailStatus = async (
  userId: string,
  status: number,
  accountStatus: number
): Promise<string | undefined> => {
  try {
    const res = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        mailStatus: status,
        accountStatus: accountStatus,
      },
    });
    if (res) {
      return "Mail Sent";
    }
  } catch (error) {
    Logging.error(error);
  }

  return undefined; // Add this line to return a value when an error occurs
};

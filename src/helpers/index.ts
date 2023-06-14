import { compareSync, hashSync } from "bcrypt";
import { sign, verify } from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import { networkInterfaces } from "os";

export const hashedPassword = (password: string): string => {
  const hashPassword = hashSync(password, 12);
  return hashPassword;
};

export const comparePassword = (
  password: string,
  hashedPassword: string
): boolean => {
  const comparePassword = compareSync(password, hashedPassword);
  return comparePassword;
};

export const signinToken = (user: any) => {
  const accessToken = sign(user, JWT_SECRET, { expiresIn: "1d" });
  return accessToken;
};

export const verifyToken = (token: string) => {
  return verify(token, JWT_SECRET);
};

export const currentIP = () => {
  const nets = networkInterfaces();
  const cIp = Object.values(nets)
    .flat()
    .filter((item) => !item?.internal && item?.family === "IPv4")
    .find(Boolean)?.address;
  return cIp;
};

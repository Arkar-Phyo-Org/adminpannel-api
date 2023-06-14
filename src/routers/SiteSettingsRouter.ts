import {
  CreateSiteSettings,
  GetSiteMetaSettings,
} from "../controllers/SiteSettingsController";
import { IsAuth } from "./../middlewares/auth";
import { Router } from "express";

export const SiteSettingsRouter = Router();

SiteSettingsRouter.get("/getSiteMetaSettings", IsAuth, GetSiteMetaSettings);
SiteSettingsRouter.post("/createSiteSetting", IsAuth, CreateSiteSettings);

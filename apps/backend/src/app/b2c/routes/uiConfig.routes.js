import express from "express";
import { getWebsiteHero } from "../../../modules/uiConfig/uiConfig.controller.js";

const router = express.Router();

router.get("/website-hero", getWebsiteHero);

export default router;

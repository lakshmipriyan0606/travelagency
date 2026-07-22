import express from "express";
import { getActiveHero } from "../../../modules/websiteHero/websiteHero.controller.js";

const router = express.Router();

router.get("/active", getActiveHero);

export default router;

import express from "express";
import { subscribeNewsletter } from "../../../modules/newsletter/newsletter.controller.js";

const router = express.Router();

router.post("/subscribe", subscribeNewsletter);

export default router;

import express from "express";
import { getAllReviews } from "../../../modules/reviews/review.controller.js";

const router = express.Router();

router.get("/", getAllReviews);

export default router;

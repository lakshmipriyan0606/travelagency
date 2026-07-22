import express from "express";
import { getAllDestinations } from "../../../modules/destinations/destination.controller.js";

const router = express.Router();

router.get("/", getAllDestinations);

export default router;

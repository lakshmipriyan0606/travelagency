import reviewRoutes from "./review.routes.js";
import * as reviewController from "./review.controller.js";
import * as reviewService from "./review.service.js";
import * as reviewRepository from "./review.repository.js";
import * as reviewValidation from "./review.validation.js";
import * as reviewConstants from "./review.constants.js";
import { Review } from "./review.model.js";

export {
  reviewRoutes,
  reviewController,
  reviewService,
  reviewRepository,
  reviewValidation,
  reviewConstants,
  Review
};

export default reviewRoutes;

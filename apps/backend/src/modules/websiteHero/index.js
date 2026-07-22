import websiteHeroRoutes from "./websiteHero.routes.js";
import * as websiteHeroController from "./websiteHero.controller.js";
import * as websiteHeroService from "./websiteHero.service.js";
import * as websiteHeroRepository from "./websiteHero.repository.js";
import * as websiteHeroValidation from "./websiteHero.validation.js";
import * as websiteHeroConstants from "./websiteHero.constants.js";
import { WebsiteHero } from "./websiteHero.model.js";

export {
  websiteHeroRoutes,
  websiteHeroController,
  websiteHeroService,
  websiteHeroRepository,
  websiteHeroValidation,
  websiteHeroConstants,
  WebsiteHero
};

export default websiteHeroRoutes;

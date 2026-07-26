import newsletterRoutes from './newsletter.routes.js';
import * as newsletterController from './newsletter.controller.js';
import * as newsletterService from './newsletter.service.js';
import * as newsletterRepository from './newsletter.repository.js';
import * as newsletterValidation from './newsletter.validation.js';
import * as newsletterConstants from './newsletter.constants.js';
import { Newsletter } from './newsletter.model.js';

export {
  newsletterRoutes,
  newsletterController,
  newsletterService,
  newsletterRepository,
  newsletterValidation,
  newsletterConstants,
  Newsletter,
};

export default newsletterRoutes;

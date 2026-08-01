import analyticsAdminRoutes from './analytics.admin.routes.js';
import analyticsB2cRoutes from './analytics.b2c.routes.js';
import * as analyticsController from './analytics.controller.js';
import * as analyticsService from './analytics.service.js';
import * as analyticsRepository from './analytics.repository.js';
import * as analyticsValidation from './analytics.validation.js';
import * as analyticsConstants from './analytics.constants.js';
import { ApiHit } from './apiHit.model.js';
import { Visitor } from './visitor.model.js';

export {
  analyticsAdminRoutes,
  analyticsB2cRoutes,
  analyticsController,
  analyticsService,
  analyticsRepository,
  analyticsValidation,
  analyticsConstants,
  ApiHit,
  Visitor,
};

export default analyticsAdminRoutes;

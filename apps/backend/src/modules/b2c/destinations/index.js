import destinationRoutes from './destination.routes.js';
import * as destinationController from './destination.controller.js';
import * as destinationService from './destination.service.js';
import * as destinationRepository from './destination.repository.js';
import * as destinationValidation from './destination.validation.js';
import * as destinationConstants from './destination.constants.js';
import { Destination } from './destination.model.js';

export {
  destinationRoutes,
  destinationController,
  destinationService,
  destinationRepository,
  destinationValidation,
  destinationConstants,
  Destination,
};

export default destinationRoutes;

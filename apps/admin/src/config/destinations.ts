import { GLOBAL_CONFIG } from "./globalConfig";

export interface Destination {
  id: string;
  label: string;
  value: string;
}

export const STANDARDIZED_DESTINATIONS: Destination[] = GLOBAL_CONFIG.destinations;

export const destinationOptions = STANDARDIZED_DESTINATIONS.map(d => ({
  value: d.value,
  label: d.label
}));

export const MALAYSIA_CITIES = STANDARDIZED_DESTINATIONS.map(d => d.value);

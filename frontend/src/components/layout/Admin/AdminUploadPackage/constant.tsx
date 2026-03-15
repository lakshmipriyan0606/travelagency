import { GLOBAL_CONFIG } from "@/config/globalConfig";

export const packageTypes = GLOBAL_CONFIG.vacationTypes;

export const rankOptions = [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
];

export const slotTypeOptions = [
  { label: "Morning", value: "morning" },
  { label: "Noon", value: "noon" },
  { label: "Evening", value: "evening" },
  { label: "Full Day", value: "fullDay" },
];

export const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

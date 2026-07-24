import { GLOBAL_CONFIG } from "@/config/globalConfig";
import { RANK_SELECT_OPTIONS } from "@/config/rankConfig";

export const packageTypes = GLOBAL_CONFIG.vacationTypes;

export const rankOptions = RANK_SELECT_OPTIONS;

export const slotTypeOptions = [
    { label: "Morning", value: "morning" },
    { label: "Noon", value: "noon" },
    { label: "Evening", value: "evening" },
    { label: "Half Day", value: "halfDay" },
    { label: "Full Day", value: "fullDay" },
];

export const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
];

export const activityCategoryOptions = GLOBAL_CONFIG.activityCategories.map(cat => ({
    value: cat.value,
    label: cat.label
}));

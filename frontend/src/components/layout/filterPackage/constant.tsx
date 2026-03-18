// ─────────────────────────────────────────────────────────────────────────────
// Filter Configuration
// ─────────────────────────────────────────────────────────────────────────────
import { GLOBAL_CONFIG } from "@/config/globalConfig";

/**
 * The master filter configuration.
 * Keys = filter group names (used in form fields & URL params)
 * Values = array of option strings shown in the UI
 */
export const filterConfig = {
    packageType: ["Honeymoon", "Family", "Friends", "Group Tour", "Adventure"],
    activities: GLOBAL_CONFIG.activityCategories.map(c => c.value),
    daysAndNights: ["2 Days, 2 Nights", "3 Days, 2 Nights", "4 Days, 3 Nights", "7 Days, 6 Nights"],
    price: ["Below RM 1K", "RM 1K - RM 3K", "RM 3K - RM 5K", "Above RM 5K"],
};

export type FilterConfigKey = keyof typeof filterConfig;

// ─────────────────────────────────────────────────────────────────────────────
// Type helpers
// ─────────────────────────────────────────────────────────────────────────────

export type FilterState = {
    filterConfig: {
        [group: string]: { [value: string]: boolean };
    };
    country: string;
    city: string;
    search: string;
    sort: SortOption;
};

export type SortOption =
    | "default"
    | "az"
    | "za"
    | "price-low"
    | "price-high";

export const SORT_OPTIONS: { value: SortOption; label: string; icon: string }[] = [
    { value: "az", label: "A - Z", icon: "↑" },
    { value: "za", label: "Z - A", icon: "↓" },
    { value: "price-low", label: "Low - High", icon: "RM" },
    { value: "price-high", label: "High - Low", icon: "RM" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Default value generator (for react-hook-form)
// ─────────────────────────────────────────────────────────────────────────────

export const generateDefaultValues = (): FilterState => {
    const filterConfigDefaults: FilterState["filterConfig"] = {};

    Object.entries(filterConfig).forEach(([group, values]) => {
        filterConfigDefaults[group] = {};
        (values as readonly string[]).forEach((value) => {
            filterConfigDefaults[group][value] = false;
        });
    });

    return {
        filterConfig: filterConfigDefaults,
        country: "Malaysia",
        city: "",
        search: "",
        sort: "default",
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// Build empty filter state (all false) – used for clear
// ─────────────────────────────────────────────────────────────────────────────

export const buildEmptyFilterConfig = (): FilterState["filterConfig"] => {
    const obj: FilterState["filterConfig"] = {};
    Object.entries(filterConfig).forEach(([group, values]) => {
        obj[group] = {};
        (values as readonly string[]).forEach((val) => {
            obj[group][val] = false;
        });
    });
    return obj;
};

// ─────────────────────────────────────────────────────────────────────────────
// URL ↔ Filter serialisation helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build URL search params from current filter state.
 * Only includes non-default values to keep the URL clean.
 */
export const buildURLParams = (state: FilterState): URLSearchParams => {
    const params = new URLSearchParams();

    Object.entries(state.filterConfig).forEach(([group, values]) => {
        const active = Object.entries(values)
            .filter(([, checked]) => checked)
            .map(([val]) => val);
        if (active.length) params.set(group, active.join(","));
    });

    if (state.city) params.set("city", state.city);
    if (state.search) params.set("search", state.search);
    if (state.sort && state.sort !== "default") params.set("sort", state.sort);

    return params;
};

/**
 * Parse URL search params back into FilterState.
 * Creates a fresh default state then applies what's in the URL.
 */
export const parseURLParams = (search: string): FilterState => {
    const state = generateDefaultValues();
    const params = new URLSearchParams(search);

    // Restore checkbox filters
    Object.keys(filterConfig).forEach((group) => {
        const raw = params.get(group);
        if (raw) {
            raw.split(",").forEach((val) => {
                const trimmed = val.trim();
                if (state.filterConfig[group]?.[trimmed] !== undefined) {
                    state.filterConfig[group][trimmed] = true;
                }
            });
        }
    });

    state.city = params.get("city") ?? "";
    state.search = params.get("search") ?? "";
    state.sort = (params.get("sort") as SortOption) ?? "default";

    return state;
};

// ─────────────────────────────────────────────────────────────────────────────
// Package filtering logic
// ─────────────────────────────────────────────────────────────────────────────

export const filterPackages = (packages: any[], filters: FilterState): any[] => {
    let result = [...packages];

    // 1. Package Type
    const selectedTypes = Object.entries(filters.filterConfig?.packageType ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k.toLowerCase().trim());

    if (selectedTypes.length) {
        result = result.filter((pkg) =>
            selectedTypes.includes((pkg.packageType ?? "").toLowerCase().trim())
        );
    }

    // 2. Price
    const selectedBudgets = Object.entries(filters.filterConfig?.price ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k);

    if (selectedBudgets.length) {
        result = result.filter((pkg) => {
            const price = Number(pkg.offerPrice ?? pkg.price ?? 0);
            return selectedBudgets.some((range) => {
                if (range === "Below RM 1K") return price < 1000;
                if (range === "RM 1K - RM 3K") return price >= 1000 && price <= 3000;
                if (range === "RM 3K - RM 5K") return price > 3000 && price <= 5000;
                if (range === "Above RM 5K") return price > 5000;
                return false;
            });
        });
    }

    // 3. Days & Nights
    const selectedDays = Object.entries(filters.filterConfig?.daysAndNights ?? {})
        .filter(([, v]) => v)
        .map(([k]) => k.toLowerCase().trim());

    if (selectedDays.length) {
        result = result.filter((pkg) => {
            const pkgDays = (pkg.daysAndNights ?? pkg.days ?? "").toLowerCase().trim();
            return selectedDays.includes(pkgDays);
        });
    }


    // 4. City search
    if (filters.city) {
        const cityQuery = filters.city.toLowerCase().trim();
        result = result.filter(
            (pkg) =>
                (pkg.location ?? "").toLowerCase().includes(cityQuery) ||
                (pkg.city ?? "").toLowerCase().includes(cityQuery)
        );
    }

    // 6. Free-text search
    if (filters.search) {
        const q = filters.search.toLowerCase().trim();
        result = result.filter(
            (pkg) =>
                (pkg.packageName ?? "").toLowerCase().includes(q) ||
                (pkg.location ?? "").toLowerCase().includes(q) ||
                (pkg.packageType ?? "").toLowerCase().includes(q) ||
                (pkg.city ?? "").toLowerCase().includes(q)
        );
    }

    return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Package sorting logic
// ─────────────────────────────────────────────────────────────────────────────

export const sortPackages = (packages: any[], sort: SortOption): any[] => {
    if (!sort || sort === "default") return packages;

    return [...packages].sort((a, b) => {
        switch (sort) {
            case "az":
                return (a.packageName ?? "").localeCompare(b.packageName ?? "");
            case "za":
                return (b.packageName ?? "").localeCompare(a.packageName ?? "");
            case "price-low":
                return Number(a.offerPrice ?? a.price ?? 0) - Number(b.offerPrice ?? b.price ?? 0);
            case "price-high":
                return Number(b.offerPrice ?? b.price ?? 0) - Number(a.offerPrice ?? a.price ?? 0);
            default:
                return 0;
        }
    });
};

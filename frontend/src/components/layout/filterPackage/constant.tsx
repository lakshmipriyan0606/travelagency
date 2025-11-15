export interface PackageFilter {
    packageTypes: string[];
    budget: { min: number; max: number } | null;
    daysNights: string[];
    hotelRating: number | null;
}

export const generateDefaultValues = () => {
    const result: any = { filterConfig: {} };

    Object.entries(filterConfig).forEach(([group, values]) => {
        result.filterConfig[group] = {};
        values.forEach((value) => {
            result.filterConfig[group][value] = false;
        });
    });

    return result;
};



export const filterConfig = {
    packageTypes: ["Honeymoon", "Family", "Adventure"],
    budgets: ["Below $1K", "$1K - $3K", "$3K - $5K", "Above $5K"],
    daysAndNights: ["2 Days, 2 Nights", "4 Days, 3 Nights", "7 Days, 6 Nights"],
    ratings: ["5 Star", "4 Star", "3 Star"]
};




export const filterPackages = (packages: any[], filters: any) => {
    return packages.filter((pkg: any) => {

        // ----------------------------------------
        // 1. PACKAGE TYPES
        // ----------------------------------------
        const selectedTypes = Object.keys(filters.packageTypes || {}).filter(
            (t) => filters.packageTypes[t]
        );

        if (selectedTypes.length) {
            const normalizedType = pkg.packageType?.toLowerCase();

            const match = selectedTypes.some(
                (t) => t.toLowerCase() === normalizedType
            );

            if (!match) return false;
        }

        // ----------------------------------------
        // 2. BUDGET FILTER
        // ----------------------------------------
        const selectedBudgets = Object.keys(filters.budgets || {}).filter(
            (b) => filters.budgets[b]
        );

        if (selectedBudgets.length) {
            const price = pkg.price;

            const match = selectedBudgets.some((range) => {
                if (range === "Below $1K") return price < 1000;
                if (range === "$1K - $3K") return price >= 1000 && price <= 3000;
                if (range === "$3K - $5K") return price >= 3000 && price <= 5000;
                if (range === "Above $5K") return price > 5000;
                return false;
            });

            if (!match) return false;
        }

        // ----------------------------------------
        // 3. DAYS & NIGHTS (SKIPPED IF NO pkg.days)
        // ----------------------------------------
        const selectedDays = Object.keys(filters.daysAndNights || {}).filter(
            (d) => filters.daysAndNights[d]
        );

        if (selectedDays.length && pkg.days) {
            if (!selectedDays.includes(pkg.days)) return false;
        }

        // ----------------------------------------
        // 4. RATINGS
        // ----------------------------------------
        const selectedRatings = Object.keys(filters.ratings || {}).filter(
            (r) => filters.ratings[r]
        );

        if (selectedRatings.length) {
            const pkgRating = Math.floor(pkg.rating);

            const match = selectedRatings.some((r) => {
                const clean = parseInt(r.replace(" Star", ""));
                return clean === pkgRating;
            });

            if (!match) return false;
        }

        return true;
    });
};


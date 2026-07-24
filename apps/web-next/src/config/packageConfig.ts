/**
 * Global configuration for package-related settings.
 */
export const PACKAGE_CONFIG = {
    /** Number of packages to load initially and per "Load More" click */
    INITIAL_LOAD_LIMIT: 10,
    
    /** Default duration for showing loading skeletons or splash screens */
    LOADING_TIMEOUT: 2000,
    
    /** Common display strings */
    MESSAGES: {
        NO_PACKAGES_FOUND: "No Packages Found",
        LOAD_ERROR: "Failed to load packages",
        TRY_AGAIN: "Try Again",
        DISCOVER_BETTER: "Let’s discover something even better for your next trip."
    }
} as const;

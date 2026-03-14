import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Package, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GetPackageSuggestions } from "@/api/user/api";
import { NiceSelect } from "@/components/common/NiceSelect";

interface FilterSearchBarProps {
    country: string;
    setCountry: (val: string) => void;
    city: string;
    setCity: (val: string) => void;
    cities: string[];
    searchInput: string;
    setSearchInput: (val: string) => void;
    onSearch: () => void;
    packages: any[]; // Kept for backwards compatibility but unused for suggestions now
}

export default function FilterSearchBar({
    country,
    setCountry,
    city,
    setCity,
    cities,
    searchInput,
    setSearchInput,
    onSearch,
}: FilterSearchBarProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<{ locations: string[], packages: any[] }>({
        locations: [],
        packages: []
    });
    
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Auto-close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced Backend Search Suggestions
    useEffect(() => {
        const query = searchInput.trim();
        if (!query) {
            setSuggestions({ locations: [], packages: [] });
            return;
        }

        setIsLoading(true);
        const debounceTimeout = setTimeout(async () => {
            try {
                const results = await GetPackageSuggestions(query);
                setSuggestions({
                    locations: results?.locations || [],
                    packages: results?.packages || []
                });
            } catch (err) {
                console.error("Failed to load suggestions", err);
            } finally {
                setIsLoading(false);
            }
        }, 300); // 300ms debounce

        return () => clearTimeout(debounceTimeout);
    }, [searchInput]);

    const hasSuggestions = searchInput.trim().length > 0 && (suggestions.locations.length > 0 || suggestions.packages.length > 0);
    const showDropdown = isFocused && (hasSuggestions || isLoading);

    const handleSelectSuggestion = (text: string) => {
        setSearchInput(text);
        setIsFocused(false);
        // We delay the search slightly so the state has time to update
        setTimeout(() => {
            onSearch();
        }, 0);
    };

    return (
        <div className="relative w-full shadow-sm drop-shadow-sm border border-gray-200 rounded-md bg-gray-50 flex flex-col md:flex-row items-stretch md:items-center">
            {/* Left section: Dropdowns */}
            <div className="flex flex-row divide-x divide-gray-200 bg-gray-100/50 rounded-t-md md:rounded-l-md md:rounded-tr-none border-b md:border-b-0 md:border-r border-gray-200">
                <NiceSelect
                    value={country}
                    onValueChange={(val) => setCountry(val)}
                    options={[{ value: "Malaysia", label: "MALAYSIA" }]}
                    triggerClassName="min-w-[120px]"
                />
                
                <NiceSelect
                    value={city || "ALL CITIES"}
                    onValueChange={(val) => setCity(val === "ALL CITIES" ? "" : val)}
                    options={[
                        { value: "ALL CITIES", label: "ALL CITIES" },
                        ...cities.map((c) => ({ value: c, label: c.toUpperCase() }))
                    ]}
                    triggerClassName="min-w-[150px]"
                />
            </div>

            {/* Right section: Search input and button */}
            <div className="flex flex-1 relative bg-white" ref={dropdownRef}>
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => {
                        setSearchInput(e.target.value);
                        setIsFocused(true);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            setIsFocused(false);
                            onSearch();
                        }
                    }}
                    placeholder="Search by location, package, City"
                    className="flex-1 px-4 py-3 text-sm outline-none text-gray-800 tracking-wide"
                />

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 top-full left-0 right-14 mt-1 bg-white border border-gray-100 shadow-xl rounded-b-md overflow-hidden"
                        >
                            <div className="flex flex-col max-h-[300px] overflow-y-auto">
                                
                                {isLoading && (
                                    <div className="px-4 py-8 flex justify-center items-center">
                                        <Loader2 className="animate-spin text-primary" size={20} />
                                    </div>
                                )}

                                {!isLoading && suggestions.locations.length > 0 && (
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                        <h4 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">LOCATIONS IN {city || 'MALAYSIA'}</h4>
                                    </div>
                                )}
                                {!isLoading && suggestions.locations.map((loc, idx) => (
                                    <div
                                        key={`loc-${idx}`}
                                        onClick={() => handleSelectSuggestion(loc)}
                                        className="px-4 py-3 flex items-center gap-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 transition-colors"
                                    >
                                        <MapPin size={16} className="text-primary" />
                                        <span className="text-gray-700 text-sm font-medium">{loc}</span>
                                    </div>
                                ))}

                                {!isLoading && suggestions.packages.length > 0 && (
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                                        <h4 className="text-xs font-semibold text-gray-500 tracking-widest uppercase">MATCHING PACKAGES</h4>
                                    </div>
                                )}
                                {!isLoading && suggestions.packages.map((pkg) => (
                                    <div
                                        key={pkg._id}
                                        onClick={() => handleSelectSuggestion(pkg.packageName)}
                                        className="px-4 py-3 flex items-center gap-3 hover:bg-green-50 cursor-pointer border-b border-gray-50 transition-colors flex-nowrap overflow-hidden"
                                    >
                                        <Package size={16} className="text-emerald-500 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm truncate flex-1">{pkg.packageName}</span>
                                        {pkg.location && (
                                            <span className="text-xs text-gray-400 ml-2 flex-shrink-0 truncate max-w-[120px]">{pkg.location}</span>
                                        )}
                                    </div>
                                ))}

                                {!isLoading && !hasSuggestions && searchInput.trim().length > 0 && (
                                    <div className="px-4 py-4 text-center text-sm text-gray-500">
                                        No suggestions found for "{searchInput}"
                                    </div>
                                )}

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => {
                        setIsFocused(false);
                        onSearch();
                    }}
                    className="bg-[#f0a500] hover:bg-[#d99500] text-white w-14 flex items-center justify-center transition-colors rounded-br-md md:rounded-r-md md:rounded-br-none"
                    aria-label="Search"
                >
                    <Search size={20} />
                </button>
            </div>
        </div>
    );
}

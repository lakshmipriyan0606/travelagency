"use client";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useMemo } from "react";
import { filterPackages, generateDefaultValues } from "./constant";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { GetAllPackageList } from "@/api/user/api";
import PackageCard from "../packageCard/PackageCard";
import FilterConfigPage from "./filterConfigPage";

type FilterConfigForm = {
    filterConfig: {
        [key: string]: {
            [value: string]: boolean;
        };
    };
};

const FilterPackage = () => {
    const defaultValues = useMemo(() => generateDefaultValues(), []);

    const { data, isLoading, isError } = UseFetchAPIQuery({
        key: ["allPackage"],
        queryFn: GetAllPackageList,
    });

    const methods = useForm<FilterConfigForm>({
        defaultValues,
        mode: "onChange",
    });

    const filters = useWatch({
        name: "filterConfig",
        control: methods.control,
    });

    const removeDaysKey = (data: any) => {
        const { days, ...rest } = data;
        return rest;
    };

    const allPackageList =
        data?.data?.map((item: any) => removeDaysKey(item)) || [];
    const filteredPackages = useMemo(() => {
        return filterPackages(allPackageList, filters);
    }, [allPackageList, filters]);
    console.log('filteredPackages: ', filteredPackages);

    if (isLoading) return <p>Loading packages...</p>;
    if (isError) return <p>Error loading packages</p>;

    return (
        <FormProvider {...methods}>
            <div className="lg:p-6 grid grid-cols-12 gap-6 bg-[#3F4FB] h-full">
                {/* LEFT FILTER UI */}
                <div className="col-span-12 md:col-span-3 lg:col-span-3 md:sticky md:top-0 sm:h-screen sm:left-5 w-full">
                    <FilterConfigPage />
                </div>

                {/* RIGHT PACKAGE LIST */}
                <div className="col-span-12 md:col-span-9 p-2 md:h-screen md:overflow-y-auto sm:pr-2 lg:col-span-9">
                    <h2 className="text-xl font-roboto mb-3">
                        Packages ({filteredPackages.length})
                    </h2>

                    <PackageCard filterList={filteredPackages} />

                    {!filteredPackages.length && (
                        <p className="text-red-500 font-semibold mt-3">
                            No results found!
                        </p>
                    )}
                </div>
            </div>
        </FormProvider>
    );
};

export default FilterPackage;

import FilterPackage from "@/components/layout/filterPackage/FilterPackage";
import { Helmet } from "react-helmet-async";


const AllPackage = () => {
    return (
        <div className="w-full min-h-screen bg-white">
            <Helmet>
                <title>All Travel Packages & Tours | Travel Agency</title>
                <meta name="description" content="Browse all our travel packages, from family vacations to adventure tours. Find your perfect getaway with our easy filters." />
                <meta name="keywords" content="travel, packages, tours, vacation, all packages" />
            </Helmet>
            <FilterPackage likePackageOnly={false} mode="packages" />
        </div>

    );
};

export default AllPackage;

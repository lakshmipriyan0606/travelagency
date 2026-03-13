import FilterPackage from "@/components/layout/filterPackage/FilterPackage";

const AllPackage = () => {
    return (
        <div className="w-full min-h-screen bg-white">
            <FilterPackage likePackageOnly={false} />
        </div>
    );
};

export default AllPackage;

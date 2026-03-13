import FilterPackage from "@/components/layout/filterPackage/FilterPackage";

const FavouritePackage = () => {
    return (
        <div className="w-full min-h-screen bg-white">
            <FilterPackage likePackageOnly={true} />
        </div>
    );
};

export default FavouritePackage;

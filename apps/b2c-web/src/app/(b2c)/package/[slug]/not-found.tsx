import { PackageNotFound } from "@/components/layout/packageDetail/PackageClientComponents";

export default function NotFound() {
    return (
        <div className="min-h-screen pt-28 px-4 flex items-center justify-center">
            <PackageNotFound isActivity={false} />
        </div>
    );
}

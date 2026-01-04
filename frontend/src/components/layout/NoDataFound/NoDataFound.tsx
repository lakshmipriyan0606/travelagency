
import { AlertCircle } from "lucide-react";

interface NoDataFoundProps {
    message?: string;
    subMessage?: string;
}

const NoDataFound = ({
    message = "No Data Found",
    subMessage = "We couldn't find what you're looking for."
}: NoDataFoundProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-10 text-center w-full min-h-[300px]">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 font-roboto">{message}</h3>
            <p className="text-gray-500 max-w-md">{subMessage}</p>
        </div>
    );
};

export default NoDataFound;

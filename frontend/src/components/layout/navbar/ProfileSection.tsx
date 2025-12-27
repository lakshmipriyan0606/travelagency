import { GetLikePackageListCount } from "@/api/user/api";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { Heart, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

import BookingFomField from "../reachus/BookingFomField";

const ProfileSection = () => {
  const navigate = useNavigate();

  const { data } = UseFetchAPIQuery({
    key: ["likePackage"],
    queryFn: GetLikePackageListCount,
    options: {
      enabled: true,
    },
  });

  const handleNavigate = () => {
    navigate("/likePackage");
  };

  return (
    <div className="profile-section">
      <div className="flex items-center gap-4">

        {/* Like Icon */}
        <div
          className="profile-section-item flex items-center gap-1 cursor-pointer"
          onClick={handleNavigate}
        >
          <span className="heart-icon font-roboto">
            {data?.data || 0}
          </span>
          <Heart className="w-5 h-5" />
        </div>

        {/* Profile Modal */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button">
              <User className="w-5 h-5 cursor-pointer" />
            </button>
          </AlertDialogTrigger>

          <AlertDialogContent
            className="
              w-[95vw]
              sm:w-[500px]
              max-h-[90vh]
              p-0
              rounded-xl
              bg-white
              overflow-hidden
            "
          >
            {/* ✅ SCROLLABLE FORM AREA */}
            <div className="max-h-[70vh] overflow-y-auto p-4">
              <BookingFomField />
            </div>

            {/* ✅ FIXED FOOTER */}
            <AlertDialogFooter className="border-t p-3">
              <AlertDialogCancel>
                Cancel
              </AlertDialogCancel>

              <AlertDialogAction>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default ProfileSection;

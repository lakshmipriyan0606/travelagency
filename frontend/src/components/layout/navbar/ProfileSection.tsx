
import { GetLikePackageListCount } from "@/api/user/api";
import { UseFetchAPIQuery } from "@/Hook/UseFetchAPIQuery";
import { Heart, User } from "lucide-react"
import { useNavigate } from "react-router-dom";

const ProfileSection = () => {
  const navigate = useNavigate()
  const { data } = UseFetchAPIQuery({
    key: ["likePackage"],
    queryFn: GetLikePackageListCount,
    options: {
      enabled: true
    }
  });

  const handleNavigate = () => {
    navigate('/likePackage')
  }

  return (
    <div className="profile-section">
      {/* Desktop Profile Section */}
      <div className="flex items-center gap-3">
        <div className="profile-section-item" onClick={handleNavigate}>
          <span className="heart-icon font-roboto">{data?.data || 0}</span>
          <Heart className="w-5 h-5" />
        </div>
        {/* <div className="profile-section-item">
          <span className="heart-icon">1</span>
          <ShoppingCart className="w-5 h-5" />
        </div> */}
        <User className="w-5 h-5" />
      </div>
    </div>
  )
}

export default ProfileSection
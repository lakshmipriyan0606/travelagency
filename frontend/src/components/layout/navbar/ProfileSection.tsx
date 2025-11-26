
import { Heart, ShoppingCart, User } from "lucide-react"

const ProfileSection = () => {

  return (
    <div className="profile-section">
      {/* Desktop Profile Section */}
      <div className="flex items-center gap-3">
        <div className="profile-section-item">
          <span className="heart-icon">1</span>
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
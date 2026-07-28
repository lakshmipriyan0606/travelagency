import { 
  Package, 
  PlusCircle, 
  Sparkles, 
  ClipboardList, 
  ImageIcon, 
  Activity, 
  FileText, 
  PenTool, 
  MapPin, 
  Globe, 
  LayoutDashboard,
  Star,
  CalendarCheck,
  Briefcase
} from "lucide-react";

import { ROUTES } from "@/lib/routes";

export type AdminNavItem = {
  title: string;
  href: string;
  icon: any;
  children?: Omit<AdminNavItem, "children">[];
};

export const adminNavigation: AdminNavItem[] = [
  {
    title: "System Dashboard",
    href: ROUTES.dashboard,
    icon: LayoutDashboard,
  },
  {
    title: "Create New",
    href: "#",
    icon: PlusCircle,
    children: [
      { title: "Create Package", href: ROUTES.packages.new, icon: Package },
      { title: "Create Activity", href: ROUTES.activities.new, icon: Sparkles },
      { title: "Create Blog", href: ROUTES.blogs.new, icon: PenTool },
      { title: "Create Destination", href: ROUTES.destinations.new, icon: MapPin },
      { title: "Create Story", href: ROUTES.stories.new, icon: PlusCircle },
    ],
  },
  {
    title: "All Packages",
    href: ROUTES.packages.list,
    icon: Package,
  },
  {
    title: "All Activities",
    href: ROUTES.activities.list,
    icon: Activity,
  },
  {
    title: "All Blogs",
    href: ROUTES.blogs.list,
    icon: FileText,
  },
  {
    title: "All Destinations",
    href: ROUTES.destinations.list,
    icon: MapPin,
  },
  {
    title: "All Stories",
    href: ROUTES.stories.list,
    icon: Sparkles,
  },
  {
    title: "All Reviews",
    href: ROUTES.reviews.list,
    icon: Star,
  },
  {
    title: "Bookings",
    href: ROUTES.bookings,
    icon: CalendarCheck,
  },
  {
    title: "Media Gallery",
    href: ROUTES.media,
    icon: ImageIcon,
  },
  {
    title: "Website",
    href: "#",
    icon: Globe,
    children: [
      { title: "Hero Sections", href: ROUTES.website.hero, icon: ImageIcon },
    ]
  }
];

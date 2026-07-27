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

export type AdminNavItem = {
  title: string;
  href: string;
  icon: any;
  children?: Omit<AdminNavItem, "children">[];
};

export const adminNavigation: AdminNavItem[] = [
  {
    title: "System Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Create New",
    href: "#",
    icon: PlusCircle,
    children: [
      { title: "Create Package", href: "/admin/packages/new", icon: Package },
      { title: "Create Activity", href: "/admin/activities/new", icon: Sparkles },
      { title: "Create Blog", href: "/admin/blogs/new", icon: PenTool },
      { title: "Create Destination", href: "/admin/destinations/new", icon: MapPin },
      { title: "Create Story", href: "/admin/stories/new", icon: PlusCircle },
    ],
  },
  {
    title: "All Packages",
    href: "/admin/packages",
    icon: Package,
  },
  {
    title: "All Activities",
    href: "/admin/activities",
    icon: Activity,
  },
  {
    title: "All Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    title: "All Destinations",
    href: "/admin/destinations",
    icon: MapPin,
  },
  {
    title: "All Stories",
    href: "/admin/stories",
    icon: Sparkles,
  },
  {
    title: "All Reviews",
    href: "/admin/reviews",
    icon: Star,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarCheck,
  },
  {
    title: "Media Gallery",
    href: "/admin/media",
    icon: ImageIcon,
  },
  {
    title: "Website",
    href: "/admin/website",
    icon: Globe,
    children: [
      { title: "Hero Sections", href: "/admin/website/hero", icon: ImageIcon },
    ]
  }
];

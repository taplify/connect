import {
  ChartBarIcon,
  BuildingOfficeIcon,
  HomeIcon,
  WifiIcon,
  PhotoIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

export const menus = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: PhotoIcon,
  },
  {
    name: "Connections",
    href: "/connections",
    icon: UserGroupIcon,
  },
  {
    name: "NFC Cards",
    href: "/integrations",
    icon: WifiIcon,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: ChartBarIcon,
  },
  {
    name: "Organizations",
    href: "/organizations",
    icon: BuildingOfficeIcon,
  },
];

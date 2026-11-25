import {
  LinkIcon,
  LockOpenIcon,
  PhotoIcon,
  ShareIcon,
} from "@heroicons/react/24/solid";

export const quickActions = [
  {
    id: "add-link",
    title: "Add a link",
    description: "Quickly add a link to your digital profile",
    icon: LinkIcon,
    isPrimary: false,
  },
  {
    id: "edit-profile",
    title: "Edit Profile",
    description: "Edit the appearances of your profile",
    icon: PhotoIcon,
    isPrimary: false,
  },
  {
    id: "share-profile",
    title: "Share Profile",
    description: "Get your websit link and share away",
    icon: ShareIcon,
    isPrimary: false,
  },
  {
    id: "upgrade-plan",
    title: "Upgrade Plan",
    description: "Upgrade to Pro and enjoy more features!",
    icon: LockOpenIcon,
    isPrimary: true,
  },
];

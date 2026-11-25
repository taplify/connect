import { useState } from "react";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer";
import { EyeIcon } from "@heroicons/react/24/solid";

import ProfilePreview from "./ProfilePreview";

const ProfilePreviewDrawer = () => {
  const [previewDrawerOpen, setPreviewDrawerOpen] = useState(false);

  return (
    <Drawer open={previewDrawerOpen} onOpenChange={setPreviewDrawerOpen}>
      <DrawerTrigger className="flex items-center gap-2 rounded-full bg-primary-900 px-4 py-3 text-primary-50 focus:outline-none">
        <EyeIcon className="h-4 w-4" />
        <span className="text-sm">Preview</span>
      </DrawerTrigger>

      <DrawerContent className="h-[90%] bg-primary-50">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Preview</DrawerTitle>
          <DrawerDescription>Preview</DrawerDescription>
        </DrawerHeader>

        <div className="overflow-y-auto">
          <ProfilePreview />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ProfilePreviewDrawer;

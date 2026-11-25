import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { menus } from "@/consts/menus";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import { Bars3Icon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";

function Header() {
  const router = useRouter();
  const path = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("Profile");

  useEffect(() => {
    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        setProfileImage(data.image || null);
        setProfileName(data.name || "Profile");
      });
  }, []);

  const currentPage = menus.find((menu) => menu.href === path)?.name;

  const handleClick = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <header>
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-primary-700 lg:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon aria-hidden="true" className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-medium leading-6 text-primary-900">
          {currentPage}
        </div>
        <a href="/profile" aria-label="Open profile">
          <span className="sr-only">Your profile</span>
          {profileImage ? (
            <img
              alt={profileName}
              src={profileImage}
              className="h-8 w-8 rounded-full object-cover bg-gray-50"
            />
          ) : (
            <div className="grid h-8 w-8 place-items-center rounded-full bg-primary-100 text-primary-600">
              <UserCircleIcon className="h-7 w-7" aria-hidden="true" />
            </div>
          )}
        </a>
      </div>

      <Dialog
        open={sidebarOpen}
        onClose={setSidebarOpen}
        className="relative z-50"
      >
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-primary-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 flex">
          <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon
                    aria-hidden="true"
                    className="h-6 w-6 text-white"
                  />
                </button>
              </div>
            </TransitionChild>

            <div className="flex grow flex-col items-start gap-y-6 overflow-y-auto bg-white px-4 py-6">
              <div className="h-6 shrink-0 pl-2">
                <img
                  className="h-6 w-auto shrink-0 object-contain"
                  src="/logos/text-black-logo.svg"
                  alt="Taplify Logo"
                />
              </div>

              <nav className="w-full flex-1">
                <ul className="flex flex-1 flex-col gap-1">
                  {menus.map((menu) => (
                    <li key={menu.name}>
                      <button
                        onClick={() => handleClick(menu.href)}
                        className={clsx(
                          menu.name === currentPage
                            ? "bg-primary-50 text-primary-900"
                            : "text-primary-700",
                          "flex w-full items-center gap-3 rounded-lg p-3 transition-colors duration-200 hover:bg-primary-50/50 hover:text-primary-900",
                        )}
                      >
                        <menu.icon
                          className={clsx(
                            menu.name === currentPage
                              ? "fill-primary-900"
                              : "fill-transparent stroke-primary-900",
                            "h-6 w-6 shrink-0 stroke-1",
                          )}
                        />
                        <span
                          className={clsx(
                            menu.name === currentPage ? "font-medium" : "",
                            "text-sm transition-all duration-200",
                          )}
                        >
                          {menu.name}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </header>
  );
}

export default Header;

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { menus } from "@/consts/menus";
import {
  Bars3BottomLeftIcon,
  ChevronRightIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

const Sidebar = () => {
  const path = usePathname();
  const currentPage = menus.find((menu) => menu.href === path)?.name;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [profile, setProfile] = useState<{
    name: string | null;
    username: string | null;
    image: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setProfile(data));
  }, []);

  return (
    <div
      className={clsx(
        isCollapsed ? "w-[72px]" : "w-[250px]",
        "flex h-full min-h-0 flex-none flex-col divide-y divide-primary-100 overflow-hidden rounded-3xl bg-white transition-all duration-200",
      )}
    >
      <div
        className={clsx(
          isCollapsed
            ? "flex-col items-center justify-center gap-6 px-3 pb-5"
            : "flex-row justify-between pb-5 pl-6 pr-3",
          "flex pt-6 transition-all duration-200",
        )}
      >
        <div
          className={clsx(
            isCollapsed ? "h-4" : "h-6",
            "w-auto shrink-0 transition-all duration-200",
          )}
        >
          {isCollapsed ? (
            <img
              className="h-full w-full shrink-0 object-contain"
              src="/logos/letter-black-logo.svg"
              alt="Taplify Logo"
            />
          ) : (
            <img
              className="h-full w-full shrink-0 object-contain"
              src="/logos/text-black-logo.svg"
              alt="Taplify Logo"
            />
          )}
        </div>

        <button onClick={() => setIsCollapsed((prev) => !prev)}>
          <Bars3BottomLeftIcon className="h-6 w-6" />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto">
        <ul className="flex flex-1 flex-col gap-1 px-3 py-5">
          {menus.map((menu) => (
            <li key={menu.name}>
              <Link
                className={clsx(
                  menu.name === currentPage
                    ? "bg-primary-50 text-primary-900"
                    : "text-primary-700",
                  "duration- flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-primary-50/50 hover:text-primary-900",
                )}
                href={menu.href}
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
                    isCollapsed ? "hidden" : "",
                    menu.name === currentPage ? "font-medium" : "",
                    "text-sm transition-all duration-200",
                  )}
                >
                  {menu.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={clsx(
          isCollapsed ? "justify-center" : "pl-6 pr-3",
          "flex items-center gap-2 py-5 transition-all duration-200",
        )}
      >
        <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full">
          {profile?.image ? (
            <img
              className="h-full w-full object-cover"
              src={profile.image}
              alt={profile.name || "Profile"}
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-primary-100 text-primary-600">
              <UserCircleIcon className="h-7 w-7" aria-hidden="true" />
            </div>
          )}
        </div>

        <p
          className={clsx(
            isCollapsed ? "hidden" : "",
            "flex-1 text-sm text-primary-600 transition-all duration-200",
          )}
        >
          @{profile?.username || "profile"}
        </p>

        <ChevronRightIcon
          className={clsx(
            isCollapsed ? "hidden" : "",
            "h-4 w-4 text-primary-700 transition-all duration-200",
          )}
        />
      </div>
    </div>
  );
};

export default Sidebar;

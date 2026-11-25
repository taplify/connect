import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export type MenuOption = {
  name: string;
  icon?: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & React.RefAttributes<SVGSVGElement>
  >;
  action?: (id: string) => void;
};

type Props<T extends { id: string }> = {
  data: T;
  options: MenuOption[];
  children: React.ReactNode;
};

const DropdownMenu = <T extends { id: string }>({
  children,
  data,
  options,
}: Props<T>) => {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <MenuButton className="flex items-center rounded-full text-gray-900 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:ring-offset-2 focus:ring-offset-primary-50">
          <span className="sr-only">Open options</span>
          {children}
        </MenuButton>
      </div>

      <MenuItems
        transition
        className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="py-1">
          {options.map((option) => (
            <MenuItem key={option.name}>
              <button
                onClick={() => option.action?.(data.id)}
                className="group flex w-full items-center px-4 py-2 text-sm text-primary-900 transition-colors duration-200 data-[focus]:bg-primary-50 data-[focus]:outline-none"
              >
                {option.icon && (
                  <option.icon
                    aria-hidden="true"
                    className="mr-3 h-5 w-5 text-primary-900"
                  />
                )}
                {option.name}
              </button>
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default DropdownMenu;

"use client";
import { Switch } from "@headlessui/react";

type Props = {
  state?: "on" | "off";
  setState?: () => void;
};

export default function Toggle({ state = "off", setState }: Props) {
  return (
    <Switch
      checked={state === "on"}
      onChange={setState}
      className="group relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-primary-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-900 focus:ring-offset-2 data-[checked]:bg-primary-900"
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-primary-50 shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5"
      />
    </Switch>
  );
}

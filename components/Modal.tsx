"use client";
import clsx from "clsx";

import { ModalAction } from "@/types/modal";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actions: ModalAction[];
  children: React.ReactNode;
};

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  actions,
  children,
}: Props) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-primary-900 bg-opacity-80 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      {/* Modal Panel */}
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative w-full transform overflow-hidden rounded-lg bg-white p-4 text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:max-w-lg sm:p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Close button */}
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-white text-primary-400 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <XMarkIcon aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {/* Title */}
            <div className="text-center sm:text-left">
              <DialogTitle
                as="h3"
                className="text-base font-semibold text-gray-900"
              >
                {title}
              </DialogTitle>

              <div className="mt-1">
                <p className="text-sm text-gray-500">{description}</p>
              </div>

              {children && <div className="mt-6">{children}</div>}
            </div>

            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              {actions.map((action, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={action.onClick}
                  className={clsx(
                    action.variant === "primary"
                      ? "bg-primary-900 text-primary-50 hover:bg-primary-800"
                      : "bg-white text-primary-900 hover:bg-primary-50",
                    action.variant === "secondary"
                      ? "ring-1 ring-inset ring-primary-300"
                      : "",
                    "inline-flex w-full justify-center rounded-md px-3 py-2 text-sm font-medium shadow-sm transition-all duration-200 sm:ml-3 sm:mt-0 sm:w-auto",
                  )}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};

export default Modal;

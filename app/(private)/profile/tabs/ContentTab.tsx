import { useState } from "react";

import DropdownMenu from "@/components/DropdownMenu";
import EmptyState from "@/components/EmptyState";
import InputText from "@/components/form/InputText";
import Toggle from "@/components/form/Toggle";
import Modal from "@/components/Modal";
import { generateUniqueId } from "@/helpers/id";
import useModal from "@/hooks/modal";
import useProfileStore from "@/stores/profile";
import {
  ChevronUpDownIcon,
  EllipsisHorizontalIcon,
  LinkIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";

const ContentTab = () => {
  const { isAddLinkModalOpen, openAddLinkModal, closeAddLinkModal } =
    useModal("addLink");
  const { isEditLinkModalOpen, openEditLinkModal, closeEditLinkModal } =
    useModal("editLink");
  const { links, addLink, removeLink, editLink, toggleLinkVisibility } =
    useProfileStore();
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");

  const confirmAddLink = () => {
    const newLink = {
      id: generateUniqueId(),
      name: title,
      href: link,
      isHidden: false,
    };

    addLink(newLink);

    setTitle("");
    setLink("");
    closeAddLinkModal();
  };

  const confirmEditLink = () => {
    editLink({
      id,
      name: title,
      href: link,
      isHidden: false,
    });

    setId("");
    setTitle("");
    setLink("");
    closeEditLinkModal();
  };

  const handleEditLink = (id: string) => {
    const currentLink = links.find((link) => link.id === id);
    if (!currentLink) return;

    setId(currentLink.id);
    setTitle(currentLink.name);
    setLink(currentLink.href);
    openEditLinkModal();
  };

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-1 lg:gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-base font-medium lg:text-xl">Links</h2>
            <p className="text-xs text-primary-500 lg:text-sm">
              Your external or additional links
            </p>
          </div>

          {links.length > 0 && (
            <button
              onClick={openAddLinkModal}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-900 px-3 py-2 text-primary-50 ring-primary-900 ring-offset-2 transition-all duration-200 focus:outline-none enabled:hover:bg-primary-800 enabled:focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-fit"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="text-sm font-semibold">Add Link</span>
            </button>
          )}
        </div>

        {links.length > 0 ? (
          <div className="flex flex-col gap-4">
            {links.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 rounded-lg bg-primary-50 px-3 py-4"
              >
                <ChevronUpDownIcon className="size-6" />

                <div className="w-fit rounded-md bg-primary-900 p-2">
                  <LinkIcon className="size-4 stroke-[1.5px] text-primary-50" />
                </div>

                <div className="flex-1">
                  <p className="text-sm">{link.name}</p>
                </div>

                <Toggle
                  state={link.isHidden ? "off" : "on"}
                  setState={() => toggleLinkVisibility(link.id)}
                />

                <DropdownMenu
                  data={link}
                  options={[
                    {
                      name: "Edit",
                      icon: PencilSquareIcon,
                      action: handleEditLink,
                    },
                    {
                      name: "Delete",
                      icon: TrashIcon,
                      action: removeLink,
                    },
                  ]}
                >
                  <EllipsisHorizontalIcon
                    aria-hidden="true"
                    className="h-5 w-5"
                  />
                </DropdownMenu>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={LinkIcon}
            description="Add a link"
            onClick={openAddLinkModal}
          />
        )}
      </div>

      <Modal
        isOpen={isAddLinkModalOpen}
        onClose={closeAddLinkModal}
        title="Add Link"
        description="Add your external or additional links"
        actions={[
          {
            label: "Add Link",
            onClick: confirmAddLink,
            variant: "primary",
          },
        ]}
      >
        <div className="mt-2 flex flex-col gap-4">
          <InputText
            id="title"
            label="Title"
            value={title}
            onChange={setTitle}
          />
          <InputText id="link" label="Link" value={link} onChange={setLink} />
        </div>
      </Modal>

      <Modal
        isOpen={isEditLinkModalOpen}
        onClose={() => {
          setId("");
          setTitle("");
          setLink("");

          closeEditLinkModal();
        }}
        title="Edit Link"
        description="Edit the details of this link"
        actions={[
          {
            label: "Save",
            onClick: confirmEditLink,
            variant: "primary",
          },
        ]}
      >
        <div className="mt-2 flex flex-col gap-4">
          <InputText
            id="title"
            label="Title"
            value={title}
            onChange={setTitle}
          />
          <InputText id="link" label="Link" value={link} onChange={setLink} />
        </div>
      </Modal>
    </>
  );
};

export default ContentTab;

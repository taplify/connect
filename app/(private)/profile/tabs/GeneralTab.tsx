import { useEffect, useRef } from "react";

import EmptyState from "@/components/EmptyState";
import InputText from "@/components/form/InputText";
import Modal from "@/components/Modal";
import { socials } from "@/consts/socials";
import useModal from "@/hooks/modal";
import useProfileStore from "@/stores/profile";
import useUserStore from "@/stores/user";
import { FaceSmileIcon, TrashIcon } from "@heroicons/react/24/outline";
import { PlusIcon, UserIcon } from "@heroicons/react/24/solid";

const GeneralTab = () => {
  const {
    avatarFile,
    name,
    bio,
    email,
    phoneNumber,
    setAvatarFile,
    setName,
    setBio,
    setEmail,
    setPhoneNumber,
  } = useUserStore();
  const { socialLinks, addSocialLink, updateSocialLink, removeSocialLink } =
    useProfileStore();
  const addedSocials = socialLinks.map((socialLink) => socialLink.id);
  const socialOptions = socials.filter(({ id }) => !addedSocials.includes(id));
  const {
    isAddSocialLinkModalOpen,
    openAddSocialLinkModal,
    closeAddSocialLinkModal,
  } = useModal("addSocialLink");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAvatarFile(file);
  };

  // Scroll to last social link
  const socialLinksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (socialLinksRef.current) {
      const lastElement = socialLinksRef.current.lastElementChild;

      if (lastElement) {
        lastElement.scrollIntoView({
          behavior: "smooth",
          inline: "end",
        });
      }
    }
  }, [socialLinks]);

  return (
    <>
      <div className="flex flex-col gap-8 overflow-y-auto p-1 lg:gap-12">
        {/* Profile Picture */}
        <div>
          <h2 className="text-base font-medium lg:text-xl">Profile Picture</h2>
          <p className="text-xs text-primary-500 lg:text-sm">
            Upload a clear, professional photo of yourself.
          </p>

          <div className="mt-4">
            <label
              htmlFor="profile-picture"
              className="inline-block h-20 w-20 cursor-pointer overflow-hidden rounded-full bg-primary-100 shadow transition-all duration-200 hover:bg-primary-200 lg:h-24 lg:w-24"
            >
              {avatarFile ? (
                <img
                  className="h-full w-full object-cover"
                  src={URL.createObjectURL(avatarFile)}
                  alt=""
                />
              ) : (
                <div className="pt-2">
                  <UserIcon className="h-full w-full object-cover text-white" />
                </div>
              )}
            </label>

            <input
              type="file"
              id="profile-picture"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* About Me */}
        <div>
          <h2 className="text-base font-medium lg:text-xl">About Me</h2>
          <p className="text-xs text-primary-500 lg:text-sm">
            Display your name with a bio and contact details.
          </p>

          <div className="mt-4 flex flex-col gap-4 lg:mt-6 lg:gap-6">
            <InputText id="name" label="Name" value={name} onChange={setName} />
            <InputText id="bio" label="Bio" value={bio} onChange={setBio} />

            <div className="grid grid-cols-12 gap-4">
              <InputText
                id="phone-number"
                label="Phone Number"
                style="col-span-12 lg:col-span-4"
                value={phoneNumber}
                onChange={setPhoneNumber}
              />
              <InputText
                id="email"
                label="Email"
                style="col-span-12 lg:col-span-8"
                value={email}
                onChange={setEmail}
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col gap-4 lg:gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-base font-medium lg:text-xl">Social Links</h2>
              <p className="text-xs text-primary-500 lg:text-sm">
                Add your active social media links.
              </p>
            </div>

            {socialLinks.length > 0 && (
              <button
                onClick={openAddSocialLinkModal}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-900 px-3 py-2 text-primary-50 ring-primary-900 ring-offset-2 transition-all duration-200 focus:outline-none enabled:hover:bg-primary-800 enabled:focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 md:w-fit"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="text-sm font-semibold">Add Social</span>
              </button>
            )}
          </div>

          {socialLinks.length > 0 ? (
            <div
              ref={socialLinksRef}
              className="mt-2 flex flex-col gap-6 lg:mt-0"
            >
              {socialLinks.map(({ id, name, href, Logo, baseUrl }) => (
                <div key={id} className="flex items-center gap-3">
                  <Logo className="h-6 w-6 text-primary-900" />

                  {baseUrl ? (
                    <InputText
                      style="flex-1"
                      id={id}
                      label={name}
                      value={`@ ${href}`}
                      onChange={(value) => {
                        const handle = value.replace("@", "").trim();

                        updateSocialLink(id, handle);
                      }}
                    />
                  ) : (
                    <InputText
                      style="flex-1"
                      id={id}
                      label={name}
                      value={href}
                      onChange={(value) => updateSocialLink(id, value)}
                    />
                  )}

                  <button onClick={() => removeSocialLink(id)}>
                    <TrashIcon className="h-5 w-5 text-primary-700" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FaceSmileIcon}
              description="Add Social"
              onClick={openAddSocialLinkModal}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isAddSocialLinkModalOpen}
        onClose={closeAddSocialLinkModal}
        title="Add Social"
        description="Choose a social media to add"
        actions={[]}
      >
        <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
          {socialOptions.map(({ id, name, Logo, baseUrl }) => (
            <button
              key={id}
              className="flex items-center gap-2 rounded-lg border border-primary-300 p-3 shadow transition-all duration-200 hover:bg-primary-50"
              onClick={() => {
                addSocialLink({ id, name, Logo, href: "", baseUrl });
                closeAddSocialLinkModal();
              }}
            >
              <Logo className="h-6 w-6 flex-shrink-0" />
              <p className="text-sm font-medium">{name}</p>
            </button>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default GeneralTab;

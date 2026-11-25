import { create } from "zustand";

type SocialLink = {
  id: string;
  name: string;
  href: string;
  Logo: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
  baseUrl?: string;
};

type Link = {
  id: string;
  name: string;
  href: string;
  isHidden: boolean;
};

type ProfileStore = {
  socialLinks: SocialLink[];
  links: Link[];
  addSocialLink: (socialLink: SocialLink) => void;
  removeSocialLink: (id: string) => void;
  updateSocialLink: (id: string, href: string) => void;
  addLink: (link: Link) => void;
  removeLink: (id: string) => void;
  editLink: (link: Link) => void;
  toggleLinkVisibility: (id: string) => void;
};

const useProfileStore = create<ProfileStore>((set) => ({
  socialLinks: [],
  links: [],
  addSocialLink: (socialLink: SocialLink) =>
    set((state) => ({
      socialLinks: [...state.socialLinks, socialLink],
    })),
  removeSocialLink: (id: string) =>
    set((state) => ({
      socialLinks: state.socialLinks.filter(
        (socialLink) => socialLink.id !== id,
      ),
    })),
  updateSocialLink: (id: string, href: string) =>
    set((state) => ({
      socialLinks: state.socialLinks.map((socialLink) =>
        socialLink.id === id ? { ...socialLink, href } : socialLink,
      ),
    })),
  addLink: (link: Link) =>
    set((state) => ({
      links: [...state.links, link],
    })),
  removeLink: (id: string) =>
    set((state) => ({
      links: state.links.filter((link) => link.id !== id),
    })),
  editLink: (link: Link) =>
    set((state) => ({
      links: state.links.map((item) => (item.id === link.id ? link : item)),
    })),
  toggleLinkVisibility: (id: string) =>
    set((state) => ({
      links: state.links.map((link) =>
        link.id === id ? { ...link, isHidden: !link.isHidden } : link,
      ),
    })),
}));

export default useProfileStore;

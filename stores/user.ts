import { create } from "zustand";

type UserStore = {
  avatarFile: File | null;
  name: string;
  bio: string;
  phoneNumber: string;
  email: string;
  setAvatarFile: (avatarFile: File) => void;
  setName: (name: string) => void;
  setBio: (bio: string) => void;
  setPhoneNumber: (phoneNumber: string) => void;
  setEmail: (email: string) => void;
};

const useUserStore = create<UserStore>((set) => ({
  avatarFile: null,
  name: "",
  bio: "",
  phoneNumber: "",
  email: "",
  setAvatarFile: (avatarFile: File) => set({ avatarFile }),
  setName: (name: string) => set({ name }),
  setBio: (bio: string) => set({ bio }),
  setPhoneNumber: (phoneNumber: string) => set({ phoneNumber }),
  setEmail: (email: string) => set({ email }),
}));

export default useUserStore;

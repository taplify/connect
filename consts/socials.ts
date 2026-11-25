import InstagramLogo from "@/components/logo/InstagramLogo";
import LinkedInLogo from "@/components/logo/LinkedInLogo";
import TikTokLogo from "@/components/logo/TikTokLogo";
import XLogo from "@/components/logo/XLogo";
import YouTubeLogo from "@/components/logo/YouTubeLogo";

export const socials = [
  {
    id: "instagram",
    name: "Instagram",
    Logo: InstagramLogo,
    baseUrl: "https://instagram.com/",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    Logo: LinkedInLogo,
  },
  {
    id: "x",
    name: "X",
    Logo: XLogo,
    baseUrl: "https://x.com/",
  },
  {
    id: "tiktok",
    name: "TikTok",
    Logo: TikTokLogo,
    baseUrl: "https://tiktok.com/@",
  },
  {
    id: "youtube",
    name: "YouTube",
    Logo: YouTubeLogo,
  },
];

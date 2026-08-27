import {
  AiFillGithub,
  AiFillLinkedin,
  AiFillMail,
} from "react-icons/ai";
import type { IconType } from "react-icons";

export interface SocialLink {
  id: string;
  icon: IconType;
  link: string;
  label: string;
}

export const SOCIAL_MEDIA: SocialLink[] = [
  {
    id: "social-media-1",
    icon: AiFillLinkedin,
    link: "https://www.linkedin.com/in/shaikmofardeen/",
    label: "LinkedIn",
  },
  {
    id: "social-media-2",
    icon: AiFillGithub,
    link: "https://github.com/smfardeen7",
    label: "GitHub",
  },
  {
    id: "social-media-3",
    icon: AiFillMail,
    link: "https://mail.google.com/mail/?view=cm&fs=1&to=shaikfardeen595@gmail.com&su=Portfolio%20Inquiry",
    label: "Email",
  },
];

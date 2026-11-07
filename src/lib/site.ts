export interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface SocialLink {
  label: string;
  href: string;
  handle: string;
}

export const siteConfig = {
  name: "Thapar Venture Club",
  shortName: "TVC",
  tagline: "Ideate. Ascend. Lead.",
  description:
    "The official entrepreneurship and venture collective of Thapar Institute of Engineering & Technology, Patiala.",
  institution: "Thapar Institute of Engineering & Technology",
  location: "Bhadson Road, Patiala, Punjab 147004, India",
  contactEmail: "edc@thapar.edu",
  navigation: [
    { label: "Home", href: "/" },
    { label: "Events", href: "/events" },
    { label: "Speakers", href: "/speakers" },
    { label: "Team", href: "/team" },
  ] as const satisfies readonly NavItem[],
  socials: [
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/school/thaparventureclub/posts/",
      handle: "/company/thapar-venture-club",
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/tvc.tiet/",
      handle: "@thaparventureclub",
    },
    {
      label: "Facebook",
      href: "https://www.facebook.com/edctiet/",
      handle: "@thaparventure",
    },
  ] as const satisfies readonly SocialLink[],
  initiatives: [
    {
      id: "tvc-x-sat",
      title: "PRIMUS'26",
      edition: "Annual Competition",
      dateStatus: "Dates TBC",
      badge: "High-Stakes Competitions",
      descriptor:
        "Organising landmark annual competitions and national-level collaborations with institutions such as IIT Roorkee and Masters' Union, featuring case competitions, business planning challenges and B-Hackathons.",
      href: "/events/tvc-x-sat",
    },
    {
      id: "e-summit",
      title: "Flagship E-Summit",
      edition: "Flagship Edition",
      dateStatus: "Annual Flagship // TBC",
      badge: "Institutional Flagship",
      descriptor:
        "TIET's flagship entrepreneurship festival, featuring inspiring speaker sessions, interactive Q&A sessions, internship fairs, workshops and networking opportunities.",
      href: "/events/e-summit",
    },
  ] as const,
} as const;

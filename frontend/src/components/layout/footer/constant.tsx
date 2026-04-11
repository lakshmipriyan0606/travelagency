// import footerBg from '@/assets/icons/footerBG.svg'
import { GLOBAL_CONFIG } from '@/config/globalConfig'

export const footerData = {
  logo: GLOBAL_CONFIG.site.name,
  about:
    "We believe every journey should be more than just travel—it should be a story you cherish forever. Based on trust, care, and expertise, we design travel experiences that blend comfort, adventure, and culture. Whether it's exploring vibrant cities, relaxing getaways, or customized holiday plans, we make sure your trip is seamless and memorable. With dedicated service and carefully curated packages, Sastika Travels is your trusted partner for discovering the world in a way that feels personal and unique.",
  whatsapp: GLOBAL_CONFIG.contact.whatsappDisplay,
  email: GLOBAL_CONFIG.contact.email,
  cta: {
    title: "Let's Plan Your Perfect Malaysia Getaway",
    description: "Travel with confidence through one of the trusted Indian travel agencies in Malaysia, offering personalized tours, local expertise, and seamless travel experiences.",
    highlight: "Book Your Experience Now!",
    buttonText: "START YOUR JOURNEY",
    buttonHref: "/#reach-us-section",
    image: 'https://i.postimg.cc/2SpSJPd3/pexels-kuala-lumpur-1283140-jpg.jpg',
  },
  linkColumns: [
    {
      title: "Popular Destination",
      items: GLOBAL_CONFIG.destinations.map(d => ({
        label: d.label,
        href: "/allpackage"
      })),
    },
  ],
  social: [
    { name: "Facebook", href: "#", icon: "Facebook" },
    { name: "Instagram", href: "#", icon: "Instagram" },
  ],
  links: [
    { name: "Privacy Policy", href: "#" },
    { name: "Terms of Use", href: "#" },
    { name: "Sitemap", href: "#" },
  ],
  copyright: GLOBAL_CONFIG.site.copyright,
};

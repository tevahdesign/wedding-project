
import { Gem, Grape, PartyPopper } from "lucide-react";

export const features = [
  {
    title: "Best Wedding Planner",
    description: "We have a team of experts who will help you to plan your wedding from start to finish.",
    icon: Gem
  },
  {
    title: "Groom & Bride Gowns",
    description: "We have a wide range of gowns for the bride and groom. You can choose from a variety of designs.",
    icon: Grape
  },
  {
    title: "Perfect Decoration",
    description: "We have a team of experts who will help you to decorate your wedding venue.",
    icon: PartyPopper
  }
];

export const allYourNeeds = [
    {
        title: "Our Wedding Photography Ideas",
        imageUrl: "https://picsum.photos/seed/need1/400/300",
        imageHint: "wedding photography"
    },
    {
        title: "Our Wedding ideas & planning",
        imageUrl: "https://picsum.photos/seed/need2/400/300",
        imageHint: "wedding planning"
    },
    {
        title: "Bridal Wedding Dress & Groom Suit",
        imageUrl: "https://picsum.photos/seed/need3/400/300",
        imageHint: "wedding dress"
    },
    {
        title: "Our delicious food catering",
        imageUrl: "https://picsum.photos/seed/need4/400/300",
        imageHint: "wedding food"
    }
];

export const recentActivities = [
    { imageUrl: "https://picsum.photos/seed/activity1/600/800", alt: "Couple kissing", colSpan: 1, rowSpan: 2, width: 600, height: 800, imageHint: "couple kissing" },
    { imageUrl: "https://picsum.photos/seed/activity2/600/400", alt: "Hands with rings", colSpan: 1, rowSpan: 1, width: 600, height: 400, imageHint: "wedding rings" },
    { imageUrl: "https://picsum.photos/seed/activity3/600/400", alt: "Bride holding bouquet", colSpan: 1, rowSpan: 1, width: 600, height: 400, imageHint: "bride bouquet" },
    { imageUrl: "https://picsum.photos/seed/activity4/1200/400", alt: "Wedding dinner table", colSpan: 2, rowSpan: 1, width: 1200, height: 400, imageHint: "wedding dinner" },
    { imageUrl: "https://picsum.photos/seed/activity5/600/400", alt: "Wedding ceremony", colSpan: 1, rowSpan: 1, width: 600, height: 400, imageHint: "wedding ceremony" },
];


export const packages = [
  {
    name: "Basic Package",
    price: 310,
    features: [
      { name: "Wedding Planner", included: true },
      { name: "Wedding Decoration", included: true },
      { name: "Groom & Bride Gowns", included: false },
      { name: "Wedding Photography", included: false },
      { name: "Wedding Videography", included: false },
    ],
  },
  {
    name: "Standard Package",
    price: 700,
    features: [
      { name: "Wedding Planner", included: true },
      { name: "Wedding Decoration", included: true },
      { name: "Groom & Bride Gowns", included: true },
      { name: "Wedding Photography", included: true },
      { name: "Wedding Videography", included: false },
    ],
  },
  {
    name: "Premium Package",
    price: 1200,
    features: [
      { name: "Wedding Planner", included: true },
      { name: "Wedding Decoration", included: true },
      { name: "Groom & Bride Gowns", included: true },
      { name: "Wedding Photography", included: true },
      { name: "Wedding Videography", included: true },
    ],
  },
];

export const testimonials = [
  {
    quote: "WedEase made planning our wedding so much less stressful. The AI style quiz was spookily accurate! The team was amazing and helped us every step of the way.",
    name: "Jessica Miller",
    role: "Happy Client",
    avatar: "https://i.pravatar.cc/60?img=1",
  },
  {
    quote: "Our wedding website was beautiful and so easy to set up. Our guests loved it! I highly recommend WedEase to anyone planning a wedding.",
    name: "Sarah Davis",
    role: "Happy Client",
    avatar: "https://i.pravatar.cc/60?img=2",
  },
  {
    quote: "I don't know how we would have managed our guest list without this. A total lifesaver and the best decision we made for our wedding.",
    name: "Emily White",
    role: "Happy Client",
    avatar: "https://i.pravatar.cc/60?img=3",
  },
];

export const blogPosts = [
    {
        title: "10 Tips for a Stress-Free Wedding Day",
        excerpt: "Your wedding day should be the happiest day of your life. Here are 10 tips to ensure it's stress-free.",
        imageUrl: "https://picsum.photos/seed/blog1/400/300",
        imageHint: "happy couple",
        date: "May 20, 2024",
        author: "Jane Doe"
    },
    {
        title: "The Ultimate Guide to Choosing Your Wedding Venue",
        excerpt: "Finding the perfect venue is the first step to planning your dream wedding. Here's our ultimate guide.",
        imageUrl: "https://picsum.photos/seed/blog2/400/300",
        imageHint: "wedding venue",
        date: "May 15, 2024",
        author: "John Smith"
    },
    {
        title: "2024's Hottest Wedding Dress Trends",
        excerpt: "From minimalist gowns to bold statements, discover the hottest wedding dress trends for 2024.",
        imageUrl: "https://picsum.photos/seed/blog3/400/300",
        imageHint: "wedding dress fashion",
        date: "May 10, 2024",
        author: "Emily Clark"
    }
]

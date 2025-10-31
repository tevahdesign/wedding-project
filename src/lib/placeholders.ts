
import { Church, Camera, Utensils, Music, ClipboardList, Flower, Gem, Users, Wand2, Star, Heart } from "lucide-react";

export const features = [
  {
    title: "AI Style Discovery",
    description: "Use our AI-powered quiz to find your perfect wedding theme and color palette.",
    icon: Wand2
  },
  {
    title: "Smart Guest List",
    description: "Manage your guests, RSVPs, and groups all in one place, effortlessly.",
    icon: Users
  },
  {
    title: "Website Builder",
    description: "Create a beautiful, personalized wedding website in minutes. No coding required.",
    icon: Gem
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
    quote: "WedEase made planning our wedding so much less stressful. The AI style quiz was spookily accurate and the guest list manager was a lifesaver!",
    name: "Jessica & Tom",
  },
  {
    quote: "Our wedding website was beautiful and so easy to set up. Our guests loved it! I highly recommend WedEase to anyone planning a wedding.",
    name: "Sarah & David",
  },
  {
    quote: "An indispensable tool for modern wedding planning. It's intuitive, beautiful, and genuinely helpful. A total game-changer for us.",
    name: "Emily & James",
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

export const vendorCategories = [
    { id: 'venues', name: 'Venues', description: 'Find the perfect place', icon: Church },
    { id: 'photography', name: 'Photography', description: 'Capture your moments', icon: Camera },
    { id: 'catering', name: 'Catering', description: 'Delicious food options', icon: Utensils },
    { id: 'music', name: 'Music & DJs', description: 'Set the mood', icon: Music },
    { id: 'planners', name: 'Planners', description: 'Expert wedding help', icon: ClipboardList },
    { id: 'florists', name: 'Florists', description: 'Beautiful arrangements', icon: Flower },
];

export const popularVendors = [
    {
        id: 'vendor-1',
        name: 'The Grand Ballroom',
        category: 'Venue',
        priceRange: '$$$$',
        rating: 4.9,
        reviewCount: 128,
        isFeatured: true,
        isFavorited: true,
        imageId: 'vendor-grand-ballroom'
    },
    {
        id: 'vendor-2',
        name: 'Everlast Photo Co.',
        category: 'Photography',
        priceRange: '$$$',
        rating: 5.0,
        reviewCount: 97,
        isFeatured: false,
        isFavorited: false,
        imageId: 'vendor-everlast-photo'
    },
    {
        id: 'vendor-3',
        name: 'Gourmet Celebrations',
        category: 'Catering',
        priceRange: '$$',
        rating: 4.8,
        reviewCount: 204,
        isFeatured: false,
        isFavorited: false,
        imageId: 'vendor-gourmet-celebrations'
    }
];


"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle2, Heart, Star, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { testimonials, features, packages, blogPosts, recentActivities, allYourNeeds } from "@/lib/placeholders"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function RootPage() {

  const heroImage = PlaceHolderImages.find(
    (img) => img.id === "landing-hero"
  )

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-headline font-bold">WedEase</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Services
            </Link>
            <Link
              href="#testimonials"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Pricing
            </Link>
             <Link
              href="#blog"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Blog
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 md:pt-40 md:pb-24 relative overflow-hidden">
           <div className="absolute inset-0 -z-10 bg-secondary/30"></div>
           <div className="container mx-auto px-4">
             <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-headline font-bold !leading-tight tracking-tight">
                        Let's Plan for Your Dream <span className="text-primary">Wedding</span>
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        We are a team of professional wedding planners who will help you to make your dream wedding come true.
                    </p>
                    <div className="flex items-center gap-4">
                        <Button size="lg" asChild className="shadow-lg shadow-primary/20">
                            <Link href="/login">Get Started</Link>
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button size="icon" variant="outline" className="rounded-full">
                                <Phone className="h-5 w-5"/>
                            </Button>
                            <div>
                                <p className="text-sm text-muted-foreground">Call us now</p>
                                <p className="font-semibold">+1 234 567 890</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    {heroImage && (
                        <Image
                            src={heroImage.imageUrl}
                            alt={heroImage.description}
                            width={500}
                            height={600}
                            className="rounded-t-full shadow-2xl object-cover"
                            data-ai-hint={heroImage.imageHint}
                        />
                    )}
                    <div className="absolute -bottom-8 -left-8 bg-background p-4 rounded-full shadow-lg flex items-center gap-4">
                        <div className="flex -space-x-2">
                            <Image src="https://i.pravatar.cc/40?img=1" width={40} height={40} alt="user" className="rounded-full border-2 border-white"/>
                            <Image src="https://i.pravatar.cc/40?img=2" width={40} height={40} alt="user" className="rounded-full border-2 border-white"/>
                        </div>
                        <p className="text-sm font-semibold">1K+ Satisfied<br/>Clients</p>
                    </div>
                 </div>
             </div>
           </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Make your Plan with us</h2>
                        <p className="text-muted-foreground mb-8">
                            We are a team of professional wedding planners who will help you to make your dream wedding come true. We have a team of experts who will help you to plan your wedding from start to finish.
                        </p>
                        <div className="space-y-6">
                            {features.map(feature => (
                                <div key={feature.title} className="flex items-start gap-4">
                                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                                        <p className="text-muted-foreground text-sm">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="relative">
                         <Image src="https://picsum.photos/seed/wedding-couple/600/700" alt="Happy couple" width={600} height={700} className="rounded-[4rem] object-cover" data-ai-hint="wedding couple"/>
                         <div className="absolute -bottom-12 right-0 md:-right-12 bg-background/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border grid grid-cols-2 gap-4 text-center">
                            <div>
                                <p className="text-3xl font-bold text-primary">1K+</p>
                                <p className="text-sm text-muted-foreground">Weddings</p>
                            </div>
                             <div>
                                <p className="text-3xl font-bold text-primary">2K+</p>
                                <p className="text-sm text-muted-foreground">Happy Couples</p>
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </section>

        {/* All Your Need Section */}
        <section className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">All Your Need Is Here</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-12">We provide a wide range of services to make your wedding day unforgettable. From photography to catering, we've got you covered.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {allYourNeeds.map(item => (
                        <Card key={item.title} className="overflow-hidden text-left group">
                            <div className="h-64 overflow-hidden">
                               <Image src={item.imageUrl} alt={item.title} width={400} height={300} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-ai-hint={item.imageHint} />
                            </div>
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                                <Button variant="link" className="p-0">Learn More <ArrowRight className="ml-2 h-4 w-4"/></Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* Recent Activities */}
        <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-4 text-center">
                 <h2 className="text-4xl md:text-5xl font-headline font-bold mb-12">Our Recent Activities</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recentActivities.map((activity, index) => (
                        <div key={index} className={`overflow-hidden rounded-2xl group ${activity.colSpan === 2 ? 'md:col-span-2' : ''} ${activity.rowSpan === 2 ? 'row-span-2' : ''}`}>
                            <Image src={activity.imageUrl} alt={activity.alt} width={activity.width} height={activity.height} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-ai-hint={activity.imageHint}/>
                        </div>
                    ))}
                 </div>
                 <Button size="lg" className="mt-12">View More</Button>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-28 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">
                Our Best Wedding Package
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Choose the perfect package that suits your needs and budget. We offer a variety of options to make your dream wedding a reality.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              {packages.map((pkg, index) => (
                <Card
                  key={pkg.name}
                  className={`p-8 relative ${index === 1 ? "border-2 border-primary shadow-2xl scale-105" : "border"}`}
                >
                    {index === 1 && <Badge className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">Most Popular</Badge>}
                  <CardHeader className="text-center p-0 mb-6">
                    <p className="text-muted-foreground">{pkg.name}</p>
                    <p className="text-5xl font-bold tracking-tighter text-primary">
                      ${pkg.price}
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="space-y-4">
                      {pkg.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className={`w-5 h-5 ${feature.included ? 'text-green-500' : 'text-muted-foreground'}`}/>
                          <span className={`${!feature.included ? 'text-muted-foreground line-through' : ''}`}>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="p-0 mt-8">
                     <Button className="w-full" variant={index === 1 ? 'default' : 'outline'}>Choose Plan</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">
                What Our Clients Say
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.name}
                  className="p-8"
                >
                  <CardContent className="p-0 flex flex-col">
                    <div className="flex text-yellow-400 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6 flex-grow">
                      "{testimonial.quote}"
                    </p>
                    <div className="flex items-center gap-4">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-foreground">
                          {testimonial.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Latest Blog Section */}
        <section id="blog" className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Our Latest Blog</h2>
                <p className="max-w-2xl mx-auto text-muted-foreground mb-12">Get inspired with our latest wedding tips, trends, and real wedding stories.</p>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts.map(post => (
                        <Card key={post.title} className="overflow-hidden text-left group">
                            <div className="h-56 overflow-hidden">
                               <Image src={post.imageUrl} alt={post.title} width={400} height={300} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" data-ai-hint={post.imageHint} />
                            </div>
                            <CardContent className="p-6">
                                <p className="text-sm text-muted-foreground mb-2">{post.date} by {post.author}</p>
                                <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                                <Button variant="link" className="p-0">Read More <ArrowRight className="ml-2 h-4 w-4"/></Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <Button size="lg" className="mt-12">View All Posts</Button>
            </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 md:py-28 bg-background">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center bg-secondary/30 p-8 md:p-16 rounded-3xl">
                    <div>
                         <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Do You have any Plan?</h2>
                         <p className="text-muted-foreground mb-8">
                            Let's talk with us. We are happy to help you to plan your dream wedding.
                        </p>
                         <form className="space-y-4">
                            <Input placeholder="Your Name"/>
                            <Input type="email" placeholder="Your Email"/>
                            <Textarea placeholder="Your Message"/>
                            <Button className="w-full">Send</Button>
                         </form>
                    </div>
                    <div>
                        <Image src="https://picsum.photos/seed/contact-us/600/700" alt="Bride" width={600} height={700} className="rounded-3xl object-cover" data-ai-hint="bride smiling"/>
                    </div>
                </div>
            </div>
        </section>

      </main>

      <footer className="bg-primary/90 text-primary-foreground">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <Heart className="w-8 h-8" />
                <span className="text-2xl font-headline font-bold">
                  WedEase
                </span>
              </Link>
              <p className="max-w-sm text-primary-foreground/80">
                The modern way to plan your wedding. All your tools, one
                beautiful platform.
              </p>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#features"
                    className="text-primary-foreground/80 hover:text-primary-foreground"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="text-primary-foreground/80 hover:text-primary-foreground"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-primary-foreground/80 hover:text-primary-foreground"
                  >
                    Sign In
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-primary-foreground/80 hover:text-primary-foreground">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20">
          <div className="container mx-auto px-4 py-6 text-center text-primary-foreground/80">
            <p>
              &copy; {new Date().getFullYear()} WedEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

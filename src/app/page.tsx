
"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { testimonials, features } from "@/lib/placeholders"


export default function RootPage() {

  const heroImage = PlaceHolderImages.find(
    (img) => img.id === "landing-hero"
  )
  const featureImage = PlaceHolderImages.find(
    (img) => img.id === "landing-feature"
  )

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#FDD835,transparent)]"></div>
      </div>

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
              Features
            </Link>
            <Link
              href="#testimonials"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Testimonials
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
        <section className="pt-32 pb-20 md:pt-48 md:pb-24 relative overflow-hidden">
           <div className="container mx-auto px-4">
             <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-headline font-bold !leading-tight tracking-tight">
                        Your Dream Wedding, <span className="text-primary">Simplified</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-lg mx-auto md:mx-0">
                       All-in-one platform to plan your perfect day. From guest lists to website building, we've got you covered.
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <Button size="lg" asChild className="shadow-lg shadow-primary/20">
                            <Link href="/login">Start Planning For Free</Link>
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    {heroImage && (
                        <Image
                            src={heroImage.imageUrl}
                            alt={heroImage.description}
                            width={600}
                            height={600}
                            className="rounded-3xl shadow-2xl object-cover"
                            data-ai-hint={heroImage.imageHint}
                        />
                    )}
                 </div>
             </div>
           </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 bg-secondary/30">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    <div className="relative order-2 md:order-1">
                         {featureImage && <Image src={featureImage.imageUrl} alt={featureImage.description} width={600} height={700} className="rounded-3xl object-cover" data-ai-hint={featureImage.imageHint}/>}
                    </div>
                    <div className="order-1 md:order-2">
                        <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Powerful Tools, Effortless Planning</h2>
                        <p className="text-muted-foreground mb-8 text-lg">
                           From AI-powered suggestions to seamless guest management, WedEase brings all your wedding planning needs into one beautiful platform.
                        </p>
                        <div className="space-y-6">
                            {features.map(feature => (
                                <div key={feature.title} className="flex items-start gap-4">
                                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                                        <feature.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                         <Button asChild variant="link" className="p-0 mt-6 text-lg">
                            <Link href="/login">Explore all features <ArrowRight className="ml-2 h-5 w-5"/></Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">
                Loved by Couples Everywhere
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card
                  key={testimonial.name}
                  className="p-8 border-2"
                >
                  <CardContent className="p-0 flex flex-col h-full">
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
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

         {/* CTA Section */}
        <section className="py-20">
            <div className="container mx-auto px-4 text-center">
                <div className="bg-primary/90 text-primary-foreground rounded-3xl p-12">
                    <h2 className="text-4xl md:text-5xl font-headline font-bold mb-4">Ready to Start Planning?</h2>
                    <p className="max-w-2xl mx-auto mb-8">
                        Create your free account today and see how WedEase can bring your dream wedding to life. No credit card required.
                    </p>
                    <Button size="lg" variant="secondary" asChild className="shadow-lg">
                        <Link href="/login">Get Started for Free <ArrowRight className="ml-2 h-5 w-5"/></Link>
                    </Button>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                <span className="text-xl font-headline font-bold">
                  WedEase
                </span>
              </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} WedEase. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

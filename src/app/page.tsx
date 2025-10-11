"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle2, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useRouter } from "next/navigation"
import { useAuth } from "@/firebase"
import { useEffect } from "react"

const featurePoints = [
  "AI-powered style recommendations",
  "Customizable wedding websites",
  "Seamless guest list management",
  "Intuitive budget tracking",
]

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  const heroImage = PlaceHolderImages.find(img => img.id === 'website-template-1');

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-secondary">
        <Heart className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  
  if (user) return null;


  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-headline font-bold">WedEase</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/login">Get Started Free <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32">
            <div className="absolute inset-0 bg-secondary/50 -z-10"></div>
            <div className="absolute -top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-blob -z-20"></div>
            <div className="absolute -bottom-1/4 -right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-blob animation-delay-2000 -z-20"></div>
            
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6 text-center md:text-left">
                    <h1 className="text-5xl md:text-7xl font-headline font-bold !leading-tight">
                        Plan Your Dream <br/> Wedding, <span className="text-primary">Effortlessly.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto md:mx-0">
                        From guest lists to gift registries, WedEase brings all your wedding planning tools into one beautiful, easy-to-use platform.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4">
                        <Button size="lg" asChild className="w-full sm:w-auto">
                            <Link href="/login">Start Planning for Free</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                            <Link href="#features">Explore Features</Link>
                        </Button>
                    </div>
                    <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
                        <div className="flex -space-x-2">
                            <Image src="https://i.pravatar.cc/40?img=1" alt="User" width={40} height={40} className="rounded-full border-2 border-background" />
                            <Image src="https://i.pravatar.cc/40?img=2" alt="User" width={40} height={40} className="rounded-full border-2 border-background" />
                            <Image src="https://i.pravatar.cc/40?img=3" alt="User" width={40} height={40} className="rounded-full border-2 border-background" />
                        </div>
                        <div>
                            <div className="flex text-primary">
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                                <Star className="w-5 h-5 fill-current" />
                            </div>
                            <p className="text-sm text-muted-foreground">Loved by 10,000+ happy couples.</p>
                        </div>
                    </div>
                </div>
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                    {heroImage && 
                        <Image 
                            src={heroImage.imageUrl} 
                            alt={heroImage.description} 
                            fill 
                            className="object-cover" 
                            priority
                            data-ai-hint={heroImage.imageHint}
                        />
                    }
                </div>
            </div>
        </section>

        <section id="features" className="py-20 md:py-32">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-4xl md:text-5xl font-headline font-bold">All Your Wedding Needs, in One Place</h2>
                <p className="mt-4 mb-16 text-lg text-muted-foreground max-w-2xl mx-auto">
                    WedEase simplifies complexity. Focus on what truly matters - celebrating your love story.
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featurePoints.map((feature, index) => (
                        <div key={index} className="bg-card p-8 rounded-2xl shadow-lg hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300">
                            <CheckCircle2 className="w-10 h-10 text-primary mb-4" />
                            <h3 className="text-xl font-headline font-semibold mb-2">{feature}</h3>
                            <p className="text-muted-foreground">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-secondary/50 py-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} WedEase. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

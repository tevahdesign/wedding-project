
"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle2, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { useRouter } from "next/navigation"
import { useAuth } from "@/firebase"
import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"

const featurePoints = [
  {
    title: "AI-Powered Style Quiz",
    description: "Answer a few questions and let our AI discover your perfect wedding aesthetic, from colors to themes.",
    icon: <Heart className="w-10 h-10 text-primary" />,
    image: PlaceHolderImages.find(img => img.id === 'website-template-2')
  },
  {
    title: "Customizable Website",
    description: "Create a beautiful, personal wedding website in minutes. Share your story, details, and registry with guests.",
    icon: <CheckCircle2 className="w-10 h-10 text-primary" />,
     image: PlaceHolderImages.find(img => img.id === 'website-template-1')
  },
  {
    title: "Guest & RSVP Tracking",
    description: "Easily manage your guest list, send digital invitations, and track RSVPs all in one place.",
    icon: <Star className="w-10 h-10 text-primary" />,
    image: PlaceHolderImages.find(img => img.id === 'invitation-template-1')
  },
]

const testimonials = [
  {
    quote: "WedEase made planning our wedding so much less stressful. The AI style quiz was spookily accurate!",
    name: "Jessica & Tom",
    avatar: "https://i.pravatar.cc/60?img=1"
  },
  {
    quote: "Our wedding website was beautiful and so easy to set up. Our guests loved it!",
    name: "Sarah & David",
    avatar: "https://i.pravatar.cc/60?img=2"
  },
  {
    quote: "I don't know how we would have managed our guest list without this. A total lifesaver.",
    name: "Emily & Mark",
    avatar: "https://i.pravatar.cc/60?img=3"
  }
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
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-muted-foreground hover:text-primary transition-colors font-medium">Features</Link>
            <Link href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors font-medium">Testimonials</Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-primary transition-colors font-medium">Pricing</Link>
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
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 text-center overflow-hidden">
            <div className="absolute inset-0 -z-10">
              {heroImage && (
                <Image 
                  src={heroImage.imageUrl}
                  alt="Wedding background"
                  fill
                  className="object-cover opacity-20"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            </div>
            
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-headline font-bold !leading-tight tracking-tight">
                        Your Dream Wedding, <br/> <span className="text-primary">Perfectly Planned.</span>
                    </h1>
                    <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        From AI-powered style suggestions to seamless guest management, WedEase is the only tool you need to plan your special day with joy and ease.
                    </p>
                    <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Button size="lg" asChild className="w-full sm:w-auto shadow-lg shadow-primary/20">
                            <Link href="/login">Start Planning for Free</Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                            <Link href="#features">Explore Features</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
        
        <section id="features" className="py-20 md:py-32 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">All-in-One Wedding Planning</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                WedEase brings together everything you need into one simple, beautiful platform. Say goodbye to spreadsheets and hello to stress-free planning.
              </p>
            </div>
            <div className="grid gap-16">
              {featurePoints.map((feature, index) => (
                <div key={feature.title} className={`grid md:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'md:grid-flow-row-dense' : ''}`}>
                  <div className={`space-y-4 ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                    <div className="inline-block bg-primary/10 p-3 rounded-full">
                      {feature.icon}
                    </div>
                    <h3 className="text-3xl font-headline font-bold">{feature.title}</h3>
                    <p className="text-muted-foreground text-lg">{feature.description}</p>
                    <Button variant="link" className="p-0 text-lg">
                      Learn More <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                  <div className={`aspect-video rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 ${index % 2 === 1 ? 'md:col-start-1' : ''}`}>
                    {feature.image && (
                      <Image 
                        src={feature.image.imageUrl}
                        alt={feature.description}
                        width={800}
                        height={600}
                        className="object-cover w-full h-full"
                        data-ai-hint={feature.image.imageHint}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
             <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-headline font-bold">Loved by Couples Everywhere</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of happy couples who planned their dream wedding with WedEase.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="p-8 border-2 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0 flex flex-col items-center text-center">
                    <div className="flex text-primary mb-4">
                      {[...Array(5)].map((_,i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                    <p className="text-lg font-medium mb-6 flex-grow">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4">
                      <Image src={testimonial.avatar} alt={testimonial.name} width={50} height={50} className="rounded-full" />
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-secondary/50 border-t">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-4 gap-8">
             <div className="col-span-1 md:col-span-2 space-y-4">
               <Link href="/" className="flex items-center gap-2">
                  <Heart className="w-8 h-8 text-primary" />
                  <span className="text-2xl font-headline font-bold">WedEase</span>
                </Link>
                <p className="text-muted-foreground max-w-sm">The modern way to plan your wedding. All your tools, one beautiful platform.</p>
             </div>
             <div>
                <h4 className="font-headline font-semibold mb-4">Product</h4>
                <ul className="space-y-2">
                    <li><Link href="#features" className="text-muted-foreground hover:text-primary">Features</Link></li>
                    <li><Link href="#pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
                    <li><Link href="/login" className="text-muted-foreground hover:text-primary">Sign In</Link></li>
                </ul>
             </div>
              <div>
                <h4 className="font-headline font-semibold mb-4">Company</h4>
                <ul className="space-y-2">
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">Careers</Link></li>
                    <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                </ul>
             </div>
          </div>
        </div>
        <div className="border-t">
           <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
             <p>&copy; {new Date().getFullYear()} WedEase. All rights reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  )
}

    
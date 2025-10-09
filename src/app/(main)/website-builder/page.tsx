import Image from "next/image"
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function WebsiteBuilderPage() {
  const template1 = PlaceHolderImages.find(img => img.id === 'website-template-1');
  const template2 = PlaceHolderImages.find(img => img.id === 'website-template-2');

  return (
    <>
      <PageHeader
        title="Wedding Website Builder"
        description="Craft a beautiful home for your wedding story."
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Website Details</CardTitle>
              <CardDescription>Fill in the details for your personal wedding website. You can always change this later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="couple-names">Couple's Names</Label>
                <Input id="couple-names" placeholder="e.g., Alex & Jordan" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wedding-date">Wedding Date</Label>
                <DatePicker />
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome-message">Welcome Message</Label>
                <Textarea id="welcome-message" placeholder="Share a message with your guests..." />
              </div>
               <div className="space-y-2">
                <Label htmlFor="vanity-url">Your Custom URL</Label>
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-l-md border border-r-0">wed-ease.com/</span>
                  <Input id="vanity-url" placeholder="alex-and-jordan" className="rounded-l-none" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {template1 && (
                <div className="relative border-2 border-primary rounded-lg overflow-hidden cursor-pointer">
                  <Image src={template1.imageUrl} alt={template1.description} width={800} height={600} className="w-full" data-ai-hint={template1.imageHint}/>
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white bg-primary px-3 py-1 rounded-full text-sm">Selected</span>
                  </div>
                </div>
              )}
              {template2 && (
                <div className="relative border-2 border-transparent rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors">
                  <Image src={template2.imageUrl} alt={template2.description} width={800} height={600} className="w-full opacity-70" data-ai-hint={template2.imageHint} />
                </div>
              )}
            </CardContent>
          </Card>
          <Button className="w-full" size="lg">Save & View Website</Button>
        </div>
      </div>
    </>
  )
}

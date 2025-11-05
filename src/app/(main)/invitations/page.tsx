
import Image from "next/image"
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Send } from "lucide-react"

export default function InvitationsPage() {
  const invitationTemplate = PlaceHolderImages.find(img => img.id === 'invitation-template-1');

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Digital Invitations"
        description="Design and send beautiful invitations in minutes."
      />
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customize Your Invitation</CardTitle>
            <CardDescription>Personalize the text and style.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input id="event-title" defaultValue="The Wedding Of" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="couple-names">Couple's Names</Label>
              <Input id="couple-names" defaultValue="Alex & Jordan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea id="details" defaultValue="Saturday, October 26, 2024\n4:00 PM\nThe Grand Ballroom\n123 Celebration Ave" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-style">Font Style</Label>
              <Select defaultValue="elegant">
                <SelectTrigger id="font-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="elegant">Elegant Script</SelectItem>
                  <SelectItem value="modern">Modern Sans</SelectItem>
                  <SelectItem value="classic">Classic Serif</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full">
              Save & Send
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
            {invitationTemplate && (
              <Card className="w-full max-w-sm shadow-lg">
                <CardContent className="p-0">
                  <Image 
                    src={invitationTemplate.imageUrl} 
                    alt={invitationTemplate.description} 
                    width={400}
                    height={600}
                    className="w-full h-auto rounded-t-lg"
                    data-ai-hint={invitationTemplate.imageHint}
                  />
                  <div className="p-6 text-center bg-card rounded-b-lg">
                    <h2 className="text-sm uppercase tracking-widest text-muted-foreground">The Wedding Of</h2>
                    <h1 className="font-headline text-3xl my-3">Alex & Jordan</h1>
                    <p className="text-muted-foreground whitespace-pre-line text-sm">
                      Saturday, October 26, 2024
                      {'\n'}4:00 PM
                      {'\n'}The Grand Ballroom
                    </p>
                    <Button variant="outline" className="mt-4">RSVP</Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  )
}


'use client'

import Image from "next/image"
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Download, Send, Upload } from "lucide-react"
import { useRef, useState, useCallback } from "react"
import { toPng } from 'html-to-image';
import Draggable from 'react-draggable';
import { cn } from "@/lib/utils"

export default function InvitationsPage() {
  const invitationTemplate = PlaceHolderImages.find(img => img.id === 'invitation-template-1');
  
  const [backgroundImage, setBackgroundImage] = useState(invitationTemplate?.imageUrl || '');
  const [eventTitle, setEventTitle] = useState('The Wedding Of');
  const [coupleNames, setCoupleNames] = useState('Alex & Jordan');
  const [details, setDetails] = useState('Saturday, October 26, 2024\n4:00 PM\nThe Grand Ballroom\n123 Celebration Ave');
  const [font, setFont] = useState('font-headline');

  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef(null);
  const namesRef = useRef(null);
  const detailsRef = useRef(null);


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setBackgroundImage(e.target.result as string);
        }
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const handleDownload = useCallback(() => {
    if (cardRef.current === null) {
      return
    }

    toPng(cardRef.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a')
        link.download = 'my-invitation.png'
        link.href = dataUrl
        link.click()
      })
      .catch((err) => {
        console.log(err)
      })
  }, [cardRef])

  const fontOptions = [
      {value: 'font-headline', label: 'Playfair Display'},
      {value: 'font-body', label: 'Poppins'},
      {value: 'font-great-vibes', label: 'Great Vibes'},
      {value: 'font-dancing-script', label: 'Dancing Script'},
      {value: 'font-sacramento', label: 'Sacramento'},
  ];

  return (
    <div className="flex flex-col flex-1 pb-20">
      <PageHeader
        title="Digital Invitations"
        description="Design and send beautiful invitations in minutes."
      />
      <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customize Your Invitation</CardTitle>
            <CardDescription>Personalize the text and style.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="space-y-2">
                <Label>Background Image</Label>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                <Button asChild variant="outline">
                    <label htmlFor="image-upload" className="cursor-pointer w-full">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Custom Image
                    </label>
                </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-title">Event Title</Label>
              <Input id="event-title" value={eventTitle} onChange={e => setEventTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="couple-names">Couple's Names</Label>
              <Input id="couple-names" value={coupleNames} onChange={e => setCoupleNames(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea id="details" value={details} onChange={e => setDetails(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-style">Font Style</Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger id="font-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Save & Send
                </Button>
                <Button variant="outline" onClick={handleDownload} className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 flex items-center justify-center p-4 bg-muted rounded-lg">
              <Card className="w-full max-w-sm shadow-lg overflow-hidden" ref={cardRef}>
                <CardContent className="p-0 relative h-[600px] w-[400px]">
                  <Image 
                    src={backgroundImage} 
                    alt="Wedding invitation background" 
                    layout="fill"
                    objectFit="cover"
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute inset-0 p-6 text-center text-white">
                      <Draggable bounds="parent" nodeRef={titleRef}>
                          <div ref={titleRef} className={cn("cursor-move", font)}>
                              <h2 className="text-lg uppercase tracking-widest text-white/80">{eventTitle}</h2>
                          </div>
                      </Draggable>
                      <Draggable bounds="parent" nodeRef={namesRef}>
                          <div ref={namesRef} className={cn("cursor-move py-4", font)}>
                              <h1 className="text-6xl my-3">{coupleNames}</h1>
                          </div>
                      </Draggable>
                      <Draggable bounds="parent" nodeRef={detailsRef}>
                          <div ref={detailsRef} className={cn("cursor-move", font)}>
                              <p className="whitespace-pre-line text-lg">
                                  {details}
                              </p>
                          </div>
                      </Draggable>
                  </div>
                </CardContent>
              </Card>
        </div>
      </div>
    </div>
  )
}

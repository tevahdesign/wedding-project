
'use client'

import Image from "next/image"
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { Download, Send, Upload, Plus, Trash2 } from "lucide-react"
import { useRef, useState, useCallback, createRef, RefObject } from "react"
import { toPng } from 'html-to-image';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

type TextElement = {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  position: { x: number; y: number };
  ref: RefObject<HTMLDivElement>;
}

export default function InvitationsPage() {
  const invitationTemplate = PlaceHolderImages.find(img => img.id === 'invitation-template-1');
  
  const [backgroundImage, setBackgroundImage] = useState(invitationTemplate?.imageUrl || '');
  const [textElements, setTextElements] = useState<TextElement[]>([
    { id: 'title', text: 'The Wedding Of', font: 'font-headline', size: 20, color: '#FFFFFF', position: { x: 0, y: 50 }, ref: createRef() },
    { id: 'names', text: 'Alex & Jordan', font: 'font-great-vibes', size: 72, color: '#FFFFFF', position: { x: 0, y: 120 }, ref: createRef() },
    { id: 'details', text: 'Saturday, October 26, 2024\n4:00 PM\nThe Grand Ballroom\n123 Celebration Ave', font: 'font-body', size: 18, color: '#FFFFFF', position: { x: 0, y: 250 }, ref: createRef() },
  ]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  
  const selectedElement = textElements.find(el => el.id === selectedElementId);

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
    if (cardRef.current === null) return;
    
    setSelectedElementId(null); // Deselect to hide outlines before download
    
    setTimeout(() => {
        toPng(cardRef.current!, { 
            cacheBust: true,
            // The library struggles with external fonts, so we provide them.
            // This is a known workaround for cross-origin issues with fonts.
            fontEmbedCSS: `
              @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Poppins&family=Great+Vibes&family=Dancing+Script&family=Sacramento&display=swap');
            `
        })
          .then((dataUrl) => {
            const link = document.createElement('a')
            link.download = 'my-invitation.png'
            link.href = dataUrl
            link.click()
          })
          .catch((err) => {
            console.log(err)
          })
    }, 100);

  }, [cardRef]);

  const updateTextElement = (id: string, updates: Partial<Omit<TextElement, 'ref'>>) => {
    setTextElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
  };
  
  const handleDragStop = (id: string, e: DraggableEvent, data: DraggableData) => {
    updateTextElement(id, { position: { x: data.x, y: data.y } });
  };

  const addText = () => {
    const newId = `text-${Date.now()}`;
    const newElement: TextElement = {
      id: newId,
      text: 'New Text',
      font: 'font-body',
      size: 24,
      color: '#FFFFFF',
      position: { x: 0, y: 100 },
      ref: createRef(),
    };
    setTextElements(prev => [...prev, newElement]);
    setSelectedElementId(newId);
  }

  const deleteText = () => {
    if(!selectedElementId) return;
    setTextElements(prev => prev.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
  }

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
            <CardTitle>Invitation Editor</CardTitle>
            <CardDescription>Click an element on the card to start editing.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
                <h3 className="font-semibold text-base px-1">Canvas</h3>
                <div className="space-y-2 p-4 border rounded-lg">
                    <Label>Background Image</Label>
                    <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <Button asChild variant="outline">
                        <label htmlFor="image-upload" className="cursor-pointer w-full">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Image
                        </label>
                    </Button>
                </div>
                 <Button onClick={addText} variant="outline" className="w-full">
                    <Plus className="mr-2 h-4 w-4" /> Add Text
                </Button>
            </div>
            
            <Separator />

            {selectedElement ? (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center px-1">
                         <h3 className="font-semibold text-base">Edit Layer</h3>
                         <Button variant="ghost" size="icon" onClick={deleteText} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete selected layer</span>
                         </Button>
                    </div>
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                            <Label htmlFor="text-content">Text Content</Label>
                            <Input 
                                id="text-content" 
                                value={selectedElement.text} 
                                onChange={e => updateTextElement(selectedElement.id, { text: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="font-style">Font Style</Label>
                            <Select 
                                value={selectedElement.font} 
                                onValueChange={font => updateTextElement(selectedElement.id, { font })}
                            >
                                <SelectTrigger id="font-style"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                {fontOptions.map(option => (
                                    <SelectItem key={option.value} value={option.value} className={option.value}>{option.label}</SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="font-color">Color</Label>
                                <Input 
                                    id="font-color" 
                                    type="color"
                                    value={selectedElement.color} 
                                    onChange={e => updateTextElement(selectedElement.id, { color: e.target.value })}
                                    className="p-1 h-10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="font-size">Size</Label>
                                <Input
                                    id="font-size"
                                    type="number"
                                    value={selectedElement.size}
                                    onChange={(e) => updateTextElement(selectedElement.id, { size: parseInt(e.target.value, 10) || 12 })}
                                />
                            </div>
                        </div>
                        <Slider 
                            value={[selectedElement.size]}
                            onValueChange={([value]) => updateTextElement(selectedElement.id, { size: value })}
                            max={100}
                            min={8}
                            step={1}
                        />
                    </div>
                </div>
            ) : (
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-lg">
                    <p>Select a text layer on the invitation to edit its properties.</p>
                </div>
            )}
             <div className="flex flex-col gap-2 !mt-8">
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
              <Card 
                className="w-full max-w-sm shadow-lg overflow-hidden" 
                ref={cardRef}
                onClick={(e) => { if (e.target === e.currentTarget) setSelectedElementId(null)}}
              >
                <CardContent className="p-0 relative h-[600px] w-[400px]">
                  <Image 
                    src={backgroundImage} 
                    alt="Wedding invitation background" 
                    fill
                    className="w-full h-full object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute inset-0 text-center text-white" >
                      {textElements.map(el => (
                          <Draggable
                            key={el.id}
                            bounds="parent"
                            position={el.position}
                            onStop={(e, data) => handleDragStop(el.id, e, data)}
                            nodeRef={el.ref}
                          >
                            <div 
                                ref={el.ref}
                                className={cn(
                                    "absolute cursor-move p-2 transition-all duration-75",
                                    el.font,
                                    selectedElementId === el.id && "outline-dashed outline-1 outline-white"
                                )}
                                style={{
                                    color: el.color,
                                    fontSize: `${el.size}px`,
                                    top: 0, // Positions are handled by Draggable
                                    left: '50%',
                                    transform: `translateX(-50%)`
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedElementId(el.id);
                                }}
                            >
                                <div className="whitespace-pre-line">{el.text}</div>
                            </div>
                          </Draggable>
                      ))}
                  </div>
                </CardContent>
              </Card>
        </div>
      </div>
    </div>
  )
}

    

'use client'

import Image from "next/image"
import { PageHeader } from "@/components/app/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { createRef, useRef, useState, useCallback, RefObject, useEffect } from "react"
import { toPng } from 'html-to-image';
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable';
import { cn } from "@/lib/utils"
import { InvitationToolbar, FontOption } from "./invitation-toolbar";

export type TextElement = {
  id: string;
  text: string;
  font: string;
  size: number;
  color: string;
  position: { x: number; y: number };
  ref: RefObject<HTMLDivElement>;
}

export const fontOptions: FontOption[] = [
    {value: 'font-headline', label: 'Playfair Display'},
    {value: 'font-body', label: 'Poppins'},
    {value: 'font-great-vibes', label: 'Great Vibes'},
    {value: 'font-dancing-script', label: 'Dancing Script'},
    {value: 'font-sacramento', label: 'Sacramento'},
];

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
  
  // Set contentEditable false when an element is not selected
  useEffect(() => {
    textElements.forEach(el => {
      if (el.ref.current) {
        el.ref.current.querySelector('[contentEditable]')?.setAttribute('contentEditable', 'false');
      }
    });
    if (selectedElement && selectedElement.ref.current) {
        const editableDiv = selectedElement.ref.current.querySelector('[contentEditable]');
        if(editableDiv) {
            editableDiv.setAttribute('contentEditable', 'true');
        }
    }
  }, [selectedElement, textElements]);


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

  return (
    <div className="flex flex-col flex-1 h-screen">
      <PageHeader
        title="Digital Invitations"
        description="Design and send beautiful invitations in minutes."
      />
      <InvitationToolbar 
        selectedElement={selectedElement}
        onAddText={addText}
        onDeleteText={deleteText}
        onUpdate={updateTextElement}
        onImageUpload={handleImageUpload}
        onDownload={handleDownload}
      />
      <main className="flex-1 bg-muted flex items-center justify-center p-4 overflow-auto">
        <Card 
            className="w-full max-w-sm shadow-lg overflow-hidden flex-shrink-0" 
            ref={cardRef}
            onClick={(e) => { 
                const target = e.target as HTMLElement;
                if (target.closest('.draggable-element')) return;
                setSelectedElementId(null)
            }}
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
                                "absolute cursor-move p-2 transition-all duration-75 draggable-element",
                                el.font,
                                selectedElementId === el.id && "outline-dashed outline-1 outline-white"
                            )}
                            style={{
                                color: el.color,
                                fontSize: `${el.size}px`,
                                top: 0, 
                                left: '50%',
                                transform: `translateX(-50%)`
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedElementId(el.id);
                            }}
                            onDoubleClick={(e) => {
                                const target = e.currentTarget.querySelector('[contentEditable]');
                                if (target) {
                                    target.setAttribute('contentEditable', 'true');
                                    (target as HTMLDivElement).focus();
                                }
                            }}
                        >
                            <div 
                                className="whitespace-pre-line outline-none"
                                contentEditable={selectedElementId === el.id}
                                suppressContentEditableWarning={true}
                                onBlur={(e) => {
                                    updateTextElement(el.id, { text: e.currentTarget.innerText });
                                }}
                            >
                                {el.text}
                            </div>
                        </div>
                        </Draggable>
                    ))}
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  )
}

    
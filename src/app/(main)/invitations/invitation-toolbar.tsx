
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Download, Plus, Send, Trash2, Upload } from "lucide-react";
import type { TextElement } from "./page";

export type FontOption = {
    value: string;
    label: string;
}

type InvitationToolbarProps = {
    selectedElement?: TextElement | null;
    onAddText: () => void;
    onDeleteText: () => void;
    onUpdate: (id: string, updates: Partial<Omit<TextElement, 'ref'>>) => void;
    onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onDownload: () => void;
}

const fontOptions: FontOption[] = [
    {value: 'font-headline', label: 'Playfair Display'},
    {value: 'font-body', label: 'Poppins'},
    {value: 'font-great-vibes', label: 'Great Vibes'},
    {value: 'font-dancing-script', label: 'Dancing Script'},
    {value: 'font-sacramento', label: 'Sacramento'},
];

export function InvitationToolbar({
    selectedElement,
    onAddText,
    onDeleteText,
    onUpdate,
    onImageUpload,
    onDownload
}: InvitationToolbarProps) {
    return (
        <div className="bg-background border-b p-2 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
                <Input id="image-upload-toolbar" type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
                <Button asChild variant="ghost" size="sm">
                    <Label htmlFor="image-upload-toolbar" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Background
                    </Label>
                </Button>
                <Button onClick={onAddText} variant="ghost" size="sm">
                    <Plus className="mr-2 h-4 w-4" /> Add Text
                </Button>
            </div>
            
            <Separator orientation="vertical" className="h-8" />
            
            {selectedElement ? (
                 <div className="flex items-center gap-4 flex-wrap animate-fade-in">
                     <div className="flex items-center gap-2">
                        <Label htmlFor="font-style" className="text-sm">Font</Label>
                        <Select 
                            value={selectedElement.font} 
                            onValueChange={font => onUpdate(selectedElement.id, { font })}
                        >
                            <SelectTrigger id="font-style" className="w-[150px] h-9">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                            {fontOptions.map(option => (
                                <SelectItem key={option.value} value={option.value} className={option.value}>{option.label}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="flex items-center gap-2">
                        <Label htmlFor="font-size" className="text-sm">Size</Label>
                        <Input
                            id="font-size"
                            type="number"
                            value={selectedElement.size}
                            onChange={(e) => onUpdate(selectedElement.id, { size: parseInt(e.target.value, 10) || 12 })}
                            className="w-[70px] h-9"
                        />
                         <Slider 
                            value={[selectedElement.size]}
                            onValueChange={([value]) => onUpdate(selectedElement.id, { size: value })}
                            max={100}
                            min={8}
                            step={1}
                            className="w-[100px]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="font-color" className="text-sm">Color</Label>
                        <Input 
                            id="font-color" 
                            type="color"
                            value={selectedElement.color} 
                            onChange={e => onUpdate(selectedElement.id, { color: e.target.value })}
                            className="p-1 h-9 w-10"
                        />
                    </div>
                    <Separator orientation="vertical" className="h-8" />
                    <Button variant="ghost" size="icon" onClick={onDeleteText} className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground">Select a text layer to edit</div>
            )}
            
            <div className="flex-1"></div>

            <div className="flex items-center gap-2">
                <Button onClick={onDownload} variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button size="sm">
                  <Send className="mr-2 h-4 w-4" />
                  Save & Send
                </Button>
            </div>
        </div>
    );
}


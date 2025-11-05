
"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Check, ChevronsUpDown, Download, Plus, Send, Trash2, Upload } from "lucide-react";
import type { TextElement } from "./page";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
    { value: "font-arial", label: "Arial" },
    { value: "font-times", label: "Times New Roman" },
    { value: "font-georgia", label: "Georgia" },
];

function FontCombobox({ value, onSelect }: { value: string, onSelect: (font: string) => void }) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[180px] justify-between h-9"
                >
                    <span className="truncate">
                        {fontOptions.find(f => f.value === value)?.label || 'Select font...'}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search font..." />
                    <CommandEmpty>No font found.</CommandEmpty>
                    <CommandGroup className="max-h-60 overflow-y-auto">
                        {fontOptions.map((option) => (
                            <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                    onSelect(option.value);
                                    setOpen(false);
                                }}
                                className={cn(option.value, "cursor-pointer")}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        value === option.value ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                {option.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

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
                     <div className="flex flex-col gap-2">
                        <Label htmlFor="text-content" className="text-sm">Text</Label>
                        <Textarea 
                            id="text-content"
                            value={selectedElement.text}
                            onChange={e => onUpdate(selectedElement.id, { text: e.target.value })}
                            className="w-[200px] h-20"
                        />
                     </div>
                     <div className="flex items-center gap-2">
                        <Label htmlFor="font-style" className="text-sm">Font</Label>
                        <FontCombobox 
                            value={selectedElement.font}
                            onSelect={font => onUpdate(selectedElement.id, { font })}
                        />
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

    
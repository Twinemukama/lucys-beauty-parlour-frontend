import { useState, useRef } from "react";
import { Scissors, Heart, Sparkles, ImagePlus, Upload, Plus, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AddPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const serviceCategories = [
  { id: "hair", label: "Hair Styling & Braiding", icon: Scissors },
  { id: "makeup", label: "Makeup Artistry", icon: Heart },
  { id: "nails", label: "Nails Studio", icon: Sparkles },
];

// Mock styles data - replace with actual database fetch
const stylesByCategory: Record<string, string[]> = {
  hair: ["Box Braids", "Cornrows", "Goddess Locs", "Knotless Braids", "Twist Out", "Silk Press", "Updo"],
  makeup: ["Bridal Glam", "Natural Beat", "Smoky Eye", "Editorial", "Soft Glam", "Cut Crease"],
  nails: ["French Tips", "Gel Overlay", "Nail Art", "Acrylic Extensions", "Chrome Finish", "Ombre"],
};

export function AddPortfolioDialog({ open, onOpenChange }: AddPortfolioDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    category: "",
    style: "",
    imageFile: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stylePopoverOpen, setStylePopoverOpen] = useState(false);
  const [newStyleInput, setNewStyleInput] = useState("");
  const [customStyles, setCustomStyles] = useState<Record<string, string[]>>({
    hair: [],
    makeup: [],
    nails: [],
  });

  const availableStyles = formData.category
    ? [...(stylesByCategory[formData.category] || []), ...(customStyles[formData.category] || [])]
    : [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file.",
          variant: "destructive",
        });
        return;
      }
      setFormData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.style || !formData.imageFile) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call - replace with actual backend integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: "Portfolio item added",
      description: `"${formData.style}" has been added to ${serviceCategories.find(c => c.id === formData.category)?.label}.`,
    });
    
    handleReset();
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFormData({ category: "", style: "", imageFile: null });
    setImagePreview(null);
    setNewStyleInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddNewStyle = () => {
    if (!newStyleInput.trim() || !formData.category) return;
    
    const trimmedStyle = newStyleInput.trim();
    
    // Check if style already exists
    if (availableStyles.some(s => s.toLowerCase() === trimmedStyle.toLowerCase())) {
      toast({
        title: "Style exists",
        description: "This style already exists in the list.",
        variant: "destructive",
      });
      return;
    }

    setCustomStyles(prev => ({
      ...prev,
      [formData.category]: [...(prev[formData.category] || []), trimmedStyle],
    }));
    
    setFormData(prev => ({ ...prev, style: trimmedStyle }));
    setNewStyleInput("");
    setStylePopoverOpen(false);
    
    toast({
      title: "Style added",
      description: `"${trimmedStyle}" has been added and selected.`,
    });
  };

  const selectedCategory = serviceCategories.find(c => c.id === formData.category);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-playfair text-2xl">Add Portfolio Item</DialogTitle>
          <DialogDescription>
            Add a new work sample to your service portfolio. Each item will appear in the gallery under its selected service category.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Service Category */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Service Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value, style: "" }))}
            >
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Select a service category" />
              </SelectTrigger>
              <SelectContent>
                {serviceCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <category.icon className="h-4 w-4 text-primary" />
                      <span>{category.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <p className="text-xs text-muted-foreground">
                This item will appear in the "{selectedCategory.label}" gallery section.
              </p>
            )}
          </div>

          {/* Style Selection with Inline Creation */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Style <span className="text-destructive">*</span>
            </Label>
            <Popover open={stylePopoverOpen} onOpenChange={setStylePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={stylePopoverOpen}
                  className="w-full justify-between"
                  disabled={!formData.category}
                >
                  {formData.style || "Select or create a style..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Search or type new style..." 
                    value={newStyleInput}
                    onValueChange={setNewStyleInput}
                  />
                  <CommandList>
                    <CommandEmpty className="p-2">
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-muted-foreground">No style found.</p>
                        {newStyleInput.trim() && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-full justify-start"
                            onClick={handleAddNewStyle}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Create "{newStyleInput.trim()}"
                          </Button>
                        )}
                      </div>
                    </CommandEmpty>
                    <CommandGroup heading="Available Styles">
                      {availableStyles.map((style) => (
                        <CommandItem
                          key={style}
                          value={style}
                          onSelect={() => {
                            setFormData(prev => ({ ...prev, style }));
                            setStylePopoverOpen(false);
                            setNewStyleInput("");
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              formData.style === style ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {style}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                    {newStyleInput.trim() && !availableStyles.some(s => 
                      s.toLowerCase() === newStyleInput.trim().toLowerCase()
                    ) && (
                      <>
                        <CommandSeparator />
                        <CommandGroup heading="Create New">
                          <CommandItem onSelect={handleAddNewStyle}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create "{newStyleInput.trim()}"
                          </CommandItem>
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {!formData.category && (
              <p className="text-xs text-muted-foreground">
                Select a service category first to see available styles.
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Image <span className="text-destructive">*</span>
            </Label>
            <div 
              className={cn(
                "relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer hover:border-primary/50",
                imagePreview ? "border-primary" : "border-border"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative aspect-[4/5] max-w-[200px] mx-auto rounded-lg overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 opacity-0 hover:opacity-100 transition-opacity">
                    <p className="text-sm font-medium">Click to change</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Upload className="h-10 w-10" />
                  <p className="text-sm font-medium">Click to upload image</p>
                  <p className="text-xs">Recommended size: 400x500px</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add to Portfolio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
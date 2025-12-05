import { useState } from "react";
import { Scissors, Heart, Sparkles, ImagePlus } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddPortfolioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const serviceCategories = [
  { id: "hair", label: "Hair Styling & Braiding", icon: Scissors },
  { id: "makeup", label: "Makeup Artistry", icon: Heart },
  { id: "nails", label: "Nails Studio", icon: Sparkles },
];

export function AddPortfolioDialog({ open, onOpenChange }: AddPortfolioDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    category: "",
    title: "",
    description: "",
    imageUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.title || !formData.description || !formData.imageUrl) {
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
      description: `"${formData.title}" has been added to ${serviceCategories.find(c => c.id === formData.category)?.label}.`,
    });
    
    setFormData({ category: "", title: "", description: "", imageUrl: "" });
    setIsSubmitting(false);
    onOpenChange(false);
  };

  const handleReset = () => {
    setFormData({ category: "", title: "", description: "", imageUrl: "" });
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
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
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

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Elegant Updo, Bridal Glam"
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">{formData.title.length}/50 characters</p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the work (e.g., Perfect for weddings and special occasions)"
              maxLength={150}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{formData.description.length}/150 characters</p>
          </div>

          {/* Image URL */}
          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-sm font-medium">
              Image URL <span className="text-destructive">*</span>
            </Label>
            <Input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-xs text-muted-foreground">
              Enter a direct link to the image. Recommended size: 400x500px
            </p>
          </div>

          {/* Image Preview */}
          {formData.imageUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="relative aspect-[4/5] max-w-[200px] rounded-lg overflow-hidden border border-border bg-muted">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-muted/80 opacity-0 hover:opacity-100 transition-opacity">
                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}

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
import { useEffect, useMemo, useState, useRef } from "react";
import { MoreHorizontal, Trash, Loader2, Scissors, Heart, Sparkles, Image as ImageIcon, Edit, Upload } from "lucide-react";

import { listPortfolioItems, type PortfolioItemDto, resolvePortfolioItemImageUrl, type ServiceCategory } from "@/apis/portfolioItems";
import { deleteAdminPortfolioItem, updateAdminPortfolioItem } from "@/apis/adminPortfolioItems";

import { Button } from "@/components/ui/button";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, normalizeText } from "@/lib/utils";

const categoryIcons = {
	hair: Scissors,
	makeup: Heart,
	nails: Sparkles,
};

const categoryLabels = {
	hair: "Hair Styling & Braiding",
	makeup: "Makeup Artistry",
	nails: "Nails Studio",
};

export function PortfolioItemsManager() {
	const { toast } = useToast();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [items, setItems] = useState<PortfolioItemDto[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<number | null>(null);
	const [previewItem, setPreviewItem] = useState<PortfolioItemDto | null>(null);
	const [editItem, setEditItem] = useState<PortfolioItemDto | null>(null);
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editFormData, setEditFormData] = useState({
		category: "",
		name: "",
		description: "",
		imageFile: null as File | null,
	});
	const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const loadItems = async () => {
		setLoading(true);
		setError(null);
		try {
			const allItems: PortfolioItemDto[] = [];
			const categories = ["hair", "makeup", "nails"] as const;
			
			for (const category of categories) {
				const res = await listPortfolioItems({ category, limit: 100, offset: 0 });
				allItems.push(...(res?.data || []));
			}

			setItems(allItems);
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to load portfolio items";
			setError(message);
			toast({
				title: "Failed to load",
				description: message,
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadItems();
	}, []);

	const sortedItems = useMemo(() => {
		const list = [...items];
		list.sort((a, b) => {
			const c = (a.category || "").localeCompare(b.category || "");
			if (c !== 0) return c;
			return (a.style || "").localeCompare(b.style || "");
		});
		return list;
	}, [items]);

	const handleDelete = async (id: number) => {
		setDeletingId(id);
		try {
			await deleteAdminPortfolioItem(id);
			toast({ title: "Portfolio item deleted" });
			await loadItems();
		} catch (err: unknown) {
			toast({
				title: "Delete failed",
				description: err instanceof Error ? err.message : "Request failed",
				variant: "destructive",
			});
		} finally {
			setDeletingId(null);
		}
	};

	const handleDeleteAll = async () => {
		if (items.length === 0) return;
		
		setLoading(true);
		let successCount = 0;
		let failCount = 0;

		for (const item of items) {
			try {
				await deleteAdminPortfolioItem(item.id);
				successCount++;
			} catch {
				failCount++;
			}
		}

		if (failCount === 0) {
			toast({ 
				title: "All items cleared", 
				description: `Successfully deleted ${successCount} portfolio items.` 
			});
		} else {
			toast({ 
				title: "Partially cleared", 
				description: `Deleted ${successCount} items, ${failCount} failed.`,
				variant: "destructive"
			});
		}

		await loadItems();
	};

	const handleEdit = (item: PortfolioItemDto) => {
		setEditItem(item);
		setEditFormData({
			category: item.category,
			name: item.style,
			description: item.description || "",
			imageFile: null,
		});
		setEditImagePreview(resolvePortfolioItemImageUrl(item.images?.[0] || ""));
		setEditDialogOpen(true);
	};

	const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
			setEditFormData(prev => ({ ...prev, imageFile: file }));
			const reader = new FileReader();
			reader.onloadend = () => {
				setEditImagePreview(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!editItem || !editFormData.category || !editFormData.name.trim() || !editFormData.description.trim()) {
			toast({
				title: "Missing fields",
				description: "Please fill in all required fields.",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const updateData: any = {
				category: editFormData.category as ServiceCategory,
				style: normalizeText(editFormData.name),
				description: editFormData.description.trim(),
			};

			// Only include images if a new file was uploaded
			if (editFormData.imageFile && editImagePreview) {
				updateData.images = [editImagePreview];
			}

			await updateAdminPortfolioItem(editItem.id, updateData);

			toast({
				title: "Portfolio item updated",
				description: `"${editFormData.name}" has been updated successfully.`,
			});

			setEditDialogOpen(false);
			setEditItem(null);
			await loadItems();
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Failed to update portfolio item";
			toast({
				title: "Update failed",
				description: message,
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const getCategoryIcon = (service: string) => {
		const Icon = categoryIcons[service as keyof typeof categoryIcons];
		return Icon ? <Icon className="h-4 w-4" /> : null;
	};

	const getCategoryLabel = (service: string) => {
		return categoryLabels[service as keyof typeof categoryLabels] || service;
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-lg font-semibold font-playfair">Portfolio Items</h3>
					<p className="text-sm text-muted-foreground">
						View and manage portfolio gallery items.
					</p>
				</div>
				{items.length > 0 && (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="destructive" className="gap-2 w-full sm:w-auto">
								<Trash className="h-4 w-4" />
								Clear All Portfolio
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Clear all portfolio items?</AlertDialogTitle>
								<AlertDialogDescription>
									This will permanently delete all {items.length} portfolio items from the gallery. This action cannot be undone.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
								<AlertDialogAction
									onClick={handleDeleteAll}
									disabled={loading}
									className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90"
								>
									{loading && <Loader2 className="h-4 w-4 animate-spin" />}
									Delete All
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)}
			</div>

			{loading && items.length === 0 ? (
				<p className="text-sm text-muted-foreground">Loading portfolio items…</p>
			) : null}
			
			{error ? (
				<p className="text-sm text-destructive">{error}</p>
			) : null}

			<div className="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-16">Image</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Name</TableHead>
							<TableHead>Description</TableHead>
							<TableHead className="text-right">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedItems.map((it) => {
							const imageUrl = resolvePortfolioItemImageUrl(it.images?.[0] || "");
							const description = it.description || "";
							return (
								<TableRow key={it.id}>
									<TableCell>
										<button
											onClick={() => setPreviewItem(it)}
											className="group relative h-10 w-10 overflow-hidden rounded border hover:opacity-80 transition-opacity"
										>
											{imageUrl ? (
												<img
													src={imageUrl}
													alt={it.style}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full w-full items-center justify-center bg-muted">
													<ImageIcon className="h-4 w-4 text-muted-foreground" />
												</div>
											)}
										</button>
									</TableCell>
									<TableCell>
										<Badge variant="outline" className="gap-1.5">
											{getCategoryIcon(it.category)}
											{getCategoryLabel(it.category)}
										</Badge>
									</TableCell>
									<TableCell className="font-medium">{it.style}</TableCell>
									<TableCell className="max-w-md truncate text-sm text-muted-foreground">
										{description}
									</TableCell>
									<TableCell className="text-right">
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button variant="ghost" className="h-8 w-8 p-0">
													<MoreHorizontal className="h-4 w-4" />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align="end">
												<DropdownMenuLabel>Actions</DropdownMenuLabel>
												<DropdownMenuItem onClick={() => handleEdit(it)} className="gap-2">
													<Edit className="h-4 w-4" />
													Edit
												</DropdownMenuItem>
												<DropdownMenuSeparator />
												<AlertDialog>
													<AlertDialogTrigger asChild>
														<DropdownMenuItem
															onSelect={(e) => e.preventDefault()}
															className="gap-2 text-destructive focus:text-destructive"
														>
															<Trash className="h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</AlertDialogTrigger>
													<AlertDialogContent>
														<AlertDialogHeader>
															<AlertDialogTitle>Delete portfolio item?</AlertDialogTitle>
															<AlertDialogDescription>
																This will permanently delete "{it.style}" from the gallery.
															</AlertDialogDescription>
														</AlertDialogHeader>
														<AlertDialogFooter>
															<AlertDialogCancel disabled={deletingId === it.id}>
																Cancel
															</AlertDialogCancel>
															<AlertDialogAction
																onClick={() => handleDelete(it.id)}
																disabled={deletingId === it.id}
																className="gap-2"
															>
																{deletingId === it.id && <Loader2 className="h-4 w-4 animate-spin" />}
																Delete
															</AlertDialogAction>
														</AlertDialogFooter>
													</AlertDialogContent>
												</AlertDialog>
											</DropdownMenuContent>
										</DropdownMenu>
									</TableCell>
								</TableRow>
							);
						})}
						{!loading && sortedItems.length === 0 ? (
							<TableRow>
								<TableCell colSpan={5} className="text-center text-muted-foreground py-8">
									No portfolio items yet. Use "Add Portfolio" to create new items.
								</TableCell>
							</TableRow>
						) : null}
					</TableBody>
				</Table>
			</div>

			{/* Image Preview Dialog */}
			<Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle className="font-playfair">{previewItem?.style}</DialogTitle>
					</DialogHeader>
					{previewItem && (
						<div className="space-y-4">
							<AspectRatio ratio={4 / 5}>
								<img
									src={resolvePortfolioItemImageUrl(previewItem.images?.[0] || "")}
									alt={previewItem.style}
									className="rounded-lg object-cover w-full h-full"
								/>
							</AspectRatio>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Badge variant="outline" className="gap-1.5">
										{getCategoryIcon(previewItem.category)}
										{getCategoryLabel(previewItem.category)}
									</Badge>
								</div>
								{previewItem.description && (
									<p className="text-sm text-muted-foreground">
										{previewItem.description}
									</p>
								)}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Edit Portfolio Item Dialog */}
			<Dialog open={editDialogOpen} onOpenChange={(open) => {
				setEditDialogOpen(open);
				if (!open) {
					setEditItem(null);
					if (fileInputRef.current) {
						fileInputRef.current.value = "";
					}
				}
			}}>
				<DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="font-playfair text-2xl">Edit Portfolio Item</DialogTitle>
						<DialogDescription>
							Update the details of this portfolio item.
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleEditSubmit} className="space-y-5 mt-4">
						{/* Service Category */}
						<div className="space-y-2">
							<Label htmlFor="edit-category" className="text-sm font-medium">
								Service Category <span className="text-destructive">*</span>
							</Label>
							<Select
								value={editFormData.category}
								onValueChange={(value) => setEditFormData(prev => ({ ...prev, category: value }))}
								disabled={isSubmitting}
							>
								<SelectTrigger id="edit-category" className="w-full">
									<SelectValue placeholder="Select a service category" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="hair">
										<div className="flex items-center gap-2">
											<Scissors className="h-4 w-4 text-primary" />
											<span>Hair Styling & Braiding</span>
										</div>
									</SelectItem>
									<SelectItem value="makeup">
										<div className="flex items-center gap-2">
											<Heart className="h-4 w-4 text-primary" />
											<span>Makeup Artistry</span>
										</div>
									</SelectItem>
									<SelectItem value="nails">
										<div className="flex items-center gap-2">
											<Sparkles className="h-4 w-4 text-primary" />
											<span>Nails Studio</span>
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Name */}
						<div className="space-y-2">
							<Label htmlFor="edit-name" className="text-sm font-medium">
								Name/Style <span className="text-destructive">*</span>
							</Label>
							<Input
								id="edit-name"
								value={editFormData.name}
								onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
								placeholder="e.g., Box Braids, Bridal Glam"
								disabled={isSubmitting}
							/>
						</div>

						{/* Image Upload */}
						<div className="space-y-2">
							<Label className="text-sm font-medium">
								Image {editFormData.imageFile ? <span className="text-destructive">*</span> : <span className="text-muted-foreground">(optional - leave unchanged)</span>}
							</Label>
							<div 
								className={cn(
									"relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer hover:border-primary/50",
									editImagePreview ? "border-primary" : "border-border"
								)}
								onClick={() => fileInputRef.current?.click()}
							>
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									onChange={handleEditFileChange}
									className="hidden"
								/>
								{editImagePreview ? (
									<div className="relative aspect-[4/5] max-w-[200px] mx-auto rounded-lg overflow-hidden">
										<img
											src={editImagePreview}
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
										<p className="text-sm font-medium">Click to upload new image</p>
										<p className="text-xs">Recommended size: 400x500px</p>
									</div>
								)}
							</div>
						</div>

						{/* Description */}
						<div className="space-y-2">
							<Label htmlFor="edit-description" className="text-sm font-medium">
								Description <span className="text-destructive">*</span>
							</Label>
							<Textarea
								id="edit-description"
								value={editFormData.description}
								onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
								placeholder="Short description shown in the gallery"
								rows={3}
								disabled={isSubmitting}
							/>
						</div>

						{/* Actions */}
						<div className="flex justify-end gap-3 pt-4 border-t border-border">
							<Button 
								type="button" 
								variant="outline" 
								onClick={() => setEditDialogOpen(false)} 
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
								Update Portfolio Item
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}

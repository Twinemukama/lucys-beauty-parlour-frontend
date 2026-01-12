import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Edit, Trash } from "lucide-react";

import { listAllMenuItems, type MenuItemDto } from "@/apis/menuItems";
import { createAdminMenuItem, deleteAdminMenuItem, updateAdminMenuItem } from "@/apis/adminMenuItems";

import { Button } from "@/components/ui/button";
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
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from "@/hooks/use-toast";
import { SALON_SERVICE_CATEGORIES } from "@/lib/salonServiceCategories";

function centsToDisplay(priceCents: number): string {
	if (!Number.isFinite(priceCents)) return "";
	return (Number(priceCents) / 100).toFixed(2);
}

function parsePriceToCents(value: string): number | null {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const n = Number(trimmed);
	if (!Number.isFinite(n)) return null;
	if (n < 0) return null;
	return Math.round(n * 100);
}

type MenuItemFormState = {
	category: string;
	name: string;
	currency: string;
	price: string; // major units
	durationMinutes: string;
};

function toFormState(item?: MenuItemDto | null): MenuItemFormState {
	return {
		category: item?.category ?? "",
		name: item?.name ?? "",
		currency: item?.currency ?? "UGX",
		price: item ? centsToDisplay(item.price_cents) : "",
		durationMinutes: item ? String(item.duration_minutes) : "",
	};
}

export function MenuItemsManager() {
	const { toast } = useToast();
	const qc = useQueryClient();

	const [createOpen, setCreateOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [editItem, setEditItem] = useState<MenuItemDto | null>(null);

	const { data: items, isLoading, isError } = useQuery({
		queryKey: ["menu-items", "all"],
		queryFn: async () => {
			return await listAllMenuItems({ pageSize: 200 });
		},
		staleTime: 30_000,
		retry: 1,
	});

	const sortedItems = useMemo(() => {
		const list = items ? [...items] : [];
		list.sort((a, b) => {
			const c = (a.category || "").localeCompare(b.category || "");
			if (c !== 0) return c;
			return (a.name || "").localeCompare(b.name || "");
		});
		return list;
	}, [items]);

	const createMutation = useMutation({
		mutationFn: createAdminMenuItem,
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["menu-items"] });
			toast({ title: "Menu item created" });
			setCreateOpen(false);
		},
		onError: (err: unknown) => {
			toast({
				title: "Create failed",
				description: err instanceof Error ? err.message : "Request failed",
				variant: "destructive",
			});
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (args: { id: number; input: Parameters<typeof updateAdminMenuItem>[1] }) => {
			return await updateAdminMenuItem(args.id, args.input);
		},
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["menu-items"] });
			toast({ title: "Menu item updated" });
			setEditOpen(false);
			setEditItem(null);
		},
		onError: (err: unknown) => {
			toast({
				title: "Update failed",
				description: err instanceof Error ? err.message : "Request failed",
				variant: "destructive",
			});
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteAdminMenuItem,
		onSuccess: async () => {
			await qc.invalidateQueries({ queryKey: ["menu-items"] });
			toast({ title: "Menu item deleted" });
		},
		onError: (err: unknown) => {
			toast({
				title: "Delete failed",
				description: err instanceof Error ? err.message : "Request failed",
				variant: "destructive",
			});
		},
	});

	const openEdit = (item: MenuItemDto) => {
		setEditItem(item);
		setEditOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h3 className="text-lg font-semibold font-playfair">Menu Items</h3>
					<p className="text-sm text-muted-foreground">Add, edit, and delete pricing menu items.</p>
				</div>
				<Button onClick={() => setCreateOpen(true)} className="gap-2 w-full sm:w-auto">
					<Plus className="h-4 w-4" />
					Add Menu Item
				</Button>
			</div>

			{isLoading ? <p className="text-sm text-muted-foreground">Loading menu items…</p> : null}
			{isError ? <p className="text-sm text-muted-foreground">Failed to load menu items.</p> : null}

			<Table className="min-w-[760px]">
				<TableHeader>
					<TableRow>
						<TableHead>Category</TableHead>
						<TableHead>Name</TableHead>
						<TableHead>Currency</TableHead>
						<TableHead className="text-right">Price</TableHead>
						<TableHead className="text-right">Duration</TableHead>
						<TableHead className="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{sortedItems.map((it) => (
						<TableRow key={it.id}>
							<TableCell>{it.category}</TableCell>
							<TableCell className="font-medium">{it.name}</TableCell>
							<TableCell>{((it.currency || "UGX").trim() || "UGX").toUpperCase()}</TableCell>
							<TableCell className="text-right">{centsToDisplay(it.price_cents)}</TableCell>
							<TableCell className="text-right">{it.duration_minutes} min</TableCell>
							<TableCell className="text-right">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" className="h-8 w-8 p-0">
											<MoreHorizontal className="h-4 w-4" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuLabel>Actions</DropdownMenuLabel>
										<DropdownMenuItem onClick={() => openEdit(it)} className="gap-2">
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
													<AlertDialogTitle>Delete menu item?</AlertDialogTitle>
													<AlertDialogDescription>
														This will permanently delete “{it.name}”.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter>
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<AlertDialogAction
														onClick={() => deleteMutation.mutate(it.id)}
														disabled={deleteMutation.isPending}
													>
														Delete
													</AlertDialogAction>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</DropdownMenuContent>
								</DropdownMenu>
							</TableCell>
						</TableRow>
					))}
					{!isLoading && sortedItems.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="text-center text-muted-foreground">
								No menu items yet.
							</TableCell>
						</TableRow>
					) : null}
				</TableBody>
			</Table>

			<MenuItemDialog
				mode="create"
				open={createOpen}
				onOpenChange={setCreateOpen}
				onSubmit={(state) => {
					const priceCents = parsePriceToCents(state.price);
					const duration = Number(state.durationMinutes);
					if (priceCents == null) {
						toast({ title: "Invalid price", description: "Enter a valid price.", variant: "destructive" });
						return;
					}
					if (!Number.isFinite(duration) || duration <= 0) {
						toast({ title: "Invalid duration", description: "Enter duration in minutes.", variant: "destructive" });
						return;
					}
					createMutation.mutate({
						category: state.category.trim(),
						name: state.name.trim(),
						currency: state.currency.trim(),
						price_cents: priceCents,
						duration_minutes: Math.trunc(duration),
					});
				}}
			/>

			<MenuItemDialog
				mode="edit"
				open={editOpen}
				onOpenChange={(open) => {
					setEditOpen(open);
					if (!open) setEditItem(null);
				}}
				item={editItem}
				onSubmit={(state) => {
					if (!editItem) return;
					const priceCents = parsePriceToCents(state.price);
					const duration = Number(state.durationMinutes);
					if (priceCents == null) {
						toast({ title: "Invalid price", description: "Enter a valid price.", variant: "destructive" });
						return;
					}
					if (!Number.isFinite(duration) || duration <= 0) {
						toast({ title: "Invalid duration", description: "Enter duration in minutes.", variant: "destructive" });
						return;
					}
					updateMutation.mutate({
						id: editItem.id,
						input: {
							category: state.category.trim(),
							name: state.name.trim(),
							currency: state.currency.trim(),
							price_cents: priceCents,
							duration_minutes: Math.trunc(duration),
						},
					});
				}}
			/>
		</div>
	);
}

function MenuItemDialog(props: {
	mode: "create" | "edit";
	open: boolean;
	onOpenChange: (open: boolean) => void;
	item?: MenuItemDto | null;
	onSubmit: (state: MenuItemFormState) => void;
}) {
	const { mode, open, onOpenChange, item, onSubmit } = props;
	const [state, setState] = useState<MenuItemFormState>(() => toFormState(item));

	// Reset when opening or changing item
	useEffect(() => {
		if (!open) return;
		setState(toFormState(item));
	}, [open, item?.id]);

	const title = mode === "create" ? "Add Menu Item" : "Edit Menu Item";
	const description = mode === "create" ? "Create a new service and price." : "Update this service and price.";
	const submitText = mode === "create" ? "Create" : "Save";

	const categoryOptions = useMemo(() => {
		const base = [...SALON_SERVICE_CATEGORIES];
		const current = (state.category || "").trim();
		if (current && !base.includes(current as any)) {
			base.push(current as any);
		}
		return base;
	}, [state.category]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-2xl font-playfair">{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						onSubmit(state);
					}}
					className="space-y-4"
				>
					<div className="space-y-2">
						<Label htmlFor="menu-category">Category *</Label>
						<Select
							value={state.category}
							onValueChange={(value) => setState((s) => ({ ...s, category: value }))}
						>
							<SelectTrigger id="menu-category">
								<SelectValue placeholder="Select a service category" />
							</SelectTrigger>
							<SelectContent>
								{categoryOptions.map((cat) => (
									<SelectItem key={cat} value={cat}>
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="space-y-2">
						<Label htmlFor="menu-name">Name *</Label>
						<Input
							id="menu-name"
							value={state.name}
							onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
							placeholder="Box Braids"
							required
						/>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="menu-currency">Currency</Label>
							<Input
								id="menu-currency"
								value={state.currency}
								onChange={(e) => setState((s) => ({ ...s, currency: e.target.value }))}
								placeholder="UGX"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="menu-price">Price *</Label>
							<Input
								id="menu-price"
								type="number"
								step="1000"
								min="0"
								value={state.price}
								onChange={(e) => setState((s) => ({ ...s, price: e.target.value }))}
								placeholder="0.00"
								required
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="menu-duration">Duration (minutes) *</Label>
						<Input
							id="menu-duration"
							type="number"
							min="1"
							value={state.durationMinutes}
							onChange={(e) => setState((s) => ({ ...s, durationMinutes: e.target.value }))}
							placeholder="60"
							required
						/>
					</div>

					<div className="flex justify-end gap-3 pt-2">
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit">{submitText}</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

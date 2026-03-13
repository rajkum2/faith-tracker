"use client";

import React, { useState, useMemo } from "react";
import { useLayouts, useLayoutMutation, useLines, useLineMutation } from "@/hooks/data";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { PenTool, Plus, Trash2, Edit3, Layers, Search, MapPin, ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";
import type { LayoutFeature, LineFeature, FeatureType, LayoutCategory } from "@/lib/data/types/faith-tracker";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ManageLayoutsMap = dynamic(() => import("@/components/faith-tracker/manage-layouts-map"), { ssr: false });

const FEATURE_TYPE_COLORS: Record<string, string> = {
  Popular: "bg-green-50 text-green-700 border-green-200",
  Upcoming: "bg-blue-50 text-blue-700 border-blue-200",
  "Red Zones": "bg-red-50 text-red-700 border-red-200",
};

const CATEGORY_COLORS: Record<string, string> = {
  Feature: "bg-slate-50 text-slate-700 border-slate-100",
  Flats: "bg-purple-50 text-purple-700 border-purple-200",
  Plots: "bg-orange-50 text-orange-700 border-orange-200",
};

export default function ManageLayoutsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"layouts" | "lines">("layouts");
  const [deleteTarget, setDeleteTarget] = useState<{ type: "layout" | "line"; id: string; name: string } | null>(null);
  const [editLayout, setEditLayout] = useState<LayoutFeature | null>(null);
  const [editLine, setEditLine] = useState<LineFeature | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string | number>>({});

  // Data
  const { data: layoutsData, isLoading: layoutsLoading } = useLayouts();
  const { data: linesData, isLoading: linesLoading } = useLines();
  const layoutMutation = useLayoutMutation();
  const lineMutation = useLineMutation();

  const layouts = useMemo(() => {
    if (!layoutsData) return [];
    let items = layoutsData.features;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((f: LayoutFeature) => f.properties.title.toLowerCase().includes(q) || f.properties.name.toLowerCase().includes(q));
    }
    return items;
  }, [layoutsData, search]);

  const lines = useMemo(() => {
    if (!linesData) return [];
    let items = linesData.features;
    if (search) {
      const q = search.toLowerCase();
      items = items.filter((f: LineFeature) => f.properties.name.toLowerCase().includes(q));
    }
    return items;
  }, [linesData, search]);

  const openEditLayout = (layout: LayoutFeature) => {
    const p = layout.properties;
    setEditForm({ title: p.title, name: p.name, location: p.location, mandal: p.mandal, area: p.area, total: p.total, available: p.available, booked: p.booked, color: p.color, category: p.category, featureType: p.featureType });
    setEditLayout(layout);
  };

  const openEditLine = (line: LineFeature) => {
    const p = line.properties;
    setEditForm({ name: p.name, description: p.description, length: p.length, color: p.color, opacity: p.opacity, polyLineType: p.polyLineType });
    setEditLine(line);
  };

  const handleSaveLayout = async () => {
    if (!editLayout) return;
    try {
      const updated: LayoutFeature = {
        ...editLayout,
        properties: {
          ...editLayout.properties,
          title: String(editForm.title || ""),
          name: String(editForm.name || ""),
          location: String(editForm.location || ""),
          mandal: String(editForm.mandal || ""),
          area: Number(editForm.area) || 0,
          total: Number(editForm.total) || 0,
          available: Number(editForm.available) || 0,
          booked: Number(editForm.booked) || 0,
          color: String(editForm.color || "#3b82f6"),
          category: String(editForm.category || "Feature") as LayoutCategory,
          featureType: String(editForm.featureType || "Popular") as FeatureType,
        },
      };
      await layoutMutation.update.mutateAsync(updated);
      toast.success(`Updated "${updated.properties.title}"`);
      setEditLayout(null);
    } catch {
      toast.error("Failed to update layout");
    }
  };

  const handleSaveLine = async () => {
    if (!editLine) return;
    try {
      const updated: LineFeature = {
        ...editLine,
        properties: {
          ...editLine.properties,
          name: String(editForm.name || ""),
          description: String(editForm.description || ""),
          length: Number(editForm.length) || 0,
          color: String(editForm.color || "#f97316"),
          opacity: Number(editForm.opacity) || 0.8,
          polyLineType: String(editForm.polyLineType || "POP") as LineFeature["properties"]["polyLineType"],
        },
      };
      await lineMutation.update.mutateAsync(updated);
      toast.success(`Updated "${updated.properties.name}"`);
      setEditLine(null);
    } catch {
      toast.error("Failed to update line");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "layout") {
        await layoutMutation.remove.mutateAsync(deleteTarget.id);
      } else {
        await lineMutation.remove.mutateAsync(deleteTarget.id);
      }
      toast.success(`Deleted "${deleteTarget.name}" successfully`);
    } catch {
      toast.error("Failed to delete");
    }
    setDeleteTarget(null);
  };

  const isLoading = tab === "layouts" ? layoutsLoading : linesLoading;

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: "100%", minHeight: 0 }}>
      {/* Toolbar */}
      <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Tab buttons */}
          <div className="flex items-center gap-1">
            {(["layouts", "lines"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-md transition-all capitalize",
                  tab === t
                    ? "bg-white text-primary shadow-sm border border-slate-100 font-medium"
                    : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs bg-white" />
          </div>

          <button
            onClick={() => router.push("/submit-project")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-all"
          >
            <Plus size={14} /> Create New
          </button>

          <div className="ml-auto flex items-center gap-2">
            <div className="bg-white border border-slate-100 rounded-md px-2.5 py-1 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Layouts</span>
              <span className="text-[11px] font-semibold text-slate-700">{layoutsData?.features.length ?? 0}</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-md px-2.5 py-1 flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400">Lines</span>
              <span className="text-[11px] font-semibold text-slate-700">{linesData?.features.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List panel */}
        <div className="w-[420px] overflow-y-auto border-r border-slate-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-sm text-slate-400">Loading...</div>
          ) : tab === "layouts" ? (
            <div className="p-4 space-y-2">
              {layouts.map((layout: LayoutFeature) => {
                const p = layout.properties;
                return (
                  <div key={p.layoutId} className="bg-white rounded-lg border border-slate-100 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-900 truncate">{p.title}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.name} &middot; {p.location}</p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Badge className={cn("text-[10px]", CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS.Feature)}>
                          {p.category}
                        </Badge>
                        {p.category === "Feature" && (
                          <Badge className={cn("text-[10px]", FEATURE_TYPE_COLORS[p.featureType] ?? "")}>
                            {p.featureType}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{p.area} acres</span>
                        {p.total > 0 && <span>{p.total} units</span>}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full border border-slate-100" style={{ backgroundColor: p.color }} />
                        <button
                          onClick={() => openEditLayout(layout)}
                          className="p-1 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "layout", id: p.layoutId, name: p.title })}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {lines.map((line: LineFeature) => {
                const p = line.properties;
                return (
                  <div key={p.polyLineId} className="bg-white rounded-lg border border-slate-100 p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-slate-900 truncate">{p.name}</h3>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{p.description}</p>
                      </div>
                      <Badge className={cn(
                        "text-[10px]",
                        p.polyLineType === "POP" ? "bg-green-50 text-green-700 border-green-200" :
                        p.polyLineType === "INVEST" ? "bg-blue-50 text-blue-700 border-blue-200" :
                        "bg-slate-50 text-slate-700 border-slate-100"
                      )}>
                        {p.polyLineType === "POP" ? "Popular" : p.polyLineType === "INVEST" ? "Investment" : "Private"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span>{p.length} km</span>
                        <span>Opacity: {p.opacity}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4 rounded-full border border-slate-100" style={{ backgroundColor: p.color }} />
                        <button
                          onClick={() => openEditLine(line)}
                          className="p-1 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ type: "line", id: p.polyLineId, name: p.name })}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Map panel */}
        <div className="flex-1 relative">
          <ManageLayoutsMap layouts={layoutsData} lines={linesData} />
        </div>
      </div>

      {/* Edit Layout Dialog */}
      <Dialog open={editLayout !== null} onOpenChange={() => setEditLayout(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Layout</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">Title</label>
              <Input value={String(editForm.title || "")} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Name</label>
                <Input value={String(editForm.name || "")} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Location</label>
                <Input value={String(editForm.location || "")} onChange={(e) => setEditForm(f => ({ ...f, location: e.target.value }))} className="h-8 text-xs" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Category</label>
                <select value={String(editForm.category || "Feature")} onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))} className="w-full h-8 text-xs border border-slate-100 rounded-md px-2">
                  <option value="Feature">Feature</option>
                  <option value="Flats">Flats</option>
                  <option value="Plots">Plots</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Feature Type</label>
                <select value={String(editForm.featureType || "Popular")} onChange={(e) => setEditForm(f => ({ ...f, featureType: e.target.value }))} className="w-full h-8 text-xs border border-slate-100 rounded-md px-2">
                  <option value="Popular">Popular</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Red Zones">Red Zones</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Area (acres)</label>
                <Input type="number" value={editForm.area ?? ""} onChange={(e) => setEditForm(f => ({ ...f, area: Number(e.target.value) }))} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Total Units</label>
                <Input type="number" value={editForm.total ?? ""} onChange={(e) => setEditForm(f => ({ ...f, total: Number(e.target.value) }))} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Color</label>
                <Input type="color" value={String(editForm.color || "#3b82f6")} onChange={(e) => setEditForm(f => ({ ...f, color: e.target.value }))} className="h-8 p-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setEditLayout(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-100 rounded-md hover:bg-slate-50">Cancel</button>
            <button onClick={handleSaveLayout} className="px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-1"><Save size={12} /> Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Line Dialog */}
      <Dialog open={editLine !== null} onOpenChange={() => setEditLine(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Edit Line</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">Name</label>
              <Input value={String(editForm.name || "")} onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">Description</label>
              <Input value={String(editForm.description || "")} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} className="h-8 text-xs" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Length (km)</label>
                <Input type="number" value={editForm.length ?? ""} onChange={(e) => setEditForm(f => ({ ...f, length: Number(e.target.value) }))} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Opacity</label>
                <Input type="number" step="0.1" min="0" max="1" value={editForm.opacity ?? ""} onChange={(e) => setEditForm(f => ({ ...f, opacity: Number(e.target.value) }))} className="h-8 text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Color</label>
                <Input type="color" value={String(editForm.color || "#f97316")} onChange={(e) => setEditForm(f => ({ ...f, color: e.target.value }))} className="h-8 p-1" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-medium text-slate-600 mb-1 block">Route Type</label>
              <select value={String(editForm.polyLineType || "POP")} onChange={(e) => setEditForm(f => ({ ...f, polyLineType: e.target.value }))} className="w-full h-8 text-xs border border-slate-100 rounded-md px-2">
                <option value="POP">Popular</option>
                <option value="INVEST">Investment</option>
                <option value="PRIV">Private</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <button onClick={() => setEditLine(null)} className="px-3 py-1.5 text-xs text-slate-600 border border-slate-100 rounded-md hover:bg-slate-50">Cancel</button>
            <button onClick={handleSaveLine} className="px-3 py-1.5 text-xs bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-1"><Save size={12} /> Save</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.name}&rdquo;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

"use client";

import React, { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  PenTool, MapPin, FileText, CheckCircle, ChevronRight, ChevronLeft, Layers,
} from "lucide-react";
import { useLayouts, useLayoutMutation, useLines, useLineMutation } from "@/hooks/data";
import type { LayoutFeature, LineFeature, LayoutCategory, FeatureType, LineType } from "@/lib/data/types/faith-tracker";
import type { DrawnFeature } from "@/components/faith-tracker/drawing-map";
import dynamic from "next/dynamic";

const DrawingMap = dynamic(() => import("@/components/faith-tracker/drawing-map"), { ssr: false });

const STEPS = [
  { key: "type", label: "Feature Type", icon: Layers },
  { key: "draw", label: "Draw on Map", icon: PenTool },
  { key: "details", label: "Details", icon: FileText },
  { key: "review", label: "Review & Submit", icon: CheckCircle },
] as const;

const LAYOUT_CATEGORIES: { value: LayoutCategory; label: string }[] = [
  { value: "Feature", label: "Zone Feature (Popular/Upcoming/Red Zone)" },
  { value: "Flats", label: "Flats Project" },
  { value: "Plots", label: "Plots Project" },
];

const FEATURE_TYPES: { value: FeatureType; label: string; color: string }[] = [
  { value: "Popular", label: "Popular Zone", color: "#4CAF50" },
  { value: "Upcoming", label: "Upcoming Zone", color: "#2196F3" },
  { value: "Red Zones", label: "Red Zone", color: "#f44336" },
];

const LINE_TYPES: { value: LineType; label: string }[] = [
  { value: "POP", label: "Popular Route" },
  { value: "INVEST", label: "Investment Corridor" },
  { value: "PRIV", label: "Private Route" },
];

const COLOR_OPTIONS = ["#4CAF50", "#2196F3", "#f44336", "#FF9800", "#9C27B0", "#795548", "#607D8B", "#E91E63"];

type FeatureKind = "layout" | "line";

export default function SubmitProjectPage() {
  const [step, setStep] = useState(0);
  const [featureKind, setFeatureKind] = useState<FeatureKind>("layout");
  const [drawnFeature, setDrawnFeature] = useState<DrawnFeature | null>(null);

  // Layout form
  const [layoutForm, setLayoutForm] = useState({
    title: "", name: "", category: "Feature" as LayoutCategory, featureType: "Popular" as FeatureType,
    area: "", total: "", available: "", booked: "", mandal: "", location: "", color: "#4CAF50",
  });

  // Line form
  const [lineForm, setLineForm] = useState({
    name: "", description: "", length: "", color: "#FF9800", opacity: "0.8", polyLineType: "POP" as LineType,
  });

  // Data hooks
  const { data: layoutsData } = useLayouts();
  const { data: linesData } = useLines();
  const layoutMutation = useLayoutMutation();
  const lineMutation = useLineMutation();

  const handleFeatureCreated = useCallback((feature: DrawnFeature) => {
    setDrawnFeature(feature);
    // Auto-advance to details step
    setStep(2);
  }, []);

  const canNext = () => {
    if (step === 0) return true; // Feature kind selected
    if (step === 1) return drawnFeature !== null;
    if (step === 2) {
      if (featureKind === "layout") return layoutForm.title && layoutForm.name;
      return lineForm.name;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!drawnFeature) return;

    try {
      if (featureKind === "layout" && drawnFeature.type === "polygon") {
        const layout: LayoutFeature = {
          type: "Feature",
          properties: {
            layoutId: `layout-${Date.now()}`,
            title: layoutForm.title,
            category: layoutForm.category,
            featureType: layoutForm.featureType,
            name: layoutForm.name,
            area: Number(layoutForm.area) || 0,
            total: Number(layoutForm.total) || 0,
            available: Number(layoutForm.available) || 0,
            booked: Number(layoutForm.booked) || 0,
            mandal: layoutForm.mandal,
            location: layoutForm.location,
            color: layoutForm.color,
            userId: "demo-user",
          },
          geometry: {
            type: "Polygon",
            coordinates: drawnFeature.coordinates as number[][][],
          },
        };
        await layoutMutation.create.mutateAsync(layout);
      } else if (featureKind === "line" && drawnFeature.type === "line") {
        const line: LineFeature = {
          type: "Feature",
          properties: {
            polyLineId: `line-${Date.now()}`,
            name: lineForm.name,
            description: lineForm.description,
            length: Number(lineForm.length) || 0,
            color: lineForm.color,
            opacity: Number(lineForm.opacity) || 0.8,
            polyLineType: lineForm.polyLineType,
            isShownForUsers: 1,
            userId: "demo-user",
          },
          geometry: {
            type: "LineString",
            coordinates: drawnFeature.coordinates as number[][],
          },
        };
        await lineMutation.create.mutateAsync(line);
      }

      toast.success("Feature submitted successfully!");
      // Reset form
      setStep(0);
      setDrawnFeature(null);
      setLayoutForm({ title: "", name: "", category: "Feature", featureType: "Popular", area: "", total: "", available: "", booked: "", mandal: "", location: "", color: "#4CAF50" });
      setLineForm({ name: "", description: "", length: "", color: "#FF9800", opacity: "0.8", polyLineType: "POP" });
    } catch {
      toast.error("Failed to submit feature");
    }
  };

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: "100%", minHeight: 0 }}>
      {/* Step indicator */}
      <div className="px-6 py-3 bg-white border-b border-slate-100">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <button
                onClick={() => i <= step && setStep(i)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all",
                  i === step ? "bg-primary text-white" :
                  i < step ? "bg-green-50 text-green-700" :
                  "text-slate-400"
                )}
              >
                <s.icon size={14} />
                {s.label}
              </button>
              {i < STEPS.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {step === 0 && (
          <div className="flex-1 overflow-auto">
            <div className="w-full max-w-[600px] mx-auto px-6 py-6 space-y-6">
              <h2 className="text-sm font-semibold text-slate-900">What type of feature?</h2>

              {/* Layout vs Line */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setFeatureKind("layout")}
                  className={cn(
                    "p-5 rounded-lg border-2 text-left transition-all",
                    featureKind === "layout" ? "border-primary bg-primary/5" : "border-slate-100 bg-white hover:border-slate-300"
                  )}
                >
                  <Layers size={24} className={featureKind === "layout" ? "text-primary" : "text-slate-400"} />
                  <h3 className="text-sm font-semibold mt-2">Layout (Polygon)</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Draw a zone, project area, or land boundary</p>
                </button>
                <button
                  onClick={() => setFeatureKind("line")}
                  className={cn(
                    "p-5 rounded-lg border-2 text-left transition-all",
                    featureKind === "line" ? "border-primary bg-primary/5" : "border-slate-100 bg-white hover:border-slate-300"
                  )}
                >
                  <PenTool size={24} className={featureKind === "line" ? "text-primary" : "text-slate-400"} />
                  <h3 className="text-sm font-semibold mt-2">Line (Route)</h3>
                  <p className="text-[11px] text-slate-500 mt-1">Draw a highway, corridor, or road</p>
                </button>
              </div>

              {/* Layout category selection */}
              {featureKind === "layout" && (
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-2 block">Category</label>
                  <div className="space-y-2">
                    {LAYOUT_CATEGORIES.map(cat => (
                      <button
                        key={cat.value}
                        onClick={() => setLayoutForm(f => ({ ...f, category: cat.value }))}
                        className={cn(
                          "w-full p-3 text-left rounded-lg border transition-all text-xs",
                          layoutForm.category === cat.value ? "border-primary bg-primary/5 font-medium" : "border-slate-100 bg-white hover:border-slate-300"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feature type for zones */}
              {featureKind === "layout" && layoutForm.category === "Feature" && (
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-2 block">Zone Type</label>
                  <div className="flex gap-2">
                    {FEATURE_TYPES.map(ft => (
                      <button
                        key={ft.value}
                        onClick={() => setLayoutForm(f => ({ ...f, featureType: ft.value, color: ft.color }))}
                        className={cn(
                          "flex-1 p-3 rounded-lg border transition-all text-xs text-center",
                          layoutForm.featureType === ft.value ? "border-primary bg-primary/5 font-medium" : "border-slate-100 bg-white hover:border-slate-300"
                        )}
                      >
                        <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: ft.color }} />
                        {ft.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Line type */}
              {featureKind === "line" && (
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-2 block">Route Type</label>
                  <div className="flex gap-2">
                    {LINE_TYPES.map(lt => (
                      <button
                        key={lt.value}
                        onClick={() => setLineForm(f => ({ ...f, polyLineType: lt.value }))}
                        className={cn(
                          "flex-1 p-3 rounded-lg border transition-all text-xs text-center",
                          lineForm.polyLineType === lt.value ? "border-primary bg-primary/5 font-medium" : "border-slate-100 bg-white hover:border-slate-300"
                        )}
                      >
                        {lt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="flex-1 relative">
            <DrawingMap
              mode={featureKind === "layout" ? "polygon" : "line"}
              existingLayouts={layoutsData}
              existingLines={linesData}
              onFeatureCreated={handleFeatureCreated}
            />
            {/* Draw instructions overlay */}
            <div className="absolute top-3 right-3 z-[1000] bg-white rounded-lg border border-slate-100 shadow-sm p-3 max-w-[220px]">
              <h4 className="text-xs font-semibold text-slate-900 mb-1">
                {featureKind === "layout" ? "Draw a Polygon" : "Draw a Line"}
              </h4>
              <p className="text-[11px] text-slate-500">
                {featureKind === "layout"
                  ? "Click on the map to place polygon vertices. Click the first point again to close the shape."
                  : "Click on the map to add line points. Double-click to finish the line."}
              </p>
              {drawnFeature && (
                <div className="mt-2 p-2 bg-green-50 rounded text-[11px] text-green-700">
                  Shape drawn! Click Next to continue.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-1 overflow-auto">
            <div className="w-full max-w-[600px] mx-auto px-6 py-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">
                {featureKind === "layout" ? "Layout Details" : "Line Details"}
              </h2>

              {featureKind === "layout" ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-1 block">Title *</label>
                      <Input value={layoutForm.title} onChange={e => setLayoutForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Green Valley Flats" className="text-xs" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-1 block">Name *</label>
                      <Input value={layoutForm.name} onChange={e => setLayoutForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., GV Phase 1" className="text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-1 block">Location</label>
                      <Input value={layoutForm.location} onChange={e => setLayoutForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g., Gachibowli" className="text-xs" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-1 block">Mandal</label>
                      <Input value={layoutForm.mandal} onChange={e => setLayoutForm(f => ({ ...f, mandal: e.target.value }))} placeholder="e.g., Serilingampally" className="text-xs" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-1 block">Area (acres)</label>
                      <Input type="number" value={layoutForm.area} onChange={e => setLayoutForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g., 50" className="text-xs" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-1 block">Total Units</label>
                      <Input type="number" value={layoutForm.total} onChange={e => setLayoutForm(f => ({ ...f, total: e.target.value }))} placeholder="e.g., 200" className="text-xs" />
                    </div>
                  </div>
                  {(layoutForm.category === "Flats" || layoutForm.category === "Plots") && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 mb-1 block">Available</label>
                        <Input type="number" value={layoutForm.available} onChange={e => setLayoutForm(f => ({ ...f, available: e.target.value }))} placeholder="e.g., 150" className="text-xs" />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-600 mb-1 block">Booked</label>
                        <Input type="number" value={layoutForm.booked} onChange={e => setLayoutForm(f => ({ ...f, booked: e.target.value }))} placeholder="e.g., 50" className="text-xs" />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">Color</label>
                    <div className="flex gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c}
                          onClick={() => setLayoutForm(f => ({ ...f, color: c }))}
                          className={cn("w-7 h-7 rounded-full border-2 transition-all", layoutForm.color === c ? "border-slate-900 scale-110" : "border-transparent")}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">Name *</label>
                    <Input value={lineForm.name} onChange={e => setLineForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., ORR Highway" className="text-xs" />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">Description</label>
                    <textarea
                      value={lineForm.description}
                      onChange={e => setLineForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe the route..."
                      className="w-full h-20 px-3 py-2 text-xs border border-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-1 block">Length (km)</label>
                      <Input type="number" value={lineForm.length} onChange={e => setLineForm(f => ({ ...f, length: e.target.value }))} placeholder="e.g., 158" className="text-xs" />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-slate-600 mb-1 block">Opacity</label>
                      <Input type="number" step="0.1" min="0" max="1" value={lineForm.opacity} onChange={e => setLineForm(f => ({ ...f, opacity: e.target.value }))} className="text-xs" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 mb-1 block">Color</label>
                    <div className="flex gap-2">
                      {COLOR_OPTIONS.map(c => (
                        <button
                          key={c}
                          onClick={() => setLineForm(f => ({ ...f, color: c }))}
                          className={cn("w-7 h-7 rounded-full border-2 transition-all", lineForm.color === c ? "border-slate-900 scale-110" : "border-transparent")}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex-1 overflow-auto">
            <div className="w-full max-w-[600px] mx-auto px-6 py-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Review & Submit</h2>

              <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-400">Type:</span> <span className="font-medium capitalize">{featureKind}</span></div>
                  {featureKind === "layout" ? (
                    <>
                      <div><span className="text-slate-400">Title:</span> <span className="font-medium">{layoutForm.title || "—"}</span></div>
                      <div><span className="text-slate-400">Name:</span> <span className="font-medium">{layoutForm.name || "—"}</span></div>
                      <div><span className="text-slate-400">Category:</span> <span className="font-medium">{layoutForm.category}</span></div>
                      {layoutForm.category === "Feature" && (
                        <div><span className="text-slate-400">Zone Type:</span> <span className="font-medium">{layoutForm.featureType}</span></div>
                      )}
                      <div><span className="text-slate-400">Location:</span> <span className="font-medium">{layoutForm.location || "—"}</span></div>
                      <div><span className="text-slate-400">Area:</span> <span className="font-medium">{layoutForm.area || "—"} acres</span></div>
                      {layoutForm.total && (
                        <div><span className="text-slate-400">Units:</span> <span className="font-medium">{layoutForm.total} total</span></div>
                      )}
                    </>
                  ) : (
                    <>
                      <div><span className="text-slate-400">Name:</span> <span className="font-medium">{lineForm.name || "—"}</span></div>
                      <div><span className="text-slate-400">Route Type:</span> <span className="font-medium">{lineForm.polyLineType}</span></div>
                      <div><span className="text-slate-400">Length:</span> <span className="font-medium">{lineForm.length || "—"} km</span></div>
                    </>
                  )}
                </div>

                {/* Color preview */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">Color:</span>
                  <div
                    className="w-5 h-5 rounded-full border border-slate-100"
                    style={{ backgroundColor: featureKind === "layout" ? layoutForm.color : lineForm.color }}
                  />
                </div>

                {/* Geometry info */}
                {drawnFeature && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400">Geometry:</span>
                    <span className="text-xs font-medium ml-1">
                      {drawnFeature.type === "polygon"
                        ? `Polygon with ${(drawnFeature.coordinates as number[][][])[0]?.length || 0} vertices`
                        : `Line with ${(drawnFeature.coordinates as number[][]).length} points`}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-6 py-3 border-t border-slate-100 bg-white flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className={cn("flex items-center gap-1 px-4 py-2 text-xs rounded-md transition-all", step === 0 ? "text-slate-300" : "text-slate-600 hover:bg-slate-50 border border-slate-100")}
        >
          <ChevronLeft size={14} /> Previous
        </button>
        {step < 3 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className={cn("flex items-center gap-1 px-4 py-2 text-xs rounded-md transition-all", canNext() ? "bg-primary text-white hover:bg-primary/90" : "bg-slate-100 text-slate-300")}
          >
            Next <ChevronRight size={14} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={layoutMutation.create.isPending || lineMutation.create.isPending}
            className="flex items-center gap-1 px-4 py-2 text-xs bg-green-500 text-white rounded-md hover:bg-green-600 transition-all"
          >
            <CheckCircle size={14} /> Submit Feature
          </button>
        )}
      </div>
    </div>
  );
}

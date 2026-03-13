"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Home, MapPin, ImageIcon, FileText, CheckCircle,
  Upload, ChevronRight, ChevronLeft,
} from "lucide-react";

const STEPS = [
  { key: "details", label: "Property Details", icon: Home },
  { key: "location", label: "Location", icon: MapPin },
  { key: "photos", label: "Photos", icon: ImageIcon },
  { key: "additional", label: "Additional Info", icon: FileText },
  { key: "review", label: "Review & Submit", icon: CheckCircle },
] as const;

const CATEGORIES = ["Commercial", "Residential", "Villas", "Apartments", "Plots", "Farm Land"];
const CITIES = ["Hyderabad", "Bengaluru", "Chennai", "Warangal", "Karim Nagar", "Mancherial"];

export default function SubmitListingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: "", description: "", category: "", listingType: "sale",
    price: "", area: "", beds: "", bathrooms: "",
    city: "", address: "", latitude: "", longitude: "",
    phone: "", contactName: "",
  });

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const canNext = () => {
    if (step === 0) return form.title && form.category && form.price;
    if (step === 1) return form.city;
    return true;
  };

  const handleSubmit = () => {
    toast.success("Listing submitted successfully! (demo mode)");
    setStep(0);
    setForm({ title: "", description: "", category: "", listingType: "sale", price: "", area: "", beds: "", bathrooms: "", city: "", address: "", latitude: "", longitude: "", phone: "", contactName: "" });
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

      {/* Form content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full max-w-[700px] mx-auto px-6 py-6">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Property Details</h2>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Title *</label>
                <Input value={form.title} onChange={e => updateForm("title", e.target.value)} placeholder="e.g., 3 BHK Apartment in Gachibowli" className="text-xs" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => updateForm("description", e.target.value)} placeholder="Describe your property..." className="w-full h-24 px-3 py-2 text-xs border border-slate-100 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Category *</label>
                  <select value={form.category} onChange={e => updateForm("category", e.target.value)} className="w-full h-9 px-3 text-xs border border-slate-100 rounded-md">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Listing Type</label>
                  <div className="flex gap-2">
                    {["sale", "rental"].map(t => (
                      <button key={t} onClick={() => updateForm("listingType", t)} className={cn("flex-1 px-3 py-2 text-xs rounded-md border transition-all capitalize", form.listingType === t ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-100")}>
                        {t === "sale" ? "For Sale" : "For Rent"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Price (₹) *</label>
                  <Input type="number" value={form.price} onChange={e => updateForm("price", e.target.value)} placeholder="e.g., 2500000" className="text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Area (sq.ft)</label>
                  <Input type="number" value={form.area} onChange={e => updateForm("area", e.target.value)} placeholder="e.g., 1200" className="text-xs" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Bedrooms</label>
                  <Input type="number" value={form.beds} onChange={e => updateForm("beds", e.target.value)} placeholder="e.g., 3" className="text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Bathrooms</label>
                  <Input type="number" value={form.bathrooms} onChange={e => updateForm("bathrooms", e.target.value)} placeholder="e.g., 2" className="text-xs" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Location</h2>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">City *</label>
                <select value={form.city} onChange={e => updateForm("city", e.target.value)} className="w-full h-9 px-3 text-xs border border-slate-100 rounded-md">
                  <option value="">Select city</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-600 mb-1 block">Address</label>
                <Input value={form.address} onChange={e => updateForm("address", e.target.value)} placeholder="Full address" className="text-xs" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Latitude</label>
                  <Input type="number" value={form.latitude} onChange={e => updateForm("latitude", e.target.value)} placeholder="e.g., 17.385" className="text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Longitude</label>
                  <Input type="number" value={form.longitude} onChange={e => updateForm("longitude", e.target.value)} placeholder="e.g., 78.486" className="text-xs" />
                </div>
              </div>
              <div className="bg-slate-100 rounded-lg h-48 flex items-center justify-center text-sm text-slate-400">
                <MapPin size={20} className="mr-2" /> Map picker will be integrated with Leaflet Geoman
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Photos</h2>
              <div className="border-2 border-dashed border-slate-100 rounded-lg p-8 text-center">
                <Upload size={32} className="mx-auto text-slate-300" />
                <p className="text-sm text-slate-500 mt-2">Drag and drop photos here</p>
                <p className="text-[11px] text-slate-400 mt-1">PNG, JPG up to 5 images</p>
                <button className="mt-3 px-4 py-2 text-xs bg-primary text-white rounded-md hover:bg-primary/90">Browse Files</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Additional Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Contact Name</label>
                  <Input value={form.contactName} onChange={e => updateForm("contactName", e.target.value)} placeholder="Your name" className="text-xs" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 mb-1 block">Phone</label>
                  <Input value={form.phone} onChange={e => updateForm("phone", e.target.value)} placeholder="+91 9876543210" className="text-xs" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-900">Review & Submit</h2>
              <div className="bg-white rounded-lg border border-slate-100 p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-slate-400">Title:</span> <span className="font-medium">{form.title || "—"}</span></div>
                  <div><span className="text-slate-400">Category:</span> <span className="font-medium">{form.category || "—"}</span></div>
                  <div><span className="text-slate-400">Type:</span> <span className="font-medium capitalize">{form.listingType}</span></div>
                  <div><span className="text-slate-400">Price:</span> <span className="font-medium">₹{form.price || "—"}</span></div>
                  <div><span className="text-slate-400">City:</span> <span className="font-medium">{form.city || "—"}</span></div>
                  <div><span className="text-slate-400">Area:</span> <span className="font-medium">{form.area || "—"} sqft</span></div>
                </div>
                {form.description && <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100">{form.description}</p>}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className={cn("flex items-center gap-1 px-4 py-2 text-xs rounded-md transition-all", step === 0 ? "text-slate-300" : "text-slate-600 hover:bg-white border border-slate-100")}
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canNext()}
                className={cn("flex items-center gap-1 px-4 py-2 text-xs rounded-md transition-all", canNext() ? "bg-primary text-white hover:bg-primary/90" : "bg-slate-100 text-slate-300")}
              >
                Next <ChevronRight size={14} />
              </button>
            ) : (
              <button onClick={handleSubmit} className="flex items-center gap-1 px-4 py-2 text-xs bg-green-500 text-white rounded-md hover:bg-green-600">
                <CheckCircle size={14} /> Submit Listing
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

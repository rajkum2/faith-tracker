"use client";

import React from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { X, Bed, Bath, Maximize, MapPin, Star, ArrowUpDown } from "lucide-react";
import type { PropertyListing } from "@/lib/data/types/faith-tracker";

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lac`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price.toLocaleString("en-IN")}`;
}

interface ComparePanelProps {
  properties: PropertyListing[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: number) => void;
}

export default function ComparePanel({ properties, open, onClose, onRemove }: ComparePanelProps) {
  if (properties.length === 0) return null;

  const rows: { label: string; key: string; render: (p: PropertyListing) => React.ReactNode }[] = [
    {
      label: "Image",
      key: "image",
      render: (p) => (
        <div className="h-32 rounded-lg overflow-hidden bg-slate-100">
          <img
            src={`/${p.gridimg}`} alt={p.title}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/blog/8.jpg'; }}
          />
        </div>
      ),
    },
    {
      label: "Price",
      key: "price",
      render: (p) => (
        <span className="text-sm font-bold text-primary">
          {p.rental ? `${formatPrice(p.monthlyprice)}/mo` : formatPrice(p.monthlyprice)}
        </span>
      ),
    },
    {
      label: "Type",
      key: "type",
      render: (p) => (
        <div className="flex gap-1">
          {p.sale && <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px]">Sale</Badge>}
          {p.rental && <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">Rent</Badge>}
        </div>
      ),
    },
    {
      label: "Bedrooms",
      key: "beds",
      render: (p) => <span className="text-xs font-medium">{p.beds || "—"}</span>,
    },
    {
      label: "Bathrooms",
      key: "bathrooms",
      render: (p) => <span className="text-xs font-medium">{p.bathrooms || "—"}</span>,
    },
    {
      label: "Area",
      key: "area",
      render: (p) => <span className="text-xs font-medium">{p.area.toLocaleString()} sqft</span>,
    },
    {
      label: "Price/sqft",
      key: "pricesqft",
      render: (p) => (
        <span className="text-xs font-medium">
          {p.area > 0 ? formatPrice(Math.round(p.monthlyprice / p.area)) : "—"}
        </span>
      ),
    },
    {
      label: "Featured",
      key: "star",
      render: (p) => p.star ? <Star size={14} className="text-amber-400 fill-amber-400" /> : <span className="text-xs text-slate-400">—</span>,
    },
    {
      label: "Status",
      key: "status",
      render: (p) => (
        <span className="text-xs font-medium">
          {p.pending ? "Pending" : p.recent ? "New" : "Active"}
        </span>
      ),
    },
    {
      label: "Agent",
      key: "agent",
      render: (p) => (
        <div className="flex items-center gap-2">
          <img src={`/${p.authorimg}`} alt={p.authorname} className="w-6 h-6 rounded-full" onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/people/2.jpg'; }} />
          <span className="text-[11px]">{p.authorname}</span>
        </div>
      ),
    },
    {
      label: "Listed",
      key: "date",
      render: (p) => <span className="text-[11px] text-slate-500">{p.postdate}</span>,
    },
  ];

  // Highlight best values
  const getBestPrice = () => {
    const prices = properties.map(p => p.monthlyprice);
    return Math.min(...prices);
  };
  const getBestArea = () => {
    const areas = properties.map(p => p.area);
    return Math.max(...areas);
  };

  const bestPrice = getBestPrice();
  const bestArea = getBestArea();

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[700px] max-w-[90vw] overflow-y-auto" side="right">
        <SheetHeader>
          <SheetTitle className="text-base flex items-center gap-2">
            <ArrowUpDown size={16} /> Compare Properties ({properties.length})
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-[11px] text-slate-400 font-medium px-2 py-2 w-[100px]">Property</th>
                {properties.map(p => (
                  <th key={p.id} className="text-left px-2 py-2">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-medium text-slate-900 line-clamp-2 pr-2">{p.title}</span>
                      <button onClick={() => onRemove(p.id)} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key} className="border-t border-slate-100">
                  <td className="text-[11px] text-slate-400 font-medium px-2 py-2.5 align-top">{row.label}</td>
                  {properties.map(p => (
                    <td
                      key={p.id}
                      className={`px-2 py-2.5 align-top ${
                        row.key === "price" && p.monthlyprice === bestPrice ? "bg-green-50/50" :
                        row.key === "area" && p.area === bestArea ? "bg-green-50/50" : ""
                      }`}
                    >
                      {row.render(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SheetContent>
    </Sheet>
  );
}

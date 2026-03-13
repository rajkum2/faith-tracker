"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { usePropertyDetail, usePropertyListings } from "@/hooks/data";
import { Badge } from "@/components/ui/badge";
import {
  Bed, Bath, Maximize, MapPin, Star, Calendar, User,
  ArrowLeft, Phone, Mail, Share2, Heart, ChevronRight,
} from "lucide-react";
import type { PropertyListing } from "@/lib/data/types/faith-tracker";
import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("@/components/faith-tracker/property-map"), { ssr: false });

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lac`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price.toLocaleString("en-IN")}`;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col bg-slate-50 h-full animate-pulse">
      <div className="px-6 py-4"><div className="h-4 w-48 bg-slate-200 rounded" /></div>
      <div className="flex-1 px-6 py-4">
        <div className="h-64 bg-slate-200 rounded-lg mb-4" />
        <div className="h-6 w-72 bg-slate-200 rounded mb-2" />
        <div className="h-4 w-48 bg-slate-200 rounded" />
      </div>
    </div>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { data: listing, isLoading } = usePropertyDetail(id);
  const { data: allListings = [] } = usePropertyListings({ limit: 50 });

  if (isLoading) return <LoadingSkeleton />;

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 gap-3">
        <div className="text-sm text-slate-500">Property not found</div>
        <button onClick={() => router.push("/properties")} className="text-xs text-primary hover:underline">
          Back to Properties
        </button>
      </div>
    );
  }

  // Related listings (same type, exclude current)
  const related = allListings
    .filter((l: PropertyListing) => l.id !== listing.id && (listing.sale ? l.sale : l.rental))
    .slice(0, 4);

  return (
    <div className="flex flex-col bg-slate-50" style={{ height: "100%", minHeight: 0 }}>
      {/* Top bar */}
      <div className="px-5 py-2 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-primary rounded-md border border-slate-100 bg-white transition-all"
          >
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span className="hover:text-primary cursor-pointer" onClick={() => router.push("/properties")}>Properties</span>
            <ChevronRight size={12} />
            <span className="text-slate-700 font-medium">{listing.title}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-primary rounded-md border border-slate-100 bg-white transition-all">
              <Heart size={14} /> Save
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-primary rounded-md border border-slate-100 bg-white transition-all">
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="w-full max-w-[1100px] mx-auto px-6 py-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Main info (2 cols) */}
            <div className="col-span-2 space-y-5">
              {/* Hero image */}
              <div className="rounded-lg overflow-hidden bg-slate-100 h-[360px]">
                <img
                  src={`/${listing.gridimg}`}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/blog/8.jpg'; }}
                />
              </div>

              {/* Title & price */}
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-slate-900">{listing.title}</h1>
                    <div className="flex items-center gap-2 mt-1.5">
                      {listing.sale && <Badge className="bg-green-50 text-green-700 border-green-200">For Sale</Badge>}
                      {listing.rental && <Badge className="bg-blue-50 text-blue-700 border-blue-200">For Rent</Badge>}
                      {listing.pending && <Badge className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>}
                      {listing.star && (
                        <span className="flex items-center gap-1 text-[11px] text-amber-500">
                          <Star size={12} className="fill-amber-400" /> Featured
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {listing.rental
                        ? `${formatPrice(listing.monthlyprice)}/mo`
                        : formatPrice(listing.monthlyprice)}
                    </div>
                    {listing.area > 0 && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {formatPrice(Math.round(listing.monthlyprice / listing.area))}/sqft
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Property details grid */}
              <div className="grid grid-cols-4 gap-3">
                {listing.beds > 0 && (
                  <div className="bg-white rounded-lg border border-slate-100 p-3 text-center">
                    <Bed size={20} className="mx-auto text-slate-400" />
                    <div className="text-sm font-semibold mt-1.5">{listing.beds}</div>
                    <div className="text-[10px] text-slate-400">Bedrooms</div>
                  </div>
                )}
                {listing.bathrooms > 0 && (
                  <div className="bg-white rounded-lg border border-slate-100 p-3 text-center">
                    <Bath size={20} className="mx-auto text-slate-400" />
                    <div className="text-sm font-semibold mt-1.5">{listing.bathrooms}</div>
                    <div className="text-[10px] text-slate-400">Bathrooms</div>
                  </div>
                )}
                <div className="bg-white rounded-lg border border-slate-100 p-3 text-center">
                  <Maximize size={20} className="mx-auto text-slate-400" />
                  <div className="text-sm font-semibold mt-1.5">{listing.area.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">Sq.ft</div>
                </div>
                <div className="bg-white rounded-lg border border-slate-100 p-3 text-center">
                  <MapPin size={20} className="mx-auto text-slate-400" />
                  <div className="text-sm font-semibold mt-1.5">{listing.geometry.coordinates[0].toFixed(2)}</div>
                  <div className="text-[10px] text-slate-400">Latitude</div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg border border-slate-100 p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-2">Description</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{listing.text}</p>
              </div>

              {/* Map */}
              <div className="bg-white rounded-lg border border-slate-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                  <h2 className="text-sm font-semibold text-slate-900">Location</h2>
                </div>
                <div className="h-[280px]">
                  <PropertyMap
                    listings={[listing]}
                    hoveredId={null}
                    onMarkerClick={() => {}}
                    onMarkerHover={() => {}}
                    center={[listing.geometry.coordinates[0], listing.geometry.coordinates[1]]}
                    zoom={14}
                  />
                </div>
              </div>
            </div>

            {/* Right: Sidebar (1 col) */}
            <div className="space-y-4">
              {/* Agent card */}
              <div className="bg-white rounded-lg border border-slate-100 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Listed By</h3>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={`/${listing.authorimg}`}
                    alt={listing.authorname}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/people/2.jpg'; }}
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-900">{listing.authorname}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar size={10} /> {listing.postdate}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                    <Phone size={14} /> Call Agent
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs border border-slate-100 text-slate-600 rounded-md hover:bg-slate-50 transition-colors">
                    <Mail size={14} /> Send Message
                  </button>
                </div>
              </div>

              {/* Quick facts */}
              <div className="bg-white rounded-lg border border-slate-100 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Facts</h3>
                <div className="space-y-2.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Type</span>
                    <span className="font-medium text-slate-700">{listing.sale ? "For Sale" : "For Rent"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Price</span>
                    <span className="font-medium text-slate-700">{formatPrice(listing.monthlyprice)}</span>
                  </div>
                  {listing.beds > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Bedrooms</span>
                      <span className="font-medium text-slate-700">{listing.beds}</span>
                    </div>
                  )}
                  {listing.bathrooms > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Bathrooms</span>
                      <span className="font-medium text-slate-700">{listing.bathrooms}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Area</span>
                    <span className="font-medium text-slate-700">{listing.area.toLocaleString()} sqft</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Status</span>
                    <span className="font-medium text-slate-700">
                      {listing.pending ? "Pending" : listing.recent ? "Recently Added" : "Active"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              <div className="bg-white rounded-lg border border-slate-100 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Coordinates</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Latitude</span>
                    <span className="font-medium text-slate-700">{listing.geometry.coordinates[0].toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Longitude</span>
                    <span className="font-medium text-slate-700">{listing.geometry.coordinates[1].toFixed(6)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related listings */}
          {related.length > 0 && (
            <div className="mt-8">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Similar Properties</h2>
              <div className="grid grid-cols-4 gap-4">
                {related.map((rel: PropertyListing) => (
                  <div
                    key={rel.id}
                    className="bg-white rounded-lg border border-slate-100 overflow-hidden cursor-pointer hover:shadow-elevation-1 transition-all"
                    onClick={() => router.push(`/properties/${rel.id}`)}
                  >
                    <div className="h-28 bg-slate-100 overflow-hidden">
                      <img
                        src={`/${rel.gridimg}`}
                        alt={rel.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/blog/8.jpg'; }}
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-xs font-medium text-slate-900 line-clamp-1">{rel.title}</div>
                      <div className="text-xs font-bold text-primary mt-1">
                        {rel.rental ? `${formatPrice(rel.monthlyprice)}/mo` : formatPrice(rel.monthlyprice)}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        {rel.beds > 0 && <span>{rel.beds} bed</span>}
                        {rel.bathrooms > 0 && <span>{rel.bathrooms} bath</span>}
                        <span>{rel.area.toLocaleString()} sqft</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

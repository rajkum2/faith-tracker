'use client';

import React from 'react';
import { Bed, Bath, Maximize, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { PropertyListing } from '@/lib/data/types/faith-tracker';

interface PropertyCardProps {
  listing: PropertyListing;
  isHovered?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function formatPrice(price: number): string {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lac`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(0)}K`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function PropertyCard({
  listing,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: PropertyCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-100 overflow-hidden cursor-pointer transition-all duration-200',
        isHovered ? 'shadow-md border-primary/20 ring-1 ring-primary/10' : 'hover:shadow-sm'
      )}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Image */}
      <div className="relative h-40 bg-slate-100 overflow-hidden">
        <img
          src={`/${listing.gridimg}`}
          alt={listing.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/blog/8.jpg'; }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {listing.sale && <Badge className="bg-green-500 text-white text-[10px] px-1.5 py-0.5">Sale</Badge>}
          {listing.rental && <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">Rent</Badge>}
          {listing.pending && <Badge className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5">Pending</Badge>}
        </div>
        {listing.star && (
          <div className="absolute top-2 right-2">
            <Star size={14} className="text-amber-400 fill-amber-400" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded">
          {listing.rental ? `${formatPrice(listing.monthlyprice)}/mo` : formatPrice(listing.monthlyprice)}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-slate-900 line-clamp-1">{listing.title}</h3>
        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{listing.text}</p>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
          {listing.beds > 0 && (
            <span className="flex items-center gap-1">
              <Bed size={12} /> {listing.beds} Beds
            </span>
          )}
          {listing.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath size={12} /> {listing.bathrooms} Bath
            </span>
          )}
          <span className="flex items-center gap-1">
            <Maximize size={12} /> {listing.area.toLocaleString()} sqft
          </span>
        </div>

        {/* Author */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100">
          <img
            src={`/${listing.authorimg}`}
            alt={listing.authorname}
            className="w-5 h-5 rounded-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/people/2.jpg'; }}
          />
          <span className="text-[11px] text-slate-500">{listing.authorname}</span>
          <span className="ml-auto text-[10px] text-slate-400">{listing.postdate}</span>
        </div>
      </div>
    </div>
  );
}

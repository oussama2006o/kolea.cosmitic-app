import React from 'react';
import { STORE_INFO } from '../data/mockData';
import { MapPin, Navigation, ExternalLink, Phone } from 'lucide-react';

export function GoogleMapEmbed() {
  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl overflow-hidden shadow-xs">
      {/* Map Header with clear Address & Link display */}
      <div className="p-5 sm:p-6 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-stone-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 uppercase tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-stone-900" />
            Boutique & Atelier Location
          </div>
          <h3 className="font-editorial text-xl sm:text-2xl font-semibold text-stone-900">
            Koléa Atelier & Cosmetic Showroom
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 font-light flex items-center gap-2">
            <span>{STORE_INFO.addressText}</span>
          </p>
        </div>

        {/* Clear link to address URL as specified in prompt */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={STORE_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors shadow-xs"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </a>

          <a
            href={`tel:${STORE_INFO.phone}`}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-medium rounded-lg transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-stone-600" />
            <span className="font-mono tabular-nums">{STORE_INFO.phoneFormatted}</span>
          </a>
        </div>
      </div>

      {/* Address URL callout banner */}
      <div className="px-5 py-2.5 bg-stone-100/70 border-b border-stone-200 text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span className="text-stone-500">Official Maps URL:</span>
        <a
          href={STORE_INFO.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-stone-800 hover:underline hover:text-stone-950 truncate max-w-md"
        >
          {STORE_INFO.googleMapsUrl}
        </a>
      </div>

      {/* Responsive Interactive Embedded Map */}
      <div className="relative w-full h-80 sm:h-96 md:h-[420px] bg-stone-100">
        <iframe
          title="Koléa Cosmetic Location Google Map"
          src="https://maps.google.com/maps?q=Kol%C3%A9a%2C+Tipaza%2C+Algeria&t=&z=15&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full grayscale-[15%] contrast-[105%]"
        />
      </div>

      {/* Footer hint */}
      <div className="p-4 bg-stone-50/70 border-t border-stone-100 text-xs text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <span>Public Transit: Accessible via Koléa Centre-ville bus station and taxi stands.</span>
        <span>Free visitor parking available on Rue de la République.</span>
      </div>
    </div>
  );
}

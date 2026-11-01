import React from 'react';
import { STORE_INFO } from '../data/mockData';
import { ContactForm } from '../components/ContactForm';
import { GoogleMapEmbed } from '../components/GoogleMapEmbed';
import { Phone, Instagram, MapPin, Clock, MessageSquare, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* Page Header */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 font-mono">
          Get in Touch
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 tracking-tight">
          Contact & Koléa Boutique
        </h1>
        <p className="text-sm sm:text-base text-stone-600 font-light leading-relaxed">
          Whether you seek tailored skincare recommendations, wholesale information, or directions to our Koléa boutique, we are delighted to assist.
        </p>
      </div>

      {/* Main Two-Column Block: Contact Info on Left, Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Direct channels (strictly single phone & single social media) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
            <h3 className="font-editorial text-2xl font-semibold text-stone-900">
              Direct Contact
            </h3>

            <div className="space-y-5">
              {/* Phone Channel */}
              <div className="flex items-start gap-4 pb-5 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-medium block">
                    Phone Consultation & Orders
                  </span>
                  <a
                    href={`tel:${STORE_INFO.phone}`}
                    className="font-mono text-lg font-bold text-stone-900 hover:text-stone-700 transition-colors block tabular-nums"
                  >
                    {STORE_INFO.phoneFormatted}
                  </a>
                  <p className="text-xs text-stone-500">
                    Direct line for orders, client care, and courier follow-up.
                  </p>
                </div>
              </div>

              {/* Instagram Channel */}
              <div className="flex items-start gap-4 pb-5 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                  <Instagram className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-medium block">
                    Official Instagram
                  </span>
                  <a
                    href={STORE_INFO.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-sans text-base font-semibold text-stone-900 hover:text-stone-700 transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{STORE_INFO.instagramHandle}</span>
                    <ArrowUpRight className="w-4 h-4 text-stone-400" />
                  </a>
                  <p className="text-xs text-stone-500">
                    Follow daily formulation stories, customer reviews, and announcements.
                  </p>
                </div>
              </div>

              {/* Physical Location */}
              <div className="flex items-start gap-4 pb-5 border-b border-stone-100">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-medium block">
                    Boutique & Atelier Address
                  </span>
                  <p className="text-sm font-medium text-stone-900">
                    {STORE_INFO.addressText}
                  </p>
                  <a
                    href={STORE_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-stone-700 font-medium underline hover:text-stone-950 inline-flex items-center gap-1 pt-1"
                  >
                    <span>View on Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-800 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="text-xs uppercase tracking-wider text-stone-400 font-medium block">
                    Opening Hours
                  </span>
                  <p className="text-stone-800 font-medium text-sm">
                    Saturday – Thursday: <span className="font-mono tabular-nums">09:30 – 19:30</span>
                  </p>
                  <p className="text-stone-800 font-medium text-sm">
                    Friday: <span className="font-mono tabular-nums">14:30 – 19:00</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Assurance Box */}
          <div className="p-5 bg-stone-100/80 rounded-2xl border border-stone-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-stone-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Complimentary Atelier Consultations</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Visit our Koléa showroom for personalized skin diagnostics and patch tests before selecting your active botanical routine.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>

      {/* Embedded Responsive Google Map Component */}
      <section className="space-y-4 pt-4">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500 font-mono">
            Location & Directions
          </span>
          <h2 className="font-editorial text-2xl sm:text-3xl font-semibold text-stone-900">
            Find Koléa Cosmetic on Google Maps
          </h2>
        </div>

        <GoogleMapEmbed />
      </section>
    </div>
  );
}

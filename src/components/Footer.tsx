import React from 'react';
import { useRouter } from '../router/Router';
import { STORE_INFO } from '../data/mockData';
import { Phone, Instagram, MapPin, Clock, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-12 border-b border-stone-800">
          {/* Brand Philosophy */}
          <div className="space-y-4">
            <h3 className="font-editorial text-2xl text-stone-100 tracking-wider uppercase">
              Koléa Cosmetic
            </h3>
            <p className="text-sm text-stone-400 leading-relaxed font-light">
              Crafted in Koléa with pure Mediterranean botanical essences, bioactive peptides, and uncompromising clean chemistry for timeless skin vitality.
            </p>
            <div className="pt-2">
              <span className="text-xs text-stone-500 uppercase tracking-widest font-mono">
                Artisanal Skincare Atelier · Est. Koléa
              </span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-200">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => navigate('/home')}
                  className="hover:text-white transition-colors cursor-pointer text-stone-400"
                >
                  Home & Atelier
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/products')}
                  className="hover:text-white transition-colors cursor-pointer text-stone-400"
                >
                  All Formulations & Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="hover:text-white transition-colors cursor-pointer text-stone-400"
                >
                  Contact & Consultation
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Contact & Social (Strictly complying with single phone & single social media) */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-200">
              Contact & Social
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`tel:${STORE_INFO.phone}`}
                  className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors group"
                >
                  <Phone className="w-4 h-4 text-stone-400 group-hover:text-stone-200 shrink-0" />
                  <span className="font-mono tabular-nums">{STORE_INFO.phoneFormatted}</span>
                </a>
              </li>
              <li>
                <a
                  href={STORE_INFO.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-stone-300 hover:text-white transition-colors group"
                >
                  <Instagram className="w-4 h-4 text-stone-400 group-hover:text-stone-200 shrink-0" />
                  <span>{STORE_INFO.instagramHandle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-stone-500 group-hover:text-white transition-colors" />
                </a>
              </li>
              <li>
                <a
                  href={STORE_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-stone-300 hover:text-white transition-colors group"
                >
                  <MapPin className="w-4 h-4 text-stone-400 group-hover:text-stone-200 shrink-0 mt-0.5" />
                  <span className="leading-snug">{STORE_INFO.addressText}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Atelier Hours */}
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-200">
              Boutique Hours
            </h4>
            <div className="flex items-start gap-3 text-sm text-stone-400">
              <Clock className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-stone-300">Saturday – Thursday</p>
                <p className="font-mono text-xs tabular-nums text-stone-400">09:30 – 19:30</p>
                <p className="text-stone-300 pt-1">Friday</p>
                <p className="font-mono text-xs tabular-nums text-stone-400">14:30 – 19:00</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Koléa Cosmetic. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Dermatologically Certified</span>
            <span>·</span>
            <span>Zero Harsh Parabens</span>
            <span>·</span>
            <button
              onClick={() => navigate('/admin')}
              className="text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              Atelier Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

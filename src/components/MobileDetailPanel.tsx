"use client";

import { X, Volume2 } from "lucide-react";
import Image from "next/image";
import { countries } from "../data/countries";
import { useMapStore } from "../store/useMapStore";
import { useAnimalMedia } from "../hooks/useAnimalMedia";
import { audioService } from "./AudioService";
import { t } from "../lib/i18n";
import { IUCN_CONFIG } from "../lib/iucn";
import { useState } from "react";

const STATUS_CODE: Record<string, string> = { 'Critically Endangered': 'CR', 'Endangered': 'EN', 'Vulnerable': 'VU', 'Near Threatened': 'NT', 'Least Concern': 'LC', 'Data Deficient': 'DD' };

const CONTINENT_COLORS: Record<string, string> = {
  "North America": "#f87171",
  "South America": "#fb923c",
  Europe: "#60a5fa",
  Africa: "#fbbf24",
  Asia: "#f472b6",
  Oceania: "#34d399",
  "Middle East": "#c084fc",
  Arctic: "#93c5fd",
  Antarctic: "#e0f2fe",
};

export default function MobileDetailPanel() {
  const { selectedId, setSelectedId, locale } = useMapStore();
  const tr = t(locale);
  const selected = selectedId ? countries.find((c) => c.id === selectedId) ?? null : null;
  const { imageUrl, imageLoading } = useAnimalMedia(selected?.animal ?? null);
  const [playing, setPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!selected) return null;

  const color = CONTINENT_COLORS[selected.region] || "#6366f1";

  const playSound = () => {
    if (!selected) return;
    setPlaying(true);
    audioService.playAnimalRepresentativeSound(selected.animal, selected.classification);
    setTimeout(() => setPlaying(false), 2000);
  };

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 top-14 z-30">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={() => setSelectedId(null)}
      />
      <div className="mobile-sidebar-animate absolute inset-x-0 bottom-0 max-h-[80vh] flex flex-col bg-white rounded-t-2xl overflow-hidden border-t border-zinc-200">
        {/* Close button - larger, higher position */}
        <button
          onClick={() => setSelectedId(null)}
          className="absolute -top-3 right-2 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-white shadow-lg border-2 border-zinc-300 hover:bg-red-50 hover:border-red-200 active:bg-red-100 active:scale-95 transition-all"
          aria-label={tr.close}
        >
          <X size={28} className="text-zinc-700 hover:text-red-600 transition-colors" />
        </button>

        <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto mt-3 mb-1" />

        <div className="overflow-y-auto p-4 pb-8">
          {/* Image */}
          <div className="w-full rounded-xl overflow-hidden bg-zinc-100 mb-3" style={{ maxHeight: 200 }}>
            {imageLoading || (!imageUrl || imgError) ? (
              <div className="flex items-center justify-center h-40 bg-zinc-50">
                <span className="text-6xl">{selected.emoji}</span>
              </div>
            ) : (
              <Image
                src={imageUrl}
                alt={selected.animal}
                className="w-full object-cover"
                width={400}
                height={200}
                style={{ maxHeight: 200 }}
                onError={() => setImgError(true)}
                unoptimized
              />
            )}
          </div>

          {/* Header */}
          <div className="flex items-center gap-2 text-zinc-800">
            <span className="text-lg">{selected.flag}</span>
            <span className="font-semibold">{selected.country}</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-2xl">{selected.emoji}</span>
            <div className="flex-1">
              <div className="font-medium text-zinc-700">{selected.animal}</div>
              <div className="text-xs text-zinc-400 italic">{selected.scientificName}</div>
            </div>
            {/* Sound button */}
            <button
              onClick={playSound}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 active:bg-zinc-300 transition-colors"
            >
              {playing ? (
                <Volume2 size={20} className="text-blue-500 animate-pulse" />
              ) : (
                <Volume2 size={20} className="text-zinc-500" />
              )}
            </button>
          </div>

          {/* Badges */}
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            <div className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
              {tr.classification[selected.classification as keyof typeof tr.classification] ?? selected.classification}
            </div>
            <div
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: `${IUCN_CONFIG[STATUS_CODE[selected.conservationStatus] || 'LC']?.bg ?? '#888'}20`,
                color: IUCN_CONFIG[STATUS_CODE[selected.conservationStatus] || 'LC']?.bg ?? '#888',
              }}
            >
              {tr.conservation[selected.conservationStatus as keyof typeof tr.conservation] ?? selected.conservationStatus}
            </div>
            <div className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
              Pop: {selected.population}
            </div>
          </div>

          {/* Habitat */}
          <div className="mt-2 text-xs text-zinc-500 italic">{selected.habitat}</div>

          {/* Fun facts */}
          <ul className="mt-3 space-y-1.5 text-xs text-zinc-500 leading-relaxed">
            {selected.funFacts.map((f, i) => (
              <li key={i} className="flex gap-1.5">
                <span className="shrink-0" style={{ color }}>
                  •
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

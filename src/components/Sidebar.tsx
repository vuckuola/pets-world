"use client"
import React from 'react';

import { useRef, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { countries, type AnimalEntry, continents } from "../data/countries";
import { useMapStore } from "../store/useMapStore";
import { useFilteredAnimals } from "../hooks/useAnimals";
import { audioService } from "./AudioService";
import { t } from "../lib/i18n";
import { IUCN_CONFIG } from "../lib/iucn";
import AnimalListSkeleton from "./AnimalListSkeleton";

const STATUS_CODE: Record<string, string> = {
  'Critically Endangered': 'CR', 'Endangered': 'EN', 'Vulnerable': 'VU',
  'Near Threatened': 'NT', 'Least Concern': 'LC', 'Data Deficient': 'DD',
};

const CONTINENT_COLORS: Record<string, string> = {
  "North America": "#f87171", "South America": "#fb923c", Europe: "#60a5fa",
  Africa: "#fbbf24", Asia: "#f472b6", Oceania: "#34d399",
  "Middle East": "#c084fc", Arctic: "#93c5fd", Antarctic: "#e0f2fe",
};

/** Desktop sidebar with virtualized animal list grouped by classification */
export default function Sidebar(): React.JSX.Element {
  const { searchQuery, setSearchQuery, activeRegion, setActiveRegion, selectedId, sidebarHoveredId, setSidebarHoveredId, locale } = useMapStore();
  const tr = t(locale);
  const filtered = useFilteredAnimals();
  const parentRef = useRef<HTMLDivElement>(null);

  // Group by classification for sticky headers
  const groupedItems = useMemo(() => {
    const groups: ({ type: 'header'; classification: string; id: string } | { type: 'animal'; animal: AnimalEntry; id: string })[] = [];
    let lastClass = '';
    for (const c of filtered) {
      if (c.classification !== lastClass) {
        lastClass = c.classification;
        groups.push({ type: 'header', classification: c.classification, id: `h-${c.classification}` });
      }
      groups.push({ type: 'animal', animal: c, id: c.id });
    }
    return groups;
  }, [filtered]);

  const virtualizer = useVirtualizer({
    count: groupedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => groupedItems[i].type === 'header' ? 32 : 64,
    overscan: 10,
  });

  // Scroll to selected animal when selectedId changes
  useEffect(() => {
    if (!selectedId) return;
    const idx = groupedItems.findIndex((item) => item.type === 'animal' && item.animal.id === selectedId);
    if (idx >= 0) {
      virtualizer.scrollToIndex(idx, { behavior: 'smooth', align: 'center' });
    }
  }, [selectedId]);

  const flyTo = (c: AnimalEntry) => {
    useMapStore.getState().setSelectedId(c.id);
    useMapStore.getState().setMobileOpen(false);
  };

  return (
    <aside className="hidden md:flex w-80 shrink-0 flex-col gap-4 p-4 bg-white border-r border-zinc-200 z-10 overflow-hidden">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          placeholder={tr.search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white transition-colors duration-150"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {["All", ...continents].map((c) => (
          <button
            key={c}
            onClick={() => setActiveRegion(c)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
              activeRegion === c
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
            }`}
          >
            {tr.regions[c as keyof typeof tr.regions] ?? c}
          </button>
        ))}
      </div>

      <div ref={parentRef} className="flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1 scrollbar-thin">
        {virtualizer.getVirtualItems().length === 0 && <AnimalListSkeleton />}
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = groupedItems[virtualItem.index];
            if (item.type === 'header') {
              return (
                <div
                  key={item.id}
                  className="absolute left-0 right-0 flex items-center px-3 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider bg-white z-10"
                  style={{
                    height: `${virtualItem.size}px`,
                    top: `${virtualItem.start}px`,
                  }}
                >
                  {item.classification}
                </div>
              );
            }

            const c = item.animal;
            const isSelected = selectedId === c.id;
            const isHovered = sidebarHoveredId === c.id;
            const color = CONTINENT_COLORS[c.region] || "#6366f1";
            const code = STATUS_CODE[c.conservationStatus] || 'LC';
            const iucnBg = IUCN_CONFIG[code]?.bg ?? '#888';

            return (
              <button
                key={item.id}
                onClick={() => flyTo(c)}
                onMouseEnter={() => {
                  setSidebarHoveredId(c.id);
                  audioService.playHoverSound();
                }}
                onMouseLeave={() => setSidebarHoveredId(null)}
                className={`sidebar-item absolute left-0 right-0 flex items-center gap-2 rounded-lg px-3 text-left text-sm ${
                  isSelected
                    ? "bg-blue-50 border-l-2 border-l-blue-500"
                    : isHovered
                    ? "bg-zinc-50"
                    : ""
                }`}
                style={{
                  height: `${virtualItem.size}px`,
                  top: `${virtualItem.start}px`,
                  ...(isSelected ? {} : { borderLeft: `2px solid ${color}40` }),
                }}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: iucnBg }} />
                <span className="sr-only">{c.conservationStatus}</span>
                <span className="text-base">{c.emoji}</span>
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-zinc-800">{c.country}</span>
                  <span className="block text-xs text-zinc-400 truncate">{c.animal}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500">{c.region}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

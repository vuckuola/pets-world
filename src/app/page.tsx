"use client"
import React from 'react';

import { useState, useCallback } from "react";
import { MapPin, Shuffle, Globe, Search } from "lucide-react";
import { t } from "../lib/i18n";
import { countries, type AnimalEntry } from "../data/countries";
import { useMapStore } from "../store/useMapStore";
import { useFilteredAnimals } from "../hooks/useAnimals";
import { audioService } from "../components/AudioService";
import Sidebar from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";
import MapView from "../components/MapView";
import AnimalSearch from "../components/AnimalSearch";

const DEFAULT_VIEW = { longitude: 20, latitude: 20, zoom: 2 };

/** Home page with map, sidebar, and controls */
export default function Home(): React.JSX.Element {
  const [viewState, setViewState] = useState(DEFAULT_VIEW);
  const filtered = useFilteredAnimals();
  const { selectedId, setSelectedId, setMobileOpen, locale, setLocale } = useMapStore();

  const flyTo = useCallback((c: AnimalEntry) => {
    setSelectedId(c.id);
    setViewState((v) => ({
      ...v,
      longitude: c.lng,
      latitude: c.lat,
      zoom: Math.max(v.zoom, 4),
    }));
    audioService.playDingSound();
    setMobileOpen(false);
  }, [setSelectedId, setMobileOpen]);

  const randomAnimal = useCallback(() => {
    const c = countries[Math.floor(Math.random() * countries.length)];
    flyTo(c);
  }, [flyTo]);

  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-50 text-zinc-900 overflow-hidden">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 z-20">
        <MobileSidebar />
        <MapPin size={18} className="text-zinc-400" />
        <span className="text-sm font-semibold text-zinc-800">
          {t(locale).title}
        </span>
        <span className="text-xs text-zinc-400 hidden sm:inline">
          {filtered.length} {t(locale).countries}
        </span>
        <div className="flex-1" />
        <button onClick={() => useMapStore.getState().setSearchOpen(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
          <Search size={16} />
          <span className="hidden sm:inline text-xs text-zinc-400">⌘K</span>
        </button>
        <button onClick={() => setLocale(locale === 'id' ? 'en' : 'id')} className="flex items-center gap-1 px-3 py-1.5 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors">
          <Globe size={16} />
          {locale === 'id' ? 'EN' : 'ID'}
        </button>
        <button
          onClick={randomAnimal}
          className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors duration-150 shadow-sm"
        >
          <Shuffle size={14} />
          {t(locale).random}
        </button>
      </header>

      <AnimalSearch />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <MapView viewState={viewState} setViewState={setViewState} />
      </div>
    </div>
  );
}

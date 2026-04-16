"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Search, X } from "lucide-react";
import { countries } from "../data/countries";
import { useMapStore } from "../store/useMapStore";
import { IUCN_CONFIG } from "../lib/iucn";
import { t } from "../lib/i18n";

const IUCN_FILTERS = ["LC", "NT", "VU", "EN", "CR"];
const ALL_CLASSES = Array.from(new Set(countries.map((c) => c.classification))).sort();

export default function AnimalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [iucnFilters, setIucnFilters] = useState<string[]>([]);
  const [classFilters, setClassFilters] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectedId, setSelectedId, locale, searchQuery, setSearchQuery, activeRegion, setActiveRegion } = useMapStore();
  const tr = t(locale);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return countries.filter((c) => {
      const matchSearch = !q || c.animal.toLowerCase().includes(q) || c.scientificName.toLowerCase().includes(q) || c.country.toLowerCase().includes(q);
      const matchIucn = iucnFilters.length === 0 || iucnFilters.some((f) => {
        const statusCode = conservationToCode(c.conservationStatus);
        return statusCode === f;
      });
      const matchClass = classFilters.length === 0 || classFilters.includes(c.classification);
      return matchSearch && matchIucn && matchClass;
    });
  }, [query, iucnFilters, classFilters]);

  const selectAnimal = useCallback((id: string) => {
    const c = countries.find((x) => x.id === id);
    if (!c) return;
    setSelectedId(id);
    setSearchQuery("");
    setActiveRegion("All");
    setOpen(false);
  }, [setSelectedId, setSearchQuery, setActiveRegion]);

  const toggleFilter = (arr: string[], set: (v: string[]) => void, val: string) => {
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100">
          <Search size={18} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr.search}
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-zinc-400"
          />
          {(query || iucnFilters.length || classFilters.length) && (
            <button onClick={() => { setQuery(""); setIucnFilters([]); setClassFilters([]); }} className="text-zinc-400 hover:text-zinc-600">
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline text-[10px] text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">ESC</kbd>
        </div>

        {/* Active filters */}
        {(iucnFilters.length || classFilters.length) && (
          <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-zinc-100">
            {iucnFilters.map((f) => (
              <button key={f} onClick={() => toggleFilter(iucnFilters, setIucnFilters, f)}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                <span className="w-2 h-2 rounded-full" style={{ background: IUCN_CONFIG[f]?.bg ?? "#888" }} />
                {f} <X size={10} />
              </button>
            ))}
            {classFilters.map((f) => (
              <button key={f} onClick={() => toggleFilter(classFilters, setClassFilters, f)}
                className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border border-zinc-200 text-zinc-600 hover:bg-zinc-50">
                {f} <X size={10} />
              </button>
            ))}
          </div>
        )}

        {/* IUCN filter chips */}
        <div className="flex gap-1 px-4 py-2 border-b border-zinc-100">
          {IUCN_FILTERS.map((f) => (
            <button key={f} onClick={() => toggleFilter(iucnFilters, setIucnFilters, f)}
              className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                iucnFilters.includes(f) ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}>
              <span className="w-2 h-2 rounded-full" style={{ background: iucnFilters.includes(f) ? "#fff" : IUCN_CONFIG[f]?.bg ?? "#888" }} />
              {f}
            </button>
          ))}
        </div>

        {/* Class filter chips */}
        <div className="flex flex-wrap gap-1 px-4 py-2 border-b border-zinc-100">
          {ALL_CLASSES.map((c) => (
            <button key={c} onClick={() => toggleFilter(classFilters, setClassFilters, c)}
              className={`text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                classFilters.includes(c) ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
              }`}>
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        <div className="max-h-[40vh] overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-400">No results found</div>
          ) : (
            results.map((c) => {
              const code = conservationToCode(c.conservationStatus);
              const iucn = IUCN_CONFIG[code];
              return (
                <button
                  key={c.id}
                  onClick={() => selectAnimal(c.id)}
                  className={`w-full flex items-center gap-2 px-4 py-2 text-left text-sm hover:bg-zinc-50 transition-colors ${
                    selectedId === c.id ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: iucn?.bg ?? "#888" }} />
                  <span className="text-lg">{c.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-zinc-800">{c.animal}</div>
                    <div className="text-[11px] text-zinc-400 italic truncate">{c.scientificName}</div>
                  </div>
                  <span className="text-[10px] text-zinc-400">{c.country}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function conservationToCode(status: string): string {
  const map: Record<string, string> = {
    "Least Concern": "LC",
    "Near Threatened": "NT",
    "Vulnerable": "VU",
    "Endangered": "EN",
    "Critically Endangered": "CR",
    "Data Deficient": "DD",
  };
  return map[status] ?? "LC";
}

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Map, { Marker, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { countries, type AnimalEntry, continents } from "./data/countries";
import {
  Search,
  Plus,
  Minus,
  RotateCcw,
  Layers,
  Shuffle,
  Menu,
  X,
  MapPin,
} from "lucide-react";

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

const MAP_STYLES = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
};

type MapStyleName = keyof typeof MAP_STYLES;

let audioCtx: AudioContext | null = null;
const getAudioCtx = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

const playClickSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
  } catch {}
};

const playHoverSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 600;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch {}
};

const playDingSound = () => {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(523, ctx.currentTime);
    osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
    osc.type = "triangle";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {}
};

const DEFAULT_VIEW = { longitude: 20, latitude: 20, zoom: 2 };

export default function Home() {
  const [search, setSearch] = useState("");
  const [continent, setContinent] = useState("All");
  const [selected, setSelected] = useState<AnimalEntry | null>(null);
  const [hovered, setHovered] = useState<AnimalEntry | null>(null);
  const [sidebarHovered, setSidebarHovered] = useState<string | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyleName>("voyager");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mapRef = useRef<any>(null);

  const [viewState, setViewState] = useState(DEFAULT_VIEW);

  const filtered = countries.filter((c) => {
    const matchContinent = continent === "All" || c.region === continent;
    const matchSearch =
      !search ||
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.animal.toLowerCase().includes(search.toLowerCase());
    return matchContinent && matchSearch;
  });

  const flyTo = useCallback((c: AnimalEntry) => {
    setSelected(c);
    setViewState((v) => ({
      ...v,
      longitude: c.lng,
      latitude: c.lat,
      zoom: Math.max(v.zoom, 4),
    }));
    playDingSound();
    setMobileOpen(false);
  }, []);

  const onMarkerClick = useCallback((c: AnimalEntry) => {
    playClickSound();
    setSelected((prev) => (prev?.id === c.id ? null : c));
    setViewState((v) => ({
      ...v,
      longitude: c.lng,
      latitude: c.lat,
      zoom: Math.max(v.zoom, 4),
    }));
  }, []);

  const onMarkerHover = useCallback((c: AnimalEntry) => {
    if (hovered?.id !== c.id) {
      setHovered(c);
    }
  }, [hovered]);

  const resetView = useCallback(() => {
    setViewState(DEFAULT_VIEW);
    setSelected(null);
    setHovered(null);
    playClickSound();
  }, []);

  const zoomIn = useCallback(() => {
    setViewState((v) => ({ ...v, zoom: Math.min(v.zoom + 1, 18) }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewState((v) => ({ ...v, zoom: Math.max(v.zoom - 1, 1) }));
  }, []);

  const randomAnimal = useCallback(() => {
    const c = countries[Math.floor(Math.random() * countries.length)];
    flyTo(c);
  }, [flyTo]);

  const cycleMapStyle = useCallback(() => {
    const styles: MapStyleName[] = ["voyager", "dark", "satellite"];
    const idx = (styles.indexOf(mapStyle) + 1) % styles.length;
    setMapStyle(styles[idx]);
  }, [mapStyle]);

  const mapStyleLabels: Record<MapStyleName, string> = {
    dark: "Dark",
    voyager: "Colorful",
    satellite: "Minimal",
  };

  const renderCountryList = (items: typeof filtered) =>
    items.map((c, i) => {
      const isSelected = selected?.id === c.id;
      const isHovered = sidebarHovered === c.id;
      const color = CONTINENT_COLORS[c.region] || "#6366f1";
      return (
        <button
          key={c.id}
          onClick={() => flyTo(c)}
          onMouseEnter={() => {
            setSidebarHovered(c.id);
            playHoverSound();
          }}
          onMouseLeave={() => setSidebarHovered(null)}
          className={`sidebar-item country-item-animate flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm ${
            isSelected
              ? "bg-blue-50 border-l-2 border-l-blue-500"
              : isHovered
              ? "bg-zinc-50"
              : ""
          }`}
          style={{
            animationDelay: `${i * 30}ms`,
            ...(isSelected ? {} : { borderLeft: `2px solid ${color}40` }),
          }}
        >
          <span className="text-base">{c.flag}</span>
          <div className="flex-1 min-w-0">
            <span className="block truncate text-zinc-800">{c.country}</span>
            <span className="block text-xs text-zinc-400 truncate">{c.animal}</span>
          </div>
          <span className="text-base">{c.emoji}</span>
        </button>
      );
    });

  const renderFilters = () => (
    <div className="flex flex-wrap gap-1.5">
      {["All", ...continents].map((c) => (
        <button
          key={c}
          onClick={() => setContinent(c)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
            continent === c
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen w-screen flex-col bg-zinc-50 text-zinc-900 overflow-hidden">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-zinc-200 bg-white px-4 z-20">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 rounded-lg hover:bg-zinc-100 transition-colors duration-150"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <MapPin size={18} className="text-zinc-400" />
        <span className="text-sm font-semibold text-zinc-800">
          World Wildlife Atlas
        </span>
        <span className="text-xs text-zinc-400 hidden sm:inline">
          {filtered.length} countries
        </span>
        <div className="flex-1" />
        <button
          onClick={randomAnimal}
          className="flex items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 transition-colors duration-150 shadow-sm"
        >
          <Shuffle size={14} />
          Random
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-80 shrink-0 flex-col gap-4 p-4 bg-white border-r border-zinc-200 z-10 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search country or animal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white transition-colors duration-150"
            />
          </div>

          {renderFilters()}

          <div className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1 scrollbar-thin">
            {renderCountryList(filtered)}
          </div>
        </aside>

        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-x-0 bottom-0 top-14 z-30">
            <div
              className="absolute inset-0 bg-black/30"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="mobile-sidebar-animate absolute inset-x-0 bottom-0 max-h-[60vh] flex flex-col gap-3 p-4 bg-white rounded-t-2xl overflow-hidden border-t border-zinc-200">
              <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto mb-1" />
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-zinc-400 focus:border-zinc-300 focus:bg-white transition-colors duration-150"
                />
              </div>
              {renderFilters()}
              <div className="flex flex-col gap-1 overflow-y-auto">
                {renderCountryList(filtered)}
              </div>
            </aside>
          </div>
        )}

        {/* Map */}
        <main className="relative flex-1">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt) => setViewState(evt.viewState)}
            style={{ width: "100%", height: "100%" }}
            mapStyle={MAP_STYLES[mapStyle]}
          >
            {filtered.map((c) => (
              <Marker key={c.id} longitude={c.lng} latitude={c.lat} anchor="center">
                <button
                  onClick={() => onMarkerClick(c)}
                  onMouseEnter={() => onMarkerHover(c)}
                  onMouseLeave={() => setHovered(null)}
                  className={`pet-marker text-2xl md:text-3xl ${
                    sidebarHovered === c.id ? "pet-marker-highlighted" : ""
                  } ${selected?.id === c.id ? "!scale-150" : ""}`}
                  data-continent={c.region}
                >
                  {c.emoji}
                </button>
              </Marker>
            ))}

            {/* Hover tooltip */}
            {hovered && !selected && (
              <Popup
                longitude={hovered.lng}
                latitude={hovered.lat}
                anchor="bottom"
                closeOnClick={false}
                onClose={() => setHovered(null)}
              >
                <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-3 text-sm min-w-[160px]">
                  <div className="font-semibold flex items-center gap-2 text-zinc-800">
                    <span>{hovered.flag}</span>
                    <span>{hovered.country}</span>
                  </div>
                  <div className="text-zinc-500 mt-1">
                    {hovered.emoji} {hovered.animal}
                  </div>
                  <div className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                    {hovered.funFacts[0]}
                  </div>
                  <div
                    className="mt-2 text-[10px] px-2 py-0.5 rounded-full inline-block"
                    style={{
                      background: `${CONTINENT_COLORS[hovered.region]}15`,
                      color: CONTINENT_COLORS[hovered.region],
                    }}
                  >
                    {hovered.region}
                  </div>
                </div>
              </Popup>
            )}

            {/* Click popup */}
            {selected && (
              <Popup
                longitude={selected.lng}
                latitude={selected.lat}
                anchor="bottom"
                closeOnClick={false}
                onClose={() => setSelected(null)}
                maxWidth="320px"
              >
                <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-4 text-sm min-w-[240px]">
                  <div className="text-base font-semibold flex items-center gap-2 text-zinc-800">
                    <span>{selected.flag}</span>
                    <span>{selected.country}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-zinc-600">
                    <span className="text-2xl">{selected.emoji}</span>
                    <div>
                      <div className="font-medium text-zinc-700">{selected.animal}</div>
                      <div className="text-xs text-zinc-400 italic">{selected.scientificName}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <div className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
                      {selected.classification}
                    </div>
                    <div className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      selected.conservationStatus === 'Critically Endangered' ? 'bg-red-50 text-red-700' :
                      selected.conservationStatus === 'Endangered' ? 'bg-orange-50 text-orange-700' :
                      selected.conservationStatus === 'Vulnerable' ? 'bg-yellow-50 text-yellow-700' :
                      selected.conservationStatus === 'Near Threatened' ? 'bg-blue-50 text-blue-700' :
                      'bg-green-50 text-green-700'
                    }`}
                    >
                      {selected.conservationStatus}
                    </div>
                    <div className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 font-medium">
                      Pop: {selected.population}
                    </div>
                  </div>
                  <div className="mt-1.5 text-xs text-zinc-500 italic">
                    {selected.habitat}
                  </div>
                  <ul className="mt-3 space-y-1.5 text-xs text-zinc-500 leading-relaxed">
                    {selected.funFacts.map((f, i) => (
                      <li key={i} className="flex gap-1.5">
                        <span
                          className="shrink-0"
                          style={{ color: CONTINENT_COLORS[selected.region] }}
                        >
                          •
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Popup>
            )}
          </Map>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            <button onClick={zoomIn} className="map-control-btn bg-white rounded-lg w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm" title="Zoom in">
              <Plus size={16} />
            </button>
            <button onClick={zoomOut} className="map-control-btn bg-white rounded-lg w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm" title="Zoom out">
              <Minus size={16} />
            </button>
            <button onClick={resetView} className="map-control-btn bg-white rounded-lg w-10 h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm" title="Reset view">
              <RotateCcw size={16} />
            </button>
            <button onClick={cycleMapStyle} className="map-control-btn bg-white rounded-lg px-3 h-10 flex items-center justify-center text-xs font-medium text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm gap-1.5" title="Switch map style">
              <Layers size={14} />
              {mapStyleLabels[mapStyle]}
            </button>
          </div>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 left-4 z-10">
            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm px-3 py-1.5 text-[10px] text-zinc-400 font-medium">
              {viewState.zoom.toFixed(1)}x
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

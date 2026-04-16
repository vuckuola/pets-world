"use client";

import { useCallback, useRef } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapRef } from "react-map-gl/maplibre";
import { countries, type AnimalEntry } from "../data/countries";
import { useMapStore, type MapStyleName } from "../store/useMapStore";
import { useFilteredAnimals } from "../hooks/useAnimals";
import { audioService } from "./AudioService";
import MapControls from "./MapControls";

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

const MAP_STYLES: Record<MapStyleName, string> = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json",
};

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
}

interface MapViewProps {
  viewState: ViewState;
  setViewState: React.Dispatch<React.SetStateAction<ViewState>>;
}

export default function MapView({ viewState, setViewState }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const {
    selectedId, hoveredId, sidebarHoveredId, mapStyle,
    setSelectedId, setHoveredId, setMobileOpen,
  } = useMapStore();
  const filtered = useFilteredAnimals();

  const selected = selectedId ? countries.find((c) => c.id === selectedId) ?? null : null;
  const hovered = hoveredId ? countries.find((c) => c.id === hoveredId) ?? null : null;

  const onMarkerClick = useCallback((c: AnimalEntry) => {
    audioService.playClickSound();
    setSelectedId(selectedId === c.id ? null : c.id);
    setViewState((v) => ({
      ...v,
      longitude: c.lng,
      latitude: c.lat,
      zoom: Math.max(v.zoom, 4),
    }));
  }, [setSelectedId, selectedId, setViewState]);

  const onMarkerHover = useCallback((c: AnimalEntry) => {
    if (hoveredId !== c.id) {
      setHoveredId(c.id);
    }
  }, [hoveredId, setHoveredId]);

  const resetView = useCallback(() => {
    setViewState({ longitude: 20, latitude: 20, zoom: 2 });
    setSelectedId(null);
    setHoveredId(null);
    audioService.playClickSound();
  }, [setSelectedId, setHoveredId, setViewState]);

  return (
    <main className="relative flex-1">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLES[mapStyle]}
      >
        <NavigationControl position="bottom-right" />

        {filtered.map((c) => (
          <Marker key={c.id} longitude={c.lng} latitude={c.lat} anchor="center">
            <button
              onClick={() => onMarkerClick(c)}
              onMouseEnter={() => onMarkerHover(c)}
              onMouseLeave={() => setHoveredId(null)}
              className={`pet-marker text-2xl md:text-3xl ${
                sidebarHoveredId === c.id ? "pet-marker-highlighted" : ""
              } ${selectedId === c.id ? "!scale-150" : ""}`}
              data-continent={c.region}
            >
              {c.emoji}
            </button>
          </Marker>
        ))}

        {hovered && !selected && (
          <Popup
            longitude={hovered.lng}
            latitude={hovered.lat}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setHoveredId(null)}
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

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="bottom"
            closeOnClick={false}
            onClose={() => setSelectedId(null)}
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

      <MapControls viewState={viewState} setViewState={setViewState} onResetView={resetView} />

      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm px-3 py-1.5 text-[10px] text-zinc-400 font-medium">
          {viewState.zoom.toFixed(1)}x
        </div>
      </div>
    </main>
  );
}

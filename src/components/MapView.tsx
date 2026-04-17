"use client";

import { useCallback, useRef, useState, useEffect } from "react";
import Map, { NavigationControl, Source, Layer, Marker } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapRef } from "react-map-gl/maplibre";
import { countries, type AnimalEntry } from "../data/countries";
import { useMapStore, type MapStyleName } from "../store/useMapStore";
import { useFilteredAnimals } from "../hooks/useAnimals";
import { audioService } from "./AudioService";
import { t } from "../lib/i18n";
import { IUCN_CONFIG } from "../lib/iucn";
import MapControls from "./MapControls";
import { useAnimalMedia } from "../hooks/useAnimalMedia";
import MobileDetailPanel from "./MobileDetailPanel";
import MapSkeleton from "./MapSkeleton";
import Image from "next/image";
const STATUS_CODE: Record<string, string> = {
  'Critically Endangered': 'CR', 'Endangered': 'EN', 'Vulnerable': 'VU',
  'Near Threatened': 'NT', 'Least Concern': 'LC', 'Data Deficient': 'DD',
};

const CONTINENT_COLORS: Record<string, string> = {
  "North America": "#f87171", "South America": "#fb923c", Europe: "#60a5fa",
  Africa: "#fbbf24", Asia: "#f472b6", Oceania: "#34d399",
  "Middle East": "#c084fc", Arctic: "#93c5fd", Antarctic: "#e0f2fe",
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

function getIucnCode(conservationStatus: string): string {
  return STATUS_CODE[conservationStatus] || 'LC';
}

function iucnColor(status: string): string {
  return IUCN_CONFIG[getIucnCode(status)]?.bg ?? '#888';
}

export default function MapView({ viewState, setViewState }: MapViewProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const {
    selectedId, hoveredId, sidebarHoveredId, mapStyle, locale,
    setSelectedId, setHoveredId, setMobileOpen,
  } = useMapStore();
  const tr = t(locale);
  const filtered = useFilteredAnimals();
  const selected = selectedId ? countries.find((c) => c.id === selectedId) ?? null : null;
  const hovered = hoveredId ? countries.find((c) => c.id === hoveredId) ?? null : null;
  const { imageUrl, imageLoading } = useAnimalMedia(selected?.animal ?? null);
  const [playing, setPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [, forceUpdate] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);

  function projectToScreen(lng: number, lat: number): { x: number; y: number } | null {
    const map = mapRef.current?.getMap();
    if (!map) return null;
    const point = map.project([lng, lat]);
    return { x: point.x, y: point.y };
  }

  function getPopupPosition(
    screenPos: { x: number; y: number },
    pw: number, ph: number,
    cw: number, ch: number,
    offset = 16
  ) {
    let left = screenPos.x - pw / 2;
    let top = screenPos.y - ph - offset;
    if (top < 8) top = screenPos.y + offset;
    if (top + ph > ch - 8) top = ch - ph - 8;
    if (left < 8) left = 8;
    if (left + pw > cw - 8) left = cw - pw - 8;
    return { left, top };
  }

  const playSound = useCallback(() => {
    if (!selected) return;
    setPlaying(true);
    audioService.playAnimalRepresentativeSound(selected.animal, selected.classification);
    setTimeout(() => setPlaying(false), 2000);
  }, [selected]);

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
    if (hoveredId !== c.id) setHoveredId(c.id);
  }, [hoveredId, setHoveredId]);

  const resetView = useCallback(() => {
    setViewState({ longitude: 20, latitude: 20, zoom: 2 });
    setSelectedId(null);
    setHoveredId(null);
    audioService.playClickSound();
  }, [setSelectedId, setHoveredId, setViewState]);

  // Build GeoJSON for clustering
  const geojson = {
    type: "FeatureCollection" as const,
    features: filtered.map((c) => ({
      type: "Feature" as const,
      properties: {
        id: c.id,
        iucnCode: getIucnCode(c.conservationStatus),
        iucnColor: iucnColor(c.conservationStatus),
      },
      geometry: { type: "Point" as const, coordinates: [c.lng, c.lat] },
    })),
  };

  // Cluster layer styles
  const clusterLayer: maplibregl.LayerSpecification = {
    id: "clusters",
    type: "circle",
    source: "animals",
    filter: ["has", "point_count"],
    paint: {
      "circle-radius": ["step", ["get", "point_count"], 14, 100, 20, 750, 28],
      "circle-color": "#6366f1",
      "circle-opacity": 0.85,
      "circle-stroke-width": 3,
      "circle-stroke-color": "rgba(255,255,255,0.8)",
    },
  };

  const clusterCountLayer: maplibregl.LayerSpecification = {
    id: "cluster-count",
    type: "symbol",
    source: "animals",
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-size": 12,
      "text-font": ["Open Sans Regular"],
    },
    paint: {
      "text-color": "#fff",
    },
  };

  const unclusteredPointLayer: maplibregl.LayerSpecification = {
    id: "unclustered-point",
    type: "circle",
    source: "animals",
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-radius": [
        "case",
        ["boolean", ["feature-state", "selected"], false], 10,
        ["boolean", ["feature-state", "hover"], false], 8,
        6
      ],
      "circle-color": ["get", "iucnColor"],
      "circle-stroke-width": 2,
      "circle-stroke-color": "rgba(255,255,255,0.9)",
      "circle-opacity": 0.9,
    },
  };

  const onMapClick = useCallback((evt: any) => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const features = map.queryRenderedFeatures(evt.point, {
      layers: ["unclustered-point"],
    });
    if (features.length > 0) {
      const id = features[0].properties?.id;
      if (id) {
        audioService.playClickSound();
        setSelectedId(id);
        const c = countries.find((x) => x.id === id);
        if (c) {
          setViewState((v) => ({
            ...v,
            longitude: c.lng,
            latitude: c.lat,
            zoom: Math.max(v.zoom, 4),
          }));
        }
      }
      return;
    }

    const clusterFeatures = map.queryRenderedFeatures(evt.point, {
      layers: ["clusters"],
    });
    if (clusterFeatures.length > 0) {
      const clusterId = clusterFeatures[0].properties?.cluster_id;
      const source = map.getSource("animals") as any;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        if (prefersReducedMotion) {
          map.jumpTo({ center: (clusterFeatures[0].geometry as any).coordinates, zoom });
        } else {
          map.flyTo({ center: (clusterFeatures[0].geometry as any).coordinates, zoom });
        }
      });
    }
  }, [setSelectedId, setViewState]);

  // Cursor on hover
  const onMapMouseMove = useCallback((evt: any) => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const features = map.queryRenderedFeatures(evt.point, {
      layers: ["unclustered-point", "clusters"],
    });
    map.getCanvas().style.cursor = features.length ? "pointer" : "";
  }, []);

  return (
    <main className="relative flex-1">
      {!mapLoaded && <MapSkeleton />}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(evt) => { setViewState(evt.viewState); forceUpdate(n => n + 1); }}
        onLoad={() => setMapLoaded(true)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={MAP_STYLES[mapStyle]}
        onClick={onMapClick}
        onMouseMove={onMapMouseMove}
      >
        <NavigationControl position="bottom-right" />

        <Source
          id="animals"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={8}
          clusterRadius={50}
        >
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...unclusteredPointLayer} />
        </Source>

        {/* Emoji markers for individual animals (on top of clusters) */}
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
              aria-label={`View ${c.animal}, ${c.conservationStatus}`}
            >
              {c.emoji}
            </button>
          </Marker>
        ))}

        {hovered && !selected && (() => {
          const pos = projectToScreen(hovered.lng, hovered.lat);
          if (!pos) return null;
          return (
            <div
              className="hidden md:block"
              style={{
                position: 'absolute',
                left: pos.x,
                top: pos.y - 12,
                transform: 'translate(-50%, -100%)',
                zIndex: 20,
                pointerEvents: 'auto',
              }}
            >
              <div className="w-3 h-3 bg-white border-b border-r border-zinc-200 rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2" />
              <div className="bg-white rounded-lg border border-zinc-200 shadow-md p-3 min-w-[160px]">
                <div className="font-semibold text-base flex items-center gap-2 text-zinc-800">
                  <span>{hovered.flag}</span>
                  <span>{hovered.country}</span>
                </div>
                <div className="text-sm text-zinc-500 mt-1">
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
                  {tr.regions[hovered.region as keyof typeof tr.regions] ?? hovered.region}
                </div>
              </div>
            </div>
          );
        })()}

        <MobileDetailPanel />

        {/* Desktop popup */}
        {selected && (() => {
          const pos = projectToScreen(selected.lng, selected.lat);
          if (!pos) return null;
          if (window.innerWidth < 768) return null;
          const pw = popupRef.current?.offsetWidth ?? 320;
          const ph = popupRef.current?.offsetHeight ?? 400;
          const { left, top } = getPopupPosition(pos, pw, ph, window.innerWidth, window.innerHeight);
          return (
            <div
              ref={popupRef}
              className="hidden md:block fixed z-20"
              style={{ left, top, maxHeight: 'calc(100vh - 32px)', overflow: 'auto' }}
            >
              <div className="bg-white rounded-lg border border-zinc-200 shadow-sm p-4 text-sm min-w-[240px]">
              <div className="w-full rounded-lg overflow-hidden bg-zinc-100 mb-2" style={{ maxHeight: 200 }}>
                {imageLoading || (!imageUrl || imgError) ? (
                  <div className="flex items-center justify-center h-32 bg-zinc-50">
                    <span className="text-5xl">{selected.emoji}</span>
                  </div>
                ) : (
                  <Image
                    src={imageUrl}
                    alt={selected.animal}
                    className="w-full object-cover"
                    width={320}
                    height={200}
                    style={{ maxHeight: 200 }}
                    onError={() => setImgError(true)}
                    unoptimized
                  />
                )}
              </div>
              <div className="text-base font-semibold flex items-center gap-2 text-zinc-800">
                <span>{selected.flag}</span>
                <span>{selected.country}</span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-zinc-600">
                <span className="text-2xl">{selected.emoji}</span>
                <div className="flex-1">
                  <div className="font-medium text-zinc-700">{selected.animal}</div>
                  <div className="text-xs text-zinc-400 italic">{selected.scientificName}</div>
                </div>
                <button onClick={playSound} className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 transition-colors">
                  {playing ? "🔊" : "🔈"}
                </button>
              </div>
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
              <div className="mt-1.5 text-xs text-zinc-500 italic">
                {selected.habitat}
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-zinc-500 leading-relaxed">
                {selected.funFacts.map((f, i) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="shrink-0" style={{ color: CONTINENT_COLORS[selected.region] }}>•</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              </div>
            </div>
          );
        })()}
      </Map>

      <MapControls viewState={viewState} setViewState={setViewState} onResetView={resetView} />

      {/* IUCN Legend */}
      <div className="hidden md:block absolute bottom-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-zinc-200 shadow-sm px-3 py-2">
          <div className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">IUCN Status</div>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1">
            {["LC", "NT", "VU", "EN", "CR", "EX"].map((code) => (
              <div key={code} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: IUCN_CONFIG[code]?.bg ?? "#888" }} />
                <span className="text-[10px] text-zinc-600 font-medium">{code}</span>
              </div>
            ))}
          </div>
          <div className="mt-1 text-[9px] text-zinc-400">{viewState.zoom.toFixed(1)}x</div>
        </div>
      </div>
    </main>
  );
}

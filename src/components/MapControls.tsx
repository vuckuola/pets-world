"use client"
import React from 'react';

import { useCallback } from "react";
import { Plus, Minus, RotateCcw, Layers } from "lucide-react";
import { useMapStore, type MapStyleName } from "../store/useMapStore";

const mapStyleLabels: Record<MapStyleName, string> = {
  dark: "Dark",
  voyager: "Colorful",
  satellite: "Minimal",
};

interface MapControlsProps {
  viewState: { longitude: number; latitude: number; zoom: number };
  setViewState: React.Dispatch<React.SetStateAction<{ longitude: number; latitude: number; zoom: number }>>;
  onResetView: () => void;
}

/** Map zoom, reset, and style controls */
export default function MapControls({ viewState, setViewState, onResetView }: MapControlsProps): React.JSX.Element {
  const { mapStyle, setMapStyle } = useMapStore();

  const zoomIn = useCallback(() => {
    setViewState((v) => ({ ...v, zoom: Math.min(v.zoom + 1, 18) }));
  }, [setViewState]);

  const zoomOut = useCallback(() => {
    setViewState((v) => ({ ...v, zoom: Math.max(v.zoom - 1, 1) }));
  }, [setViewState]);

  const cycleMapStyle = useCallback(() => {
    const styles: MapStyleName[] = ["voyager", "dark", "satellite"];
    const idx = (styles.indexOf(mapStyle) + 1) % styles.length;
    setMapStyle(styles[idx]);
  }, [mapStyle, setMapStyle]);

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <button onClick={zoomIn} className="map-control-btn bg-white rounded-lg w-12 h-12 md:w-10 md:h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm" title="Zoom in">
        <Plus size={16} />
      </button>
      <button onClick={zoomOut} className="map-control-btn bg-white rounded-lg w-12 h-12 md:w-10 md:h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm" title="Zoom out">
        <Minus size={16} />
      </button>
      <button onClick={onResetView} className="map-control-btn bg-white rounded-lg w-12 h-12 md:w-10 md:h-10 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm" title="Reset view">
        <RotateCcw size={16} />
      </button>
      <button onClick={cycleMapStyle} className="map-control-btn bg-white rounded-lg px-3 h-12 md:h-10 flex items-center justify-center text-xs font-medium text-zinc-600 hover:bg-zinc-50 border border-zinc-200 shadow-sm gap-1.5" title="Switch map style">
        <Layers size={14} />
        {mapStyleLabels[mapStyle]}
      </button>
    </div>
  );
}

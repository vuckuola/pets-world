"use client";

import { useState, useEffect } from "react";

/** Fetches Wikipedia thumbnail image for an animal name */
export function useAnimalMedia(animalName: string | null): { imageUrl: string | null; imageLoading: boolean } {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (!animalName) {
      setImageUrl(null);
      return;
    }

    setImageLoading(true);

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(animalName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.thumbnail?.source) setImageUrl(data.thumbnail.source);
      })
      .catch(() => {})
      .finally(() => setImageLoading(false));
  }, [animalName]);

  return { imageUrl, imageLoading };
}

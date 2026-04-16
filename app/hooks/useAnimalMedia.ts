"use client";

import { useState, useEffect } from "react";

export function useAnimalMedia(animalName: string | null) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  useEffect(() => {
    if (!animalName) {
      setImageUrl(null);
      setAudioUrl(null);
      return;
    }

    setImageLoading(true);
    setAudioLoading(true);

    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(animalName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.thumbnail?.source) setImageUrl(data.thumbnail.source);
      })
      .catch(() => {})
      .finally(() => setImageLoading(false));

    fetch(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(animalName)}&prop=images&format=json&imlimit=50&origin=*`
    )
      .then((res) => res.json())
      .then((data) => {
        const pages = data.query?.pages;
        if (!pages) return;
        const pageId = Object.keys(pages)[0];
        const images = pages[pageId]?.images || [];
        const audioFile = images.find((img: any) =>
          /\.(ogg|mp3|wav)$/i.test(img.title)
        );
        if (audioFile) {
          const filename = audioFile.title.replace("File:", "");
          setAudioUrl(
            `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}`
          );
        }
      })
      .catch(() => {})
      .finally(() => setAudioLoading(false));
  }, [animalName]);

  return { imageUrl, audioUrl, imageLoading, audioLoading };
}

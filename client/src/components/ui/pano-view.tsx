import React, { useEffect, useRef } from "react";
import { Viewer } from "photo-sphere-viewer";
import type { ViewerOptions } from "photo-sphere-viewer";
import "photo-sphere-viewer/dist/photo-sphere-viewer.css";
import { MarkersPlugin } from "photo-sphere-viewer/dist/plugins/markers";
import type {
  Marker,
  MarkersPluginOptions,
} from "photo-sphere-viewer/dist/plugins/markers";
import "photo-sphere-viewer/dist/plugins/markers.css";

interface PanoViewerProps {
  src: string;
  width?: string | number;
  height?: string | number;
  markers?: Array<{
    id: string;
    longitude: number;
    latitude: number;
    image?: string;
    html?: string;
    size?: { width: number; height: number };
    tooltip?: string;
  }>;
}

export function PanoViewer({
  src,
  width = "100%",
  height = "400px",
  markers,
}: PanoViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const markersPluginRef = useRef<MarkersPlugin | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
        if (!containerRef.current) return;

    // Clean up previous instances
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
      markersPluginRef.current = null;
    }

    const options: ViewerOptions = {
      container: containerRef.current,
      panorama: src,
      loadingImg: "https://photo-sphere-viewer.js.org/assets/photosphere-logo.gif",
      loadingTxt: "Loading...",
      navbar: ["zoom", "move", "download", "fullscreen"],
      defaultZoomLvl: 50,
      defaultLong: 0,
      defaultLat: 0,
      plugins: [
        [
          MarkersPlugin,
          {
            markers: markers?.map((m) => ({
              id: m.id,
              longitude: m.longitude,
              latitude: m.latitude,
              ...(m.image
                ? { type: "image", image: m.image }
                : { type: "html", html: m.html || "", className: "", style: {} }),
              width: m.size?.width,
              height: m.size?.height,
              anchor: "bottom center",
              visible: true,
              data: {},
              ...(m.tooltip
                ? { tooltip: { content: m.tooltip, position: "right center" } }
                : {}),
            })),
          } as MarkersPluginOptions,
        ],
      ],
    };

    viewerRef.current = new Viewer(options);
    markersPluginRef.current = viewerRef.current.getPlugin(
      MarkersPlugin
    ) as MarkersPlugin;

    }, 0);

    return () => {
        clearTimeout(timer);
      viewerRef.current?.destroy();
      viewerRef.current = null;
      markersPluginRef.current = null;
    };
  }, [src, markers]);

  // live update markers if props change
  useEffect(() => {
    if (!markersPluginRef.current || !markers) return;
    markersPluginRef.current.clearMarkers();
    markers.forEach((m) => {
      const cfg: Marker = {
        id: m.id,
        longitude: m.longitude,
        latitude: m.latitude,
        width: m.size?.width,
        height: m.size?.height,
        anchor: "bottom center",
        visible: true,
        data: {},
        ...(m.image
          ? { type: "image", image: m.image }
          : { type: "html", html: m.html || "", className: "", style: {} }),
        ...(m.tooltip
          ? { tooltip: { content: m.tooltip, position: "right center" } }
          : {}),
      };
      markersPluginRef.current!.addMarker(cfg);
    });
  }, [markers]);

  return <div ref={containerRef} style={{ width, height }} />;
}

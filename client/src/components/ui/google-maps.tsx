import React from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 25.276987, // Dubai
  lng: 55.296249,
};

type GoogleMapProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: { lat: number; lng: number }[];
};

export default function GoogleMaps({
  center = defaultCenter,
  zoom = 12,
  markers = [],
}: GoogleMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // add this in your .env
  });

  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={zoom}>
      {markers.map((pos, i) => (
        <Marker key={i} position={pos} />
      ))}
    </GoogleMap>
  );
}

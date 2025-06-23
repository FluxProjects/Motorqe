import React from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

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
  onMapClick?: ({ lat, lng }: { lat: number; lng: number }) => void;
};

const GoogleMaps: React.FC<GoogleMapProps> = ({
  center = defaultCenter,
  zoom = 12,
  markers = [],
  onMapClick,
}) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  const handleClick = (event: google.maps.MapMouseEvent) => {
    const latLng = event.latLng;
    if (latLng && onMapClick) {
      const lat = latLng.lat();
      const lng = latLng.lng();
      onMapClick({ lat, lng });
    }
  };

  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      onClick={handleClick}
    >
      {markers.map((pos, i) => (
        <Marker key={i} position={pos} />
      ))}
    </GoogleMap>
  );
};

export default GoogleMaps;

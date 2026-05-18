import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";
import { toast } from "sonner";

const LocationMarker = ({ onLocationSelect, mapRef }) => {
  const [position, setPosition] = useState(null);
  const map = useMap();

  const updateLocation = (lat, lng) => {
    setPosition([lat, lng]);
    map.flyTo([lat, lng], 15, { animate: true, duration: 1 });

    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      {
        headers: {
          "User-Agent": "zeroly-app/1.0 (contact@example.com)",
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        const address = data?.display_name || `Lat: ${lat}, Lng: ${lng}`;
        onLocationSelect({ address, lat, lng });
      })
      .catch((err) => {
        console.error("Reverse geocoding error:", err);
        onLocationSelect({ address: `Lat: ${lat}, Lng: ${lng}`, lat, lng });
      });
  };

  useEffect(() => {
    if (mapRef) {
      mapRef.current = { updateLocation };
    }
  }, [mapRef]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      updateLocation(lat, lng);
    },
  });

  return position ? <Marker position={position}></Marker> : null;
};

const MapPicker = ({ onLocationSelect }) => {
  const mapRef = React.useRef();

  const handleFetchLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    toast.info("Fetching your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (mapRef.current) {
          mapRef.current.updateLocation(
            position.coords.latitude,
            position.coords.longitude
          );
        }
      },
      (error) => {
        toast.error("Unable to retrieve your location. Please click on the map manually.");
        console.error("Error getting location:", error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 right-4 z-[400]">
        <Button 
          type="button" 
          onClick={handleFetchLocation}
          className="shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold flex items-center gap-2"
        >
          <Navigation className="w-4 h-4" />
          Fetch My Location
        </Button>
      </div>
      <MapContainer
        center={[23.1815, 79.9864]}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 10 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onLocationSelect={onLocationSelect} mapRef={mapRef} />
      </MapContainer>
    </div>
  );
};

export default MapPicker;

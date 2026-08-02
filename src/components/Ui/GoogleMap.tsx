import React from "react";
import { MapPin } from "lucide-react";

interface GoogleMapProps {
  coordinates?: {
    lat: number;
    lng: number;
  };
  googleMapsUrl?: string;
  title: string;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  coordinates,
  googleMapsUrl,
  title,
  className,
}) => {
  if (!coordinates) return null;

  const embedUrl = `https://maps.google.com/maps?q=${coordinates.lat},${coordinates.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      className={
        className ||
        "relative w-full h-[320px] sm:h-[380px] lg:h-[400px] rounded-[28px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#E8EFF1] group"
      }
    >
      {/* Google Maps Iframe */}
      <iframe
        title={`${title} Location Map`}
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-[1.01]"
      />

      {/* Custom View on Google Maps Link Button */}
      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-5 right-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/90 backdrop-blur-md border border-[#D9E1E4] text-xs font-semibold text-text-secondary shadow-md hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 z-10 cursor-pointer"
        >
          <MapPin className="w-3.5 h-3.5 text-primary" />
          <span>View on Google Maps</span>
        </a>
      )}
    </div>
  );
};

export default GoogleMap;

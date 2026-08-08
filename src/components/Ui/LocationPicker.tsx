import { useState, useRef, useEffect } from "react";
import { FiSearch } from "react-icons/fi";
import Input from "./Input";
import Spinner from "./LoadingSpinner";
import GoogleMap from "./GoogleMap";

export interface LocationValue {
  locationText: {
    en: string;
    ar: string;
  };
  googleMapsUrl: string;
  latitude: number;
  longitude: number;
}

const parseLocationName = (suggestion: any) => {
  const displayName = suggestion.display_name || "";
  const parts = displayName.split(",");
  const title = parts[0]?.trim() || "";
  const subtitle = parts.slice(1).map((p: string) => p.trim()).join(", ") || "";
  return { title, subtitle };
};

const getRelevanceScore = (suggestion: any, query: string): number => {
  let score = 0;
  const displayName = (suggestion.display_name || "").toLowerCase();
  const queryLower = query.toLowerCase().trim();

  // 1. Textual match boosts (coastal real-estate terms)
  const highPriority = [
    "north coast", "sahel", "الساحل الشمالي", "الساحل",
    "alamein", "العلمين",
    "sidi abdel rahman", "sidi abd el-rahman", "سيدي عبد الرحمن", "سيدي عبدالرحمن",
    "ras el hekma", "ras el-hekma", "راس الحكمة", "رأس الحكمة",
    "sokhna", "السخنة",
    "marina", "مارينا",
    "hurghada", "ghardaqah", "الغردقة",
    "gouna", "الجونة",
    "soma bay", "somabay", "سوما باي",
    "makadi", "مكادي",
    "sahl hasheesh", "سهل حشيش"
  ];

  const mediumPriority = [
    "matruh", "مطروح",
    "red sea", "البحر الاحمر", "البحر الأحمر",
    "alexandria", "الاسكندرية", "الإسكندرية",
    "coast", "coastal", "beach", "resort", "village", "قرية", "شاطئ", "ساحل", "شاليه", "chalet", "bay"
  ];

  highPriority.forEach((word) => {
    if (displayName.includes(word)) {
      score += 150;
    }
  });

  mediumPriority.forEach((word) => {
    if (displayName.includes(word)) {
      score += 60;
    }
  });

  // 2. Coordinate-based coastal region boosts
  const lat = parseFloat(suggestion.lat);
  const lon = parseFloat(suggestion.lon);

  if (!isNaN(lat) && !isNaN(lon)) {
    // North Coast / Mediterranean Coast (Alexandria to Matrouh)
    const isNorthCoast = (lat >= 30.5 && lat <= 31.6) && (lon >= 25.0 && lon <= 32.5);
    // Ain Sokhna / Gulf of Suez
    const isSokhna = (lat >= 29.0 && lat <= 30.2) && (lon >= 32.2 && lon <= 32.7);
    // Red Sea Coast (Hurghada, El Gouna, etc.)
    const isRedSea = (lat >= 26.0 && lat <= 28.5) && (lon >= 33.4 && lon <= 34.5);

    if (isNorthCoast || isSokhna || isRedSea) {
      score += 100;
    }
  }

  // 3. Lexical query match boost
  if (displayName.includes(queryLower)) {
    score += 50;
    if (displayName.startsWith(queryLower)) {
      score += 30;
    }
  }

  return score;
};


interface LocationPickerProps {
  label?: string;
  required?: boolean;
  value: string | LocationValue | { en?: string; ar?: string } | null | undefined;
  onChange: (value: LocationValue | string) => void;
  options?: any[]; // Kept for interface compatibility
  error?: string;
  isArabic?: boolean;
}

export default function LocationPicker({
  label = "Location",
  required = false,
  value,
  onChange,
  error,
  isArabic = false,
}: LocationPickerProps) {
  const [localQuery, setLocalQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract location fields from whatever structure was passed as value
  let displayAddressEn = "";
  let displayAddressAr = "";
  let lat: number | null = null;
  let lng: number | null = null;

  if (typeof value === "string") {
    displayAddressEn = value;
    displayAddressAr = value;
  } else if (value && typeof value === "object") {
    if ("locationText" in value && value.locationText) {
      const locVal = value as LocationValue;
      displayAddressEn = locVal.locationText.en || "";
      displayAddressAr = locVal.locationText.ar || "";
      lat = typeof locVal.latitude === "number" ? locVal.latitude : null;
      lng = typeof locVal.longitude === "number" ? locVal.longitude : null;
    } else {
      const bilingual = value as { en?: string; ar?: string };
      displayAddressEn = bilingual.en || "";
      displayAddressAr = bilingual.ar || "";
    }
  }

  // 1. Sync input search query when value or language switches
  useEffect(() => {
    setLocalQuery(isArabic ? displayAddressAr : displayAddressEn);
  }, [value, isArabic, displayAddressEn, displayAddressAr]);

  // 2. Close dropdown on click outside and reset query to selected value
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setLocalQuery(isArabic ? displayAddressAr : displayAddressEn);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isArabic, displayAddressEn, displayAddressAr]);



  const fetchGeocode = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Geocoding failed: status ${res.status}`);
    }
    return await res.json();
  };

  // 5. Geocode search query suggestions (with 400ms debounce)
  useEffect(() => {
    if (!localQuery || localQuery.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    // Skip geocoding if the localQuery matches the current display address (means it was loaded/synced from selected state)
    if (localQuery === (isArabic ? displayAddressAr : displayAddressEn)) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true);
      try {
        const langParam = isArabic ? "ar" : "en";
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          localQuery
        )}&format=json&addressdetails=1&limit=10&accept-language=${langParam}&countrycodes=eg&viewbox=25.0,32.0,35.0,26.0&email=porto_dashboard_dev@gmail.com`;

        const data = await fetchGeocode(url);
        if (data && Array.isArray(data)) {
          // Sort results based on coastal/real-estate relevance
          const rankedData = [...data].sort((a, b) => {
            const scoreA = getRelevanceScore(a, localQuery);
            const scoreB = getRelevanceScore(b, localQuery);
            return scoreB - scoreA;
          });
          setSuggestions(rankedData);
        }
      } catch (err) {
        console.error("Geocoding search failed:", err);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [localQuery, isArabic, displayAddressEn, displayAddressAr]);

  // 6. Handle suggestion selection
  const handleSelectSuggestion = async (suggestion: any) => {
    const selectedLat = parseFloat(suggestion.lat);
    const selectedLng = parseFloat(suggestion.lon);

    setIsLoadingSuggestions(true);
    setIsOpen(false);

    const urlEn = `https://nominatim.openstreetmap.org/reverse?lat=${selectedLat}&lon=${selectedLng}&format=json&accept-language=en&email=porto_dashboard_dev@gmail.com`;
    const urlAr = `https://nominatim.openstreetmap.org/reverse?lat=${selectedLat}&lon=${selectedLng}&format=json&accept-language=ar&email=porto_dashboard_dev@gmail.com`;

    let textEn = "";
    let textAr = "";

    try {
      const [resEn, resAr] = await Promise.all([
        fetchGeocode(urlEn).catch(() => null),
        fetchGeocode(urlAr).catch(() => null),
      ]);

      textEn = resEn?.display_name || "";
      textAr = resAr?.display_name || "";
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }

    // Sensible fallbacks to preserve bilingual data structures
    if (!textEn) {
      textEn = isArabic ? (displayAddressEn || suggestion.display_name) : suggestion.display_name;
    }
    if (!textAr) {
      textAr = isArabic ? suggestion.display_name : (displayAddressAr || suggestion.display_name);
    }

    const computedGmapsUrl = `https://www.google.com/maps?q=${selectedLat},${selectedLng}`;

    onChange({
      locationText: {
        en: textEn,
        ar: textAr,
      },
      googleMapsUrl: computedGmapsUrl,
      latitude: selectedLat,
      longitude: selectedLng,
    });

    setLocalQuery(isArabic ? textAr : textEn);
    setIsLoadingSuggestions(false);
  };

  // 7. Handle manual typing commit on blur (e.g. Tab key)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.relatedTarget && !containerRef.current?.contains(e.relatedTarget as Node)) {
      setIsOpen(false);
      setLocalQuery(isArabic ? displayAddressAr : displayAddressEn);
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col w-full gap-2 relative">
      <div className="relative">
        <Input
          label={label}
          required={required}
          value={localQuery}
          onChange={(e) => {
            const val = e.target.value;
            setLocalQuery(val);
            setIsOpen(true);
          }}
          onBlur={handleBlur}
          onFocus={() => setIsOpen(true)}
          placeholder={isArabic ? "ابحث عن الموقع..." : "Search location..."}
          leftIcon={<FiSearch className="w-5 h-5 text-text-secondary" />}
          error={error}
          variant="modal"
          size="md"
          dir={isArabic ? "rtl" : "ltr"}
        />

        {/* Dropdown Suggestions List */}
        {isOpen && (suggestions.length > 0 || isLoadingSuggestions || (localQuery.trim().length >= 3 && suggestions.length === 0)) && (
          <div className="absolute top-full left-0 z-50 w-full mt-1 max-h-60 overflow-y-auto bg-white border border-[#D4D5D8] rounded-xl shadow-lg">
            {isLoadingSuggestions ? (
              <div className="flex items-center justify-center p-4">
                <Spinner />
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, idx) => {
                const { title, subtitle } = parseLocationName(suggestion);
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectSuggestion(suggestion)}
                    className="px-4 py-3 cursor-pointer hover:bg-[#F5F9FA] hover:text-[#1E8CAB] text-text-secondary border-b border-[#F0F2F5] last:border-b-0 flex gap-3 items-start transition-colors"
                  >
                    <svg
                      className="w-4 h-4 text-[#1E8CAB] mt-0.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <div className="flex flex-col min-w-0 flex-1 ltr:text-left rtl:text-right">
                      <span className="font-semibold text-sm text-[#1F2937] leading-tight truncate">
                        {title}
                      </span>
                      {subtitle && (
                        <span className="text-xs text-[#6B7280] mt-0.5 truncate block">
                          {subtitle}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-sm text-text-secondary text-center">
                {isArabic ? "لم يتم العثور على نتائج" : "No locations found"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Map View Container */}
      <GoogleMap
        coordinates={{ lat: lat ?? 30.0444, lng: lng ?? 31.2357 }}
        title="Location"
        className="relative h-[194px] w-full rounded-xl overflow-hidden border border-border z-0"
      />
    </div>
  );
}

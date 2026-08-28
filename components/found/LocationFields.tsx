import React, { useState, useEffect } from "react";
import { MapPin, Navigation, X, Check, Search } from "lucide-react";
import { CAMPUS_BUILDINGS } from "@/lib/constants/campusBuildings";
import { FoundLocation } from "@/lib/types/foundItem";
import { Input } from "@/components/ui/Input";

interface LocationFieldsProps {
  location: FoundLocation;
  onChange: (loc: FoundLocation) => void;
  buildingError?: string;
}

export const LocationFields: React.FC<LocationFieldsProps> = ({
  location,
  onChange,
  buildingError,
}) => {
  const [geoPromptDismissed, setGeoPromptDismissed] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedBuildingName, setDetectedBuildingName] = useState<string | null>(
    location.geoDetected && location.building ? location.building : null
  );

  const [buildingSearch, setBuildingSearch] = useState(location.building || "");
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  // Sync internal search query if external location changes
  useEffect(() => {
    if (location.building && location.building !== buildingSearch) {
      setBuildingSearch(location.building);
    }
  }, [location.building]);

  const filteredBuildings = CAMPUS_BUILDINGS.filter(
    (b) =>
      b.name.toLowerCase().includes(buildingSearch.toLowerCase()) ||
      b.code.toLowerCase().includes(buildingSearch.toLowerCase())
  );

  const handleSelectBuilding = (buildingName: string) => {
    setBuildingSearch(buildingName);
    setIsComboboxOpen(false);
    onChange({
      ...location,
      building: buildingName,
    });
  };

  const requestGeolocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoPromptDismissed(true);
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetecting(false);
        setGeoPromptDismissed(true);

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        // Find closest campus building by euclidean distance
        let closest = CAMPUS_BUILDINGS[0];
        let minDistance = Infinity;

        CAMPUS_BUILDINGS.forEach((b) => {
          if (b.lat && b.lng) {
            const d = Math.hypot(b.lat - lat, b.lng - lng);
            if (d < minDistance) {
              minDistance = d;
              closest = b;
            }
          }
        });

        if (closest) {
          setDetectedBuildingName(closest.name);
          setBuildingSearch(closest.name);
          onChange({
            ...location,
            building: closest.name,
            geoDetected: true,
          });
        }
      },
      (err) => {
        // Geolocation denied or unavailable - dismiss gracefully without error
        setIsDetecting(false);
        setGeoPromptDismissed(true);
      },
      { timeout: 8000, maximumAge: 60000 }
    );
  };

  return (
    <div className="w-full space-y-4" id="location-section">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-accent" />
          <span>Location Found</span>
          <span className="text-accent">*</span>
        </label>
        <span className="text-xs text-text-muted">Campus location</span>
      </div>

      {/* Geolocation Prompt Banner (Visible, dismissible, never silent or blocking) */}
      {!geoPromptDismissed && !location.building && (
        <div
          role="region"
          aria-label="Location auto-detect prompt"
          className="flex items-center justify-between gap-3 p-3 rounded-lg bg-surface-alt border border-border text-xs text-text-secondary transition-all"
        >
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-accent flex-shrink-0" />
            <span>Auto-detect nearest campus building using your current location?</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={requestGeolocation}
              disabled={isDetecting}
              className="px-2.5 py-1.5 font-semibold text-accent bg-accent-light rounded hover:bg-accent hover:text-white transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              {isDetecting ? "Detecting..." : "Detect"}
            </button>
            <button
              type="button"
              onClick={() => setGeoPromptDismissed(true)}
              className="p-1 text-text-muted hover:text-text-primary rounded"
              aria-label="Dismiss location auto-detect"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detected Location Status Badge */}
      {detectedBuildingName && location.building === detectedBuildingName && (
        <div className="flex items-center justify-between text-xs bg-accent-light/50 border border-accent/20 px-3 py-1.5 rounded-md text-text-primary">
          <span className="flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-accent" />
            <span>Detected: <strong>{detectedBuildingName}</strong></span>
          </span>
          <button
            type="button"
            onClick={() => {
              setDetectedBuildingName(null);
              setBuildingSearch("");
              onChange({ ...location, building: "", geoDetected: false });
            }}
            className="text-text-secondary hover:text-accent underline font-medium"
          >
            Not right? Change it
          </button>
        </div>
      )}

      {/* Responsive Row of Location Fields */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Building Combobox (Searchable Select) */}
        <div className="relative md:col-span-6">
          <label htmlFor="building-combobox" className="block text-xs font-semibold text-text-primary mb-1">
            Building <span className="text-accent">*</span>
          </label>
          <div className="relative">
            <input
              id="building-combobox"
              type="text"
              role="combobox"
              aria-expanded={isComboboxOpen}
              aria-autocomplete="list"
              aria-invalid={Boolean(buildingError)}
              aria-describedby={buildingError ? "building-error" : undefined}
              placeholder="Search campus building..."
              value={buildingSearch}
              onFocus={() => setIsComboboxOpen(true)}
              onChange={(e) => {
                setBuildingSearch(e.target.value);
                setIsComboboxOpen(true);
                onChange({ ...location, building: e.target.value });
              }}
              className={`w-full min-h-[44px] pl-9 pr-3.5 py-2.5 bg-surface text-sm text-text-primary placeholder:text-text-muted rounded-lg border transition-all duration-150 outline-none ${
                buildingError
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/15"
                  : "border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15"
              }`}
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5 pointer-events-none" />
          </div>

          {/* Combobox Dropdown */}
          {isComboboxOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsComboboxOpen(false)}
              />
              <ul
                role="listbox"
                className="absolute z-20 w-full mt-1 max-h-52 overflow-auto bg-surface border border-border-strong rounded-lg shadow-lg py-1 text-sm focus:outline-none"
              >
                {filteredBuildings.length > 0 ? (
                  filteredBuildings.map((b) => (
                    <li
                      key={b.id}
                      role="option"
                      aria-selected={location.building === b.name}
                      onClick={() => handleSelectBuilding(b.name)}
                      className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between hover:bg-surface-raised transition-colors ${
                        location.building === b.name
                          ? "bg-accent-light/50 font-semibold text-accent"
                          : "text-text-primary"
                      }`}
                    >
                      <span>{b.name}</span>
                      <span className="text-xs text-text-muted">{b.code}</span>
                    </li>
                  ))
                ) : (
                  <li className="px-3.5 py-2.5 text-xs text-text-muted">
                    No buildings found matching &quot;{buildingSearch}&quot;
                  </li>
                )}
              </ul>
            </>
          )}

          {buildingError && (
            <p id="building-error" className="mt-1.5 text-[13px] font-medium text-error flex items-center gap-1" role="alert">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{buildingError}</span>
            </p>
          )}
        </div>

        {/* Floor */}
        <div className="md:col-span-3">
          <label htmlFor="floor-select" className="block text-xs font-semibold text-text-primary mb-1">
            Floor <span className="text-xs font-normal text-text-muted">(Optional)</span>
          </label>
          <select
            id="floor-select"
            value={location.floor || ""}
            onChange={(e) => onChange({ ...location, floor: e.target.value })}
            className="w-full min-h-[44px] px-3 py-2.5 bg-surface text-sm text-text-primary rounded-lg border border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
          >
            <option value="">Select floor...</option>
            <option value="Ground">Ground</option>
            <option value="Floor 1">Floor 1</option>
            <option value="Floor 2">Floor 2</option>
            <option value="Floor 3">Floor 3</option>
            <option value="Floor 4">Floor 4</option>
            <option value="Basement">Basement</option>
            <option value="Outdoors">Outdoors</option>
          </select>
        </div>

        {/* Room / Landmark */}
        <div className="md:col-span-3">
          <label htmlFor="room-landmark-input" className="block text-xs font-semibold text-text-primary mb-1">
            Room / Landmark <span className="text-xs font-normal text-text-muted">(Optional)</span>
          </label>
          <input
            id="room-landmark-input"
            type="text"
            placeholder="e.g. Room 204"
            value={location.landmarkOrRoom || ""}
            onChange={(e) => onChange({ ...location, landmarkOrRoom: e.target.value })}
            className="w-full min-h-[44px] px-3 py-2.5 bg-surface text-sm text-text-primary placeholder:text-text-muted rounded-lg border border-border-strong focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none"
          />
        </div>
      </div>
    </div>
  );
};

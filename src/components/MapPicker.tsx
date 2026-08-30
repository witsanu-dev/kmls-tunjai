import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Share2, Compass, Layers, Crosshair, ExternalLink, CheckCircle, Maximize2, Minimize2, Target } from 'lucide-react';
import Swal from 'sweetalert2';

// Create prominent Emergency Pulse Red Pin Icon using Leaflet DivIcon
const emergencyPinIcon = new L.DivIcon({
  className: 'custom-emergency-pin',
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-10 h-10 bg-rose-500/40 rounded-full animate-ping"></div>
      <div class="relative w-9 h-9 bg-rose-600 border-2 border-white rounded-full shadow-lg flex items-center justify-center text-white">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-rose-600"></div>
    </div>
  `,
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -42],
});

interface MapPickerProps {
  locationText: string;
  setLocationText: (text: string) => void;
  lat: number | null;
  setLat: (lat: number | null) => void;
  lng: number | null;
  setLng: (lng: number | null) => void;
}

const DEFAULT_CENTER = { lat: 14.9723, lng: 102.0831 }; // Default Center

// Map Recenter Controller
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
    map.invalidateSize();
  }, [center, zoom, map]);
  return null;
}

// Map Click Handler Component
function MapEventsHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export const MapPicker: React.FC<MapPickerProps> = ({
  locationText,
  setLocationText,
  lat,
  setLat,
  lng,
  setLng,
}) => {
  const [locating, setLocating] = useState(false);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [tileLayerType, setTileLayerType] = useState<'street' | 'satellite'>('street');
  const [isExpanded, setIsExpanded] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const markerLat = lat || DEFAULT_CENTER.lat;
  const markerLng = lng || DEFAULT_CENTER.lng;

  // Reverse Geocoding helper using OpenStreetMap Nominatim
  const fetchAddressName = async (latitude: number, longitude: number) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'th,en' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.display_name) {
          const addr = data.address || {};
          const shortAddr = [
            addr.road || addr.suburb || addr.neighbourhood,
            addr.subdistrict || addr.village,
            addr.district || addr.city_district,
            addr.province || addr.state
          ].filter(Boolean).join(' ');

          const fullText = shortAddr
            ? `${shortAddr} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`
            : `${data.display_name.slice(0, 80)} (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;

          setLocationText(fullText);
        }
      }
    } catch (e) {
      setLocationText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  const handleSelectCoordinates = (selectedLat: number, selectedLng: number, acc: number | null = null) => {
    const fixedLat = Number(selectedLat.toFixed(6));
    const fixedLng = Number(selectedLng.toFixed(6));
    setLat(fixedLat);
    setLng(fixedLng);
    if (acc) setAccuracy(Math.round(acc));

    fetchAddressName(fixedLat, fixedLng);
  };

  // Multi-tier robust GPS position fetcher (High accuracy -> Fallback to Network/Cellular)
  const fetchLocationWithFallback = (
    onSuccess: (pos: GeolocationPosition) => void,
    onFail: () => void
  ) => {
    if (!navigator.geolocation) {
      onFail();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      onSuccess,
      () => {
        // Fallback to low-accuracy (Network/Cell Tower/WiFi) if high-accuracy times out or fails
        navigator.geolocation.getCurrentPosition(
          onSuccess,
          onFail,
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 10000 }
    );
  };

  // Single shot GPS retrieval
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'เบราว์เซอร์ไม่รองรับ GPS',
        showConfirmButton: false,
        timer: 3000,
      });
      return;
    }

    setLocating(true);
    fetchLocationWithFallback(
      (pos) => {
        handleSelectCoordinates(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        setLocating(false);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: `ปักพิกัด GPS สำเร็จ (ความแม่นยำ ±${Math.round(pos.coords.accuracy)} ม.)`,
          showConfirmButton: false,
          timer: 2500,
        });
      },
      () => {
        setLocating(false);
        // Toast fallback message instead of blocking modal window
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'info',
          title: 'ไม่พบสัญญาณ GPS มือถือ (สามารถคลิกปักหมุดบนแผนที่แทนได้)',
          showConfirmButton: false,
          timer: 4000,
        });
      }
    );
  };

  // Toggle Continuous Real-time GPS Tracking
  const toggleLiveTracking = () => {
    if (isLiveTracking) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsLiveTracking(false);
      return;
    }

    if (!navigator.geolocation) return;

    setIsLiveTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        handleSelectCoordinates(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      () => {
        // Fallback silently if watchPosition fails temporarily
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );
  };

  useEffect(() => {
    // Start Real-time tracking smoothly on mount
    if (navigator.geolocation) {
      setIsLiveTracking(true);
      setLocating(true);
      fetchLocationWithFallback(
        (pos) => {
          handleSelectCoordinates(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
          setLocating(false);
        },
        () => {
          setLocating(false);
        }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          handleSelectCoordinates(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        () => {
          // Keep active or retry silently
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 5000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const openGoogleMapsRoute = () => {
    if (!lat || !lng) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-md p-4 shadow-sm space-y-3">
      {/* Title Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-2 border-slate-100">
        <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
          <span>ตำแหน่งและพิกัด GPS ณ จุดเกิดเหตุ</span>
          <span className="text-rose-500">*</span>
        </label>

        <div className="flex items-center gap-2 flex-wrap">
          {accuracy !== null && (
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
              ความแม่นยำ GPS: ±{accuracy} เมตร
            </span>
          )}

          <button
            type="button"
            onClick={() => setTileLayerType(tileLayerType === 'street' ? 'satellite' : 'street')}
            className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors border border-slate-200 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{tileLayerType === 'street' ? 'มุมมองดาวเทียม' : 'มุมมองถนน'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors border border-teal-200 shadow-xs"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5 text-teal-700" /> : <Maximize2 className="w-3.5 h-3.5 text-teal-700" />}
            <span>{isExpanded ? 'ย่อแผนที่' : 'ขยายเต็มจอ'}</span>
          </button>
        </div>
      </div>

      {/* Input Field & GPS Action Buttons */}
      <div className="space-y-2">
        <input
          type="text"
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          placeholder="ระบุสถานที่ บ้านเลขที่ หมู่บ้าน ตำบล หรือคลิกปักหมุดบนแผนที่..."
          className="w-full bg-slate-50 border border-slate-300 text-slate-800 text-sm font-medium rounded-md px-3 py-2 focus:ring-2 focus:ring-teal-500 outline-none"
        />

        <div className="flex items-center gap-2 flex-wrap">
          {/* High Precision GPS Button */}
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={locating}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-md transition-all shadow-xs"
          >
            <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
            <span>{locating ? 'กำลังค้นหาพิกัดแม่นยำสูง...' : 'ดึงพิกัด GPS แม่นยำสูง'}</span>
          </button>

          {/* Real-time Tracking Toggle */}
          <button
            type="button"
            onClick={toggleLiveTracking}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-all ${
              isLiveTracking
                ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{isLiveTracking ? 'ติดตาม GPS แบบ Real-time (เปิดอยู่)' : 'ติดตามพิกัด Real-time'}</span>
          </button>

          {/* Google Maps External Direct Route */}
          {lat && lng && (
            <button
              type="button"
              onClick={openGoogleMapsRoute}
              className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
              <span>เปิดนำทาง Google Maps</span>
            </button>
          )}
        </div>

        {/* Display Latitude & Longitude Exact Text (Font Anuphan / font-sans) */}
        {lat && lng && (
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between text-xs font-sans text-slate-800">
            <span className="font-bold text-teal-700 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              พิกัดหมุดปัจจุบัน:
            </span>
            <span className="font-semibold tracking-wide">
              LAT: {lat.toFixed(6)} | LNG: {lng.toFixed(6)}
            </span>
          </div>
        )}
      </div>

      {/* Interactive Map View (Normal or Expanded Modal View) */}
      <div className={`w-full rounded-md border border-slate-300 overflow-hidden relative shadow-inner transition-all ${
        isExpanded ? 'fixed inset-4 z-50 bg-white shadow-2xl h-[calc(100vh-2rem)] border-2 border-teal-500' : 'h-64'
      }`}>
        {isExpanded && (
          <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-xs px-3 py-1.5 rounded-md backdrop-blur-xs flex items-center gap-1 shadow-md"
            >
              <Minimize2 className="w-4 h-4" />
              <span>ย่อหน้าจอแผนที่</span>
            </button>
          </div>
        )}

        <MapContainer
          center={[markerLat, markerLng]}
          zoom={16}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <ChangeView center={[markerLat, markerLng]} zoom={16} />

          {tileLayerType === 'street' ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          ) : (
            <TileLayer
              attribution='&copy; Esri World Imagery'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          )}

          {/* Emergency Marker with Draggable Pin */}
          <Marker
            position={[markerLat, markerLng]}
            icon={emergencyPinIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                handleSelectCoordinates(position.lat, position.lng);
              },
            }}
          >
            <Popup>
              <div className="text-xs font-sans text-center">
                <strong className="text-rose-600 block font-bold">หมุดจุดเกิดเหตุผู้ป่วย</strong>
                <span>ลากหมุดเพื่อปรับพิกัดให้ตรงตัวคนไข้มากที่สุด</span>
              </div>
            </Popup>
          </Marker>

          {/* Accuracy Circle */}
          {accuracy && (
            <Circle
              center={[markerLat, markerLng]}
              radius={accuracy}
              pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, weight: 1 }}
            />
          )}

          <MapEventsHandler onSelect={handleSelectCoordinates} />
        </MapContainer>

        <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-semibold text-slate-700 shadow-xs border border-slate-200">
          * คลิกหรือลากหมุดบนแผนที่เพื่อระบุตำแหน่งผู้ป่วยอย่างถูกต้องแม่นยำ
        </div>
      </div>
    </div>
  );
};

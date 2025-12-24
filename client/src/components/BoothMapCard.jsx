// client/src/components/BoothMapCard.jsx
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { MapPin, Search, X, Navigation, Clock, Ruler, Building2, Layers } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FIXED_SOURCE = {
  lat: 10.92554,
  lng: 78.70337,
  label: "TVK Office Manachanallur",
};

const MANNACHANALLUR_CENTER = [10.910048, 78.694909];

// 🎨 Custom Satellite-Optimized Icons
const boothIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", // Red stands out better on green satellite
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const hqIcon = new L.DivIcon({
  className: "custom-div-icon",
  html: `<div class="relative">
          <div class="absolute -inset-3 bg-white rounded-full animate-ping opacity-40"></div>
          <div class="relative bg-yellow-400 border-2 border-black w-5 h-5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] flex items-center justify-center">
            <div class="w-2 h-2 bg-black rounded-full"></div>
          </div>
         </div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export default function BoothMapCard({ district = "Trichy", taluk = null }) {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);
  
  const [search, setSearch] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersRef = useRef({});
  const routingControlRef = useRef(null);
  const animatedLineRef = useRef(null);

  const normalize = (s) => (s || "").toLowerCase().trim();

  // 🔄 Fetch Data
  useEffect(() => {
    const fetchBooths = async () => {
      try {
        setLoading(true);
        let url = `${API_URL}/api/booths?${taluk ? `taluk=${taluk}` : `district=${district}`}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        setBooths(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Map load error", e);
      } finally {
        setLoading(false);
      }
    };
    fetchBooths();
  }, [district, taluk]);

  // 🗺️ Initialize Satellite Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: MANNACHANALLUR_CENTER,
      zoom: 13,
      zoomControl: false,
    });

    // 🛰️ Google Satellite Hybrid Layer
    L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3'],
        attribution: '&copy; Google Maps Satellite'
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // HQ Marker with label
    L.marker([FIXED_SOURCE.lat, FIXED_SOURCE.lng], { icon: hqIcon })
      .addTo(map)
      .bindTooltip("TVK OFFICE HQ", { permanent: true, direction: "right", className: "satellite-tooltip" });

    markersLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
  }, []);

  const clearRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (routingControlRef.current) map.removeControl(routingControlRef.current);
    if (animatedLineRef.current) map.removeLayer(animatedLineRef.current);
    setRouteInfo(null);
    map.flyTo(MANNACHANALLUR_CENTER, 13);
  };

  const showRouteToBooth = (booth) => {
    const map = mapInstanceRef.current;
    if (!map || !booth) return;
    clearRoute();

    const control = L.Routing.control({
      waypoints: [L.latLng(FIXED_SOURCE.lat, FIXED_SOURCE.lng), L.latLng(booth.latitude, booth.longitude)],
      lineOptions: { styles: [{ color: "transparent", opacity: 0 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
    }).addTo(map);

    control.on("routesfound", (e) => {
      const route = e.routes[0];
      const coords = route.coordinates;
      const km = (route.summary.totalDistance / 1000).toFixed(1);
      const mins = Math.round((route.summary.totalDistance / 1000) / 35 * 60); // Slower avg speed for rural/satellite areas
      setRouteInfo({ km, mins, name: booth.name });

      let i = 0;
      // High-visibility cyan/yellow line for satellite
      const animatedLine = L.polyline([], { color: "#00f2ff", weight: 6, opacity: 1, lineJoin: 'round' }).addTo(map);
      animatedLineRef.current = animatedLine;

      const speed = Math.ceil(coords.length / 45);
      const interval = setInterval(() => {
        if (i < coords.length) {
          animatedLine.addLatLng(coords[i]);
          i += speed;
        } else {
          clearInterval(interval);
        }
      }, 20);
    });

    routingControlRef.current = control;
  };

  window.__routeToBooth = (id) => {
    const booth = booths.find((b) => b._id === id);
    if (booth) showRouteToBooth(booth);
  };

  useEffect(() => {
    const layer = markersLayerRef.current;
    if (!layer) return;
    layer.clearLayers();
    booths.forEach((booth) => {
      L.marker([booth.latitude, booth.longitude], { icon: boothIcon })
        .bindPopup(`
          <div class="p-2 min-w-[160px] font-sans">
            <h4 class="font-black text-gray-800 text-sm mb-1">${booth.name}</h4>
            <p class="text-[10px] text-gray-500 mb-3 uppercase tracking-tighter">Booth Code: ${booth.code}</p>
            <button onclick="window.__routeToBooth('${booth._id}')" 
              class="w-full bg-cyan-600 text-white text-[11px] py-2 rounded-lg font-bold shadow-lg hover:bg-cyan-700 transition active:scale-95">
              ANALYZE ROUTE
            </button>
          </div>
        `)
        .addTo(layer);
    });
  }, [booths]);

  return (
    <div className="bg-[#05070a] border border-gray-800 rounded-[2.5rem] p-6 h-full flex flex-col relative shadow-2xl overflow-hidden">
      {/* Search & Header UI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 z-10">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <Layers className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base text-white font-black tracking-tight leading-none mb-1">Satellite Intelligence</h3>
            <p className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-widest flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse"></div>
              {taluk || district} • {booths.length} Points
            </p>
          </div>
        </div>

        <div className="relative group">
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSuggestOpen(true); }}
            placeholder="Find booth location..."
            className="bg-black/40 backdrop-blur-md border border-white/10 text-white text-[12px] pl-10 pr-4 py-2.5 rounded-2xl w-full md:w-72 focus:border-cyan-500/50 outline-none transition-all shadow-inner"
          />
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
          {suggestOpen && search && (
            <div className="absolute mt-2 w-full bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl z-[2000] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
              {booths.filter(b => normalize(b.name).includes(normalize(search))).slice(0, 5).map(b => (
                <button key={b._id} onClick={() => { mapInstanceRef.current.flyTo([b.latitude, b.longitude], 17); setSuggestOpen(false); }}
                  className="w-full text-left px-5 py-3 text-[11px] text-gray-300 hover:bg-cyan-500/20 transition-colors border-b border-white/5 last:border-0">
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="relative flex-1 rounded-[2rem] overflow-hidden border border-white/5 group shadow-inner">
        {loading && <div className="absolute inset-0 bg-black/70 z-[1001] flex flex-col items-center justify-center backdrop-blur-md text-white">
            <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Loading Satellite Data</span>
        </div>}
        
        {/* 🛰️ Advanced Route Overlay Card */}
        {routeInfo && (
          <div className="absolute top-6 left-6 right-6 z-[1000] flex items-center justify-between pointer-events-none">
            <div className="bg-black/60 backdrop-blur-2xl border border-white/20 p-4 rounded-[1.5rem] flex items-center gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-10">
              <div className="flex items-center gap-4 pr-8 border-r border-white/10">
                <div className="p-2.5 bg-cyan-500 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.4)]"><Ruler className="w-5 h-5 text-black" /></div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Traversed</p>
                  <p className="text-lg font-black text-white">{routeInfo.km} <span className="text-[10px] font-normal text-cyan-400">KM</span></p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-white rounded-xl"><Clock className="w-5 h-5 text-black" /></div>
                <div>
                  <p className="text-[10px] text-gray-400 uppercase font-black">Estimated</p>
                  <p className="text-lg font-black text-white">~{routeInfo.mins} <span className="text-[10px] font-normal text-white/60">MINS</span></p>
                </div>
              </div>
            </div>
            
            <button onClick={clearRoute} className="pointer-events-auto bg-red-500 hover:bg-red-600 text-white p-3 rounded-2xl shadow-xl transition-all hover:rotate-90 active:scale-90">
              <X className="w-6 h-6" />
            </button>
          </div>
        )}

        <div ref={mapContainerRef} className="h-full w-full grayscale-[0.2] contrast-[1.1]" />
      </div>

      <style>{`
        .satellite-tooltip {
            background: rgba(0,0,0,0.8) !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            color: #fbbf24 !important;
            font-weight: 900 !important;
            text-transform: uppercase !important;
            font-size: 10px !important;
            border-radius: 6px !important;
            padding: 4px 8px !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
        }
      `}</style>
    </div>
  );
}
// client/src/pages/BoothMap.jsx
import { useEffect, useState, useRef } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import L from "leaflet";
import { Loader2, MapPin, Filter } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Custom marker icon
const boothIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DISTRICTS = [
  "Trichy",
  "Chennai",
  "Madurai",
  "Salem",
  "Coimbatore",
  "Thanjavur",
];

export default function BoothMap() {
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(false);
  const [district, setDistrict] = useState("Trichy");

  // Default center (Trichy approx)
  const [mapCenter, setMapCenter] = useState([10.7905, 78.7047]);
  const [zoom, setZoom] = useState(10);

  const mapRef = useRef(null);          // <div> DOM
  const mapInstanceRef = useRef(null);  // Leaflet map
  const markersLayerRef = useRef(null); // markers group

  // 🧲 Fetch booths based on district
  useEffect(() => {
    const fetchBooths = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_URL}/api/booths?district=${encodeURIComponent(district)}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setBooths(list);

        // If first booth exists, center map to its location
        if (list.length > 0) {
          setMapCenter([list[0].latitude, list[0].longitude]);
          setZoom(11);
        } else {
          // no booths → fallback center for that district
          if (district === "Trichy") {
            setMapCenter([10.7905, 78.7047]);
            setZoom(10);
          }
        }
      } catch (err) {
        console.error("Error loading booths", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooths();
  }, [district]);

  // 🗺️ Init Leaflet map (only once)
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: mapCenter,
      zoom,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;

    // optional cleanup on unmount:
    // return () => {
    //   map.remove();
    //   mapInstanceRef.current = null;
    //   markersLayerRef.current = null;
    // };
  }, []); // run only first render

  // 🎯 Update map view & markers when data/center changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    // Update view
    map.setView(mapCenter, zoom);

    // Clear old markers
    markersLayer.clearLayers();

    const latlngs = [];

    booths.forEach((booth) => {
      if (
        typeof booth.latitude === "number" &&
        typeof booth.longitude === "number"
      ) {
        const latlng = [booth.latitude, booth.longitude];
        latlngs.push(latlng);

        const marker = L.marker(latlng, { icon: boothIcon });

        const popupHtml = `
          <div style="font-size: 11px;">
            <div style="font-weight: 600; margin-bottom: 4px;">
              ${booth.name || ""} (${booth.code || ""})
            </div>
            <div>${booth.village || ""} • ${booth.taluk || ""}</div>
            <div>Voters: <b>${booth.votersCount || 0}</b></div>
            ${
              booth.inchargeName
                ? `<div>Incharge: <b>${booth.inchargeName}</b></div>`
                : ""
            }
            ${booth.phone ? `<div>📞 ${booth.phone}</div>` : ""}
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.addTo(markersLayer);
      }
    });

    // Fit bounds to markers if more than one
    if (latlngs.length > 1) {
      const bounds = L.latLngBounds(latlngs).pad(0.2);
      map.fitBounds(bounds);
    }
  }, [booths, mapCenter, zoom]);

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="w-6 h-6 text-sky-400" />
              District Booth Map
            </h1>
            <p className="text-sm text-gray-400">
              {district} district la iruka ella booth-um map la mark pannirukkom.
            </p>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Filter className="w-4 h-4 text-sky-300" />
            <select
              className="bg-transparent text-sm outline-none"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {DISTRICTS.map((d) => (
                <option key={d} value={d} className="bg-slate-900">
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Map + Side List */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-4 h-[550px]">
          {/* Map */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Booth data loading...
                </div>
              </div>
            )}

            {/* Leaflet map mount aagura div */}
            <div
              ref={mapRef}
              style={{ height: "100%", width: "100%" }}
            />
          </div>

          {/* Side List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold">
                Booth List ({booths.length})
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {booths.map((booth) => (
                <div
                  key={booth._id}
                  className="p-2 rounded-xl bg-black/20 border border-white/5 text-xs hover:border-sky-400/60 cursor-pointer"
                >
                  <div className="font-semibold">
                    {booth.name}{" "}
                    <span className="text-[10px]">({booth.code})</span>
                  </div>
                  <div className="text-[11px] text-gray-300">
                    {booth.village} • {booth.taluk}
                  </div>
                  <div className="mt-1 flex justify-between text-[11px]">
                    <span>Voters: {booth.votersCount}</span>
                    {booth.inchargeName && (
                      <span>Incharge: {booth.inchargeName}</span>
                    )}
                  </div>
                </div>
              ))}

              {booths.length === 0 && !loading && (
                <p className="text-xs text-gray-400">
                  {district} district ku booth data add pannala da. Backend la
                  few seed booths insert pannunga.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Loader2, MapPin, Filter } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Custom marker icon
const boothIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
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
        setBooths(data || []);

        // If first booth exists, center map to its location
        if (data && data.length > 0) {
          setMapCenter([data[0].latitude, data[0].longitude]);
          setZoom(11);
        }
      } catch (err) {
        console.error("Error loading booths", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooths();
  }, [district]);

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

            <MapContainer
              center={mapCenter}
              zoom={zoom}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {booths.map((booth) => (
                <Marker
                  key={booth._id}
                  position={[booth.latitude, booth.longitude]}
                  icon={boothIcon}
                >
                  <Popup>
                    <div className="space-y-1">
                      <h2 className="font-semibold text-sm">
                        {booth.name} ({booth.code})
                      </h2>
                      <p className="text-xs">
                        {booth.village}, {booth.taluk}
                      </p>
                      <p className="text-xs">
                        Voters: <b>{booth.votersCount}</b>
                      </p>
                      {booth.inchargeName && (
                        <p className="text-xs">
                          Incharge: <b>{booth.inchargeName}</b>
                        </p>
                      )}
                      {booth.phone && (
                        <p className="text-xs">📞 {booth.phone}</p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
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
                    {booth.name} <span className="text-[10px]">({booth.code})</span>
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

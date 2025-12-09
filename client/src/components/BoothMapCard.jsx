// client/src/components/BoothMapCard.jsx
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapPin, Search } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔹 Mannachanallur center (fixed)
const MANNACHANALLUR_CENTER = [10.910048, 78.694909];

const boothIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function BoothMapCard({ district = "Trichy", taluk = null }) {
  const [booths, setBooths] = useState([]);
  const [center, setCenter] = useState([10.7905, 78.7047]); // default Trichy
  const [loading, setLoading] = useState(false);

  // 🔍 search state
  const [search, setSearch] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const markersRef = useRef({}); // boothId -> marker

  const isMannachanallur = (taluk || "").toLowerCase().includes("manna");

  // small helper
  const normalize = (s) => (s || "").toString().toLowerCase().trim();

  // 🔄 Fetch booths using TALUK first
  useEffect(() => {
    const fetchBooths = async () => {
      try {
        setLoading(true);

        let url = `${API_URL}/api/booths`;
        if (taluk) {
          url += `?taluk=${encodeURIComponent(taluk)}`;
        } else {
          url += `?district=${encodeURIComponent(district)}`;
        }

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];

        setBooths(list);

        if (list.length > 0) {
          setCenter([list[0].latitude, list[0].longitude]);
        } else if (isMannachanallur) {
          setCenter(MANNACHANALLUR_CENTER);
        }
      } catch (err) {
        console.error("Booth map load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooths();
  }, [district, taluk, isMannachanallur]);

  // 🗺️ Init map once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCenter = isMannachanallur ? MANNACHANALLUR_CENTER : center;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: isMannachanallur ? 13 : 11,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    markersLayerRef.current = markersLayer;
  }, [isMannachanallur]);

  // 🧷 Focus a booth (zoom + popup open)
  const focusBooth = (booth) => {
    const map = mapInstanceRef.current;
    if (!map || !booth) return;

    const latlng = L.latLng(booth.latitude, booth.longitude);
    const marker = markersRef.current[booth._id];

    map.setView(latlng, 15, { animate: true });

    if (marker) {
      marker.openPopup();
    }
  };

  // 🔥 Draw markers + auto zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersRef.current = {};

    const latlngs = [];

    booths.forEach((booth) => {
      if (typeof booth.latitude === "number" && typeof booth.longitude === "number") {
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
            ${booth.inchargeName ? `<div>Incharge: <b>${booth.inchargeName}</b></div>` : ""}
            ${booth.phone ? `<div>📞 ${booth.phone}</div>` : ""}
          </div>
        `;

        marker.bindPopup(popupHtml);
        marker.addTo(markersLayer);

        // store marker reference
        markersRef.current[booth._id] = marker;
      }
    });

    // 🔶 Mannachanallur highlight + bounds
    if (isMannachanallur) {
      const focusCenter = L.latLng(MANNACHANALLUR_CENTER);

      let bounds;
      if (latlngs.length > 0) {
        bounds = L.latLngBounds(latlngs).pad(0.2);
      } else {
        bounds = L.latLngBounds(
          [focusCenter.lat - 0.03, focusCenter.lng - 0.03],
          [focusCenter.lat + 0.03, focusCenter.lng + 0.03]
        );
      }

      map.fitBounds(bounds);
      map.setMaxBounds(bounds.pad(0.3));

      L.circle(focusCenter, {
        radius: 3000,
        color: "#f59e0b",
        weight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.18,
      }).addTo(markersLayer);
    } else {
      if (latlngs.length > 0) {
        const bounds = L.latLngBounds(latlngs).pad(0.2);
        map.fitBounds(bounds);
      } else {
        map.setView(center, 11);
      }
    }
  }, [booths, center, isMannachanallur]);

  // 🔍 Filter for suggestions (booth name / code / incharge)
  const filteredBooths =
    search.trim().length === 0
      ? []
      : booths.filter((b) => {
          const q = normalize(search);
          return (
            normalize(b.name).includes(q) ||
            normalize(b.code).includes(q) ||
            normalize(b.inchargeName).includes(q)
          );
        });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;

    const q = normalize(search);
    const match =
      booths.find((b) => normalize(b.name).includes(q)) ||
      booths.find((b) => normalize(b.code).includes(q)) ||
      booths.find((b) => normalize(b.inchargeName).includes(q));

    if (match) {
      focusBooth(match);
      setSuggestOpen(false);
    }
  };

  const handlePickSuggestion = (booth) => {
    setSearch(booth.name || booth.code || "");
    setSuggestOpen(false);
    focusBooth(booth);
  };

  return (
  <div className="bg-[#0b0d11] border border-gray-800 rounded-2xl p-4 h-full flex flex-col">
    {/* Header + Search */}
    <div className="flex items-center justify-between mb-3 gap-3">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-red-900/30 border border-red-800/60">
          <MapPin className="w-4 h-4 text-yellow-400" />
        </div>
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest">
            BOOTH COVERAGE
          </p>
          <h3 className="text-sm font-semibold text-white">
            {taluk || district} – Map
          </h3>
        </div>
      </div>

      {/* 🔍 Search bar – header right */}
      <div className="relative w-60">
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center gap-2 bg-black/70 border border-gray-700 rounded-full px-3 py-1.5 shadow-lg"
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSuggestOpen(true);
            }}
            onFocus={() => setSuggestOpen(true)}
            placeholder="Booth / Code / Incharge"
            className="bg-transparent outline-none text-[11px] text-gray-100 placeholder:text-gray-500 w-full"
          />
        </form>

        {/* suggestions dropdown */}
        {suggestOpen && search.trim() && filteredBooths.length > 0 && (
  <div
    className="absolute mt-1 right-0 max-h-40 w-full overflow-y-auto 
               bg-[#05070b]/95 border border-gray-700/80 rounded-xl shadow-xl 
               text-[11px] text-gray-100 z-[9999]"
    style={{ position: "absolute" }}
  >
    {filteredBooths.slice(0, 6).map((b) => (
      <button
        key={b._id}
        type="button"
        onClick={() => handlePickSuggestion(b)}
        className="w-full text-left px-3 py-1.5 hover:bg-gray-800/70 flex flex-col gap-0.5"
      >
        <span className="font-semibold">
          {b.name}
          <span className="text-[10px] text-gray-400"> ({b.code})</span>
        </span>
        <span className="text-[10px] text-gray-400">
          {b.village} • {b.inchargeName || "No incharge"}
        </span>
      </button>
    ))}
  </div>
)}

      </div>
    </div>

    {/* Map container */}
    <div className="relative flex-1 min-h-[260px] rounded-xl overflow-hidden border border-gray-800/60">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-gray-200 z-10">
          Map loading…
        </div>
      )}
      <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
    </div>

    <p className="mt-2 text-[11px] text-gray-500">
      🔍 Search la booth name / code / incharge type pannina → marker zoom + popup open aagum.
    </p>
  </div>
);

}

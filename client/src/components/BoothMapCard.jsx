// client/src/components/BoothMapCard.jsx
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapPin } from "lucide-react";

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

export default function BoothMapCard({ district = "Trichy" }) {
  const [booths, setBooths] = useState([]);
  const [center, setCenter] = useState([10.7905, 78.7047]); // default Trichy
  const [loading, setLoading] = useState(false);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  const isMannachanallur =
    district.toLowerCase().includes("mannach") ||
    district.toLowerCase().includes("manachan");

  // Fetch booths for that "district" / area
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

        if (list.length > 0) {
          // use first booth center
          setCenter([list[0].latitude, list[0].longitude]);
        } else if (isMannachanallur) {
          // no booths but Mannachanallur required → fix center
          setCenter(MANNACHANALLUR_CENTER);
        }
      } catch (err) {
        console.error("Booth map load error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooths();
  }, [district, isMannachanallur]);

  // Init map once
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

    // optional cleanup
    // return () => {
    //   map.remove();
    //   mapInstanceRef.current = null;
    //   markersLayerRef.current = null;
    // };
  }, [isMannachanallur]); // re-init only if type changes

  // 🔥 Highlight Mannachanallur area + markers + zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

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

    // ✅ Special handling for Mannachanallur
    if (isMannachanallur) {
      const focusCenter = L.latLng(MANNACHANALLUR_CENTER);

      // If booths exist → use bounds of booths
      let bounds;
      if (latlngs.length > 0) {
        bounds = L.latLngBounds(latlngs).pad(0.2);
      } else {
        // No booths → create artificial bounds around center
        bounds = L.latLngBounds(
          [focusCenter.lat - 0.03, focusCenter.lng - 0.03],
          [focusCenter.lat + 0.03, focusCenter.lng + 0.03]
        );
      }

      map.fitBounds(bounds);        // zoom that area only
      map.setMaxBounds(bounds.pad(0.3)); // user can't move too far away

      // 🔶 Highlight circle for Mannachanallur area
      L.circle(focusCenter, {
        radius: 3000,                // 3km radius approx
        color: "#f59e0b",
        weight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.18,
      }).addTo(markersLayer);
    } else {
      // Non-Mannachanallur → normal behaviour
      if (latlngs.length > 0) {
        const bounds = L.latLngBounds(latlngs).pad(0.2);
        map.fitBounds(bounds);
      } else {
        map.setView(center, 11);
      }
    }
  }, [booths, center, isMannachanallur]);

  return (
    <div className="bg-[#0b0d11] border border-gray-800 rounded-2xl p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-red-900/30 border border-red-800/60">
            <MapPin className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-widest">
              BOOTH COVERAGE
            </p>
            <h3 className="text-sm font-semibold text-white">
              {district} – Map
            </h3>
          </div>
        </div>
        <span className="text-[11px] text-gray-500">
          Booths:{" "}
          <span className="text-yellow-400 font-semibold">
            {booths.length}
          </span>
        </span>
      </div>

      {/* Map container */}
      <div className="relative flex-1 min-h-[220px] rounded-xl overflow-hidden border border-gray-800/60">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs text-gray-200 z-10">
            Map loading…
          </div>
        )}
        <div ref={mapContainerRef} style={{ height: "100%", width: "100%" }} />
      </div>

      <p className="mt-2 text-[11px] text-gray-500">
        🔴 Highlighted circle = Mannachanallur area • Map auto zoom aagum, veliya
        pogama clamp pannirukku.
      </p>
    </div>
  );
}

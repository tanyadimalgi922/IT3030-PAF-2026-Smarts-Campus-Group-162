import { useEffect, useMemo, useState } from "react";
import { getResources } from "../../api/resourceApi";

const buildingOrder = [
  "Main Academic Block",
  "Science Complex",
  "Engineering Block",
  "Library Building",
  "Sports Center",
];

const floorOrder = ["Ground Floor", "1st Floor", "2nd Floor", "3rd Floor", "4th Floor"];

function CampusMapView() {
  const [resources, setResources] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(buildingOrder[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadResources() {
      setLoading(true);
      setError("");

      try {
        const data = await getResources();
        if (active) {
          setResources(data);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadResources();

    return () => {
      active = false;
    };
  }, []);

  const mappedResources = useMemo(() => {
    return resources.filter((resource) => resource.building === selectedBuilding);
  }, [resources, selectedBuilding]);

  const floorGroups = useMemo(() => {
    return floorOrder.map((floor) => ({
      floor,
      resources: mappedResources.filter((resource) => resource.floor === floor),
    }));
  }, [mappedResources]);

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-campus-blue">
            Campus Map
          </p>
          <h2 className="mt-1 text-2xl font-black text-campus-ink">Find resources by building</h2>
        </div>
        <select
          className="field-input max-w-sm"
          onChange={(event) => setSelectedBuilding(event.target.value)}
          value={selectedBuilding}
        >
          {buildingOrder.map((building) => (
            <option key={building} value={building}>
              {building}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-blue-100 bg-white shadow-panel">
        <div className="blue-hero p-5 text-white sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-100">
                {selectedBuilding}
              </p>
              <h3 className="mt-2 text-2xl font-black">Resource location guide</h3>
            </div>
            <span className="w-fit rounded-full bg-white px-4 py-2 text-sm font-black text-campus-navy">
              {mappedResources.length} resources
            </span>
          </div>
        </div>

        {error && (
          <div className="m-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
            {error}
          </div>
        )}

        <div className="grid gap-4 p-5 lg:grid-cols-5">
          {loading ? (
            <div className="rounded-lg border border-blue-100 p-4 text-sm font-bold text-campus-blue lg:col-span-5">
              Loading map...
            </div>
          ) : (
            floorGroups.map((group) => (
              <div
                className="min-h-48 rounded-lg border border-blue-100 bg-[#f8fbff] p-4"
                key={group.floor}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-campus-navy">{group.floor}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-campus-blue">
                    {group.resources.length}
                  </span>
                </div>

                <div className="mt-4 grid gap-2">
                  {group.resources.length > 0 ? (
                    group.resources.map((resource) => (
                      <div
                        className="rounded-md border border-blue-100 bg-white p-3 text-sm shadow-sm"
                        key={resource.id}
                      >
                        <p className="font-black text-campus-ink">{resource.name}</p>
                        <p className="mt-1 font-semibold text-slate-600">
                          Room {resource.roomNumber || "not set"} - {formatType(resource.type)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-md border border-dashed border-blue-200 bg-white/60 p-3 text-sm font-semibold text-slate-500">
                      No mapped resources
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function formatType(type) {
  return (type || "").replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default CampusMapView;

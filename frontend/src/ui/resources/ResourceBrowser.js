import { useEffect, useState } from "react";
import { getResources } from "../../api/resourceApi";
import ResourceCard from "./ResourceCard";

const resourceTypes = [
  { value: "", label: "All types" },
  { value: "LECTURE_HALL", label: "Lecture halls" },
  { value: "LAB", label: "Labs" },
  { value: "MEETING_ROOM", label: "Meeting rooms" },
  { value: "EQUIPMENT", label: "Equipment" },
];

function ResourceBrowser({ refreshKey = 0 }) {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    location: "",
    minCapacity: "",
  });
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadResources() {
      setLoading(true);
      setError("");

      try {
        const data = await getResources(filters);
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
  }, [filters, refreshKey]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="mt-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-campus-blue">
            Facilities & Assets Catalogue
          </p>
          <h2 className="mt-1 text-2xl font-black text-campus-ink">Bookable resources</h2>
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-blue-100 bg-campus-pale p-4 md:grid-cols-4">
        <input
          className="field-input"
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Search resources"
          type="search"
          value={filters.search}
        />
        <select
          className="field-input"
          onChange={(event) => updateFilter("type", event.target.value)}
          value={filters.type}
        >
          {resourceTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <input
          className="field-input"
          onChange={(event) => updateFilter("location", event.target.value)}
          placeholder="Location"
          value={filters.location}
        />
        <input
          className="field-input"
          min="1"
          onChange={(event) => updateFilter("minCapacity", event.target.value)}
          placeholder="Min capacity"
          type="number"
          value={filters.minCapacity}
        />
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
          {error}
        </div>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {loading ? (
          <div className="rounded-lg border border-blue-100 bg-white p-5 text-sm font-bold text-campus-blue">
            Loading resources...
          </div>
        ) : resources.length > 0 ? (
          resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)
        ) : (
          <div className="rounded-lg border border-blue-100 bg-white p-5 text-sm font-bold text-slate-600">
            No resources found.
          </div>
        )}
      </div>
    </section>
  );
}

export default ResourceBrowser;

import { useEffect, useMemo, useState } from "react";
import { getResources } from "../../api/resourceApi";

const resourceTypes = [
  { type: "LECTURE_HALL", label: "Lecture halls" },
  { type: "LAB", label: "Labs" },
  { type: "MEETING_ROOM", label: "Meeting rooms" },
  { type: "EQUIPMENT", label: "Equipment" },
];

function ResourceTypeChart() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const chartData = useMemo(() => {
    const counts = resourceTypes.map((item) => ({
      ...item,
      count: resources.filter((resource) => resource.type === item.type).length,
    }));
    const max = Math.max(...counts.map((item) => item.count), 1);
    const topType = counts.reduce((top, item) => (item.count > top.count ? item : top), counts[0]);

    return { counts, max, topType };
  }, [resources]);

  return (
    <section className="mt-6 rounded-[2rem] bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.22em] text-campus-blue">
            Resource Analytics
          </p>
          <h2 className="mt-2 text-3xl font-black text-campus-navy">
            Resource type distribution
          </h2>
        </div>
        <div className="rounded-2xl bg-[#eef6ff] px-5 py-3 text-sm font-black text-campus-navy">
          Total resources: {resources.length}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-blue-100 bg-[#f8fbff] p-5 text-sm font-black text-campus-blue">
          Loading resource analytics...
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4">
            {chartData.counts.map((item) => {
              const width = `${Math.max((item.count / chartData.max) * 100, item.count ? 10 : 4)}%`;

              return (
                <div key={item.type} className="grid gap-2 md:grid-cols-[10rem_1fr_3rem] md:items-center">
                  <p className="text-sm font-black text-campus-navy">{item.label}</p>
                  <div className="h-12 overflow-hidden rounded-2xl bg-[#eef6ff]">
                    <div
                      className="flex h-full items-center rounded-2xl bg-gradient-to-r from-[#123f7a] via-[#1f82ff] to-[#6fd2ff] px-4 text-sm font-black text-white transition-all"
                      style={{ width }}
                    >
                      {item.count > 0 ? item.count : ""}
                    </div>
                  </div>
                  <p className="text-right text-sm font-black text-campus-blue">{item.count}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-blue-100 bg-[#f8fbff] p-4 text-sm font-bold text-slate-600">
            Most common type:{" "}
            <span className="font-black text-campus-navy">
              {chartData.topType.count > 0 ? chartData.topType.label : "No resources yet"}
            </span>
          </div>
        </>
      )}
    </section>
  );
}

export default ResourceTypeChart;

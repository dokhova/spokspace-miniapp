import { useEffect, useState } from "react";
import { fetchJsonWithCache } from "../lib/cache";

const METRICS_CACHE_TTL_MS = 5 * 60 * 1000; // Metrics dashboard can be 5 minutes stale.
const METRICS_CACHE_KEY = "metrics:events"; // Shared cache; no auth context.

type MetricsData = {
  totalEvents?: number;
  clientCounts?: unknown;
  todayCounts?: unknown;
  yesterdayCounts?: unknown;
};

export default function Metrics() {
  const canAccess = typeof window !== "undefined" && window.location.search.includes("debug=1");
  const [data, setData] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await fetchJsonWithCache<MetricsData>(
        "/api/events",
        METRICS_CACHE_KEY,
        METRICS_CACHE_TTL_MS,
        { revalidate: true },
      );
      setData(payload);
    } catch {
      setError("Failed to load metrics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!canAccess) return;
    void fetchMetrics();
  }, [canAccess]);

  if (!canAccess) {
    return (
      <div>
        <h1>Metrics</h1>
        <p>Not available</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Metrics</h1>
      <button type="button" onClick={fetchMetrics} disabled={isLoading}>
        {isLoading ? "Loading..." : "Refresh"}
      </button>
      {error && <p>{error}</p>}
      {!data && !isLoading && !error && <p>No data</p>}
      {data && (
        <div>
          <section>
            <h2>totalEvents</h2>
            <pre>{JSON.stringify(data.totalEvents ?? 0, null, 2)}</pre>
          </section>
          <section>
            <h2>clientCounts</h2>
            <pre>{JSON.stringify(data.clientCounts ?? {}, null, 2)}</pre>
          </section>
          <section>
            <h2>todayCounts</h2>
            <pre>{JSON.stringify(data.todayCounts ?? {}, null, 2)}</pre>
          </section>
          <section>
            <h2>yesterdayCounts</h2>
            <pre>{JSON.stringify(data.yesterdayCounts ?? {}, null, 2)}</pre>
          </section>
        </div>
      )}
    </div>
  );
}

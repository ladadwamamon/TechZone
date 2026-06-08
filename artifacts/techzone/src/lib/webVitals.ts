import { onLCP, onCLS, onINP, onFCP, onTTFB, type Metric } from "web-vitals";

const ENDPOINT = `${import.meta.env.BASE_URL}api/metrics/web-vitals`.replace(/\/{2,}/g, "/");

function send(metric: Metric) {
  const body = JSON.stringify({
    metric: metric.name,
    value: metric.value,
    rating: metric.rating,
    path: window.location.pathname,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}

export function reportWebVitals() {
  onLCP(send);
  onCLS(send);
  onINP(send);
  onFCP(send);
  onTTFB(send);
}

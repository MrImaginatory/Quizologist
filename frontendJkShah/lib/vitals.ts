import type { Metric } from "web-vitals";

function sendMetric(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating);
  }

  // Send to analytics endpoint in production
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ANALYTICS_URL) {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      page: window.location.pathname,
    });

    // Use sendBeacon for reliable delivery without blocking
    if (navigator.sendBeacon) {
      navigator.sendBeacon(process.env.NEXT_PUBLIC_ANALYTICS_URL, body);
    } else {
      fetch(process.env.NEXT_PUBLIC_ANALYTICS_URL, {
        body,
        method: "POST",
        keepalive: true,
      }).catch(() => {});
    }
  }
}

export function reportWebVitals() {
  if (typeof window === "undefined") return;

  import("web-vitals").then(({ onLCP, onINP, onCLS, onFCP, onTTFB }) => {
    onLCP(sendMetric);
    onINP(sendMetric);
    onCLS(sendMetric);
    onFCP(sendMetric);
    onTTFB(sendMetric);
  });
}

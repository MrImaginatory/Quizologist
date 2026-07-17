import fs from "fs";
import path from "path";

interface HealthRecord {
  service: string;
  status: "UP" | "DOWN";
  timestamp: string;
  error?: string;
}

interface ServiceStatus {
  name: string;
  currentStatus: "UP" | "DOWN";
  lastCheck: string;
  uptime90d: number; // percentage
  history: { date: string; status: "UP" | "DOWN" }[];
}

const LOG_DIR = path.join(__dirname, "../../health-logs");
const LOG_FILE = path.join(LOG_DIR, "health-log.json");

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Initialize log file if it doesn't exist
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, JSON.stringify([]));
}

function readLog(): HealthRecord[] {
  try {
    const data = fs.readFileSync(LOG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeLog(records: HealthRecord[]): void {
  // Keep only last 90 days of records
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const filtered = records.filter((r) => new Date(r.timestamp) > cutoff);
  fs.writeFileSync(LOG_FILE, JSON.stringify(filtered, null, 2));
}

export function logHealth(service: string, status: "UP" | "DOWN", error?: string): void {
  const records = readLog();
  records.push({
    service,
    status,
    timestamp: new Date().toISOString(),
    error,
  });
  writeLog(records);
}

// Background health checker
let healthCheckInterval: NodeJS.Timeout | null = null;

export function startHealthChecker(serviceUrls: { name: string; url: string }[]): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  healthCheckInterval = setInterval(async () => {
    for (const service of serviceUrls) {
      try {
        const response = await fetch(`${service.url}/health`, { signal: AbortSignal.timeout(5000) });
        if (response.ok) {
          logHealth(service.name, "UP");
        } else {
          logHealth(service.name, "DOWN", response.statusText);
        }
      } catch (error: any) {
        logHealth(service.name, "DOWN", error.message);
      }
    }
  }, 60000); // Check every 60 seconds

  console.log("Health checker started - checking every 60 seconds");
}

export function stopHealthChecker(): void {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

export function getServiceStatuses(): ServiceStatus[] {
  const records = readLog();
  const services = [
    "user-service",
    "content-service",
    "question-service",
    "student-service",
    "test-service",
    "teacher-service",
    "dashboard-service",
  ];

  return services.map((service) => {
    const serviceRecords = records.filter((r) => r.service === service);

    // Get current status (most recent record)
    const latest = serviceRecords[serviceRecords.length - 1];
    const currentStatus = latest?.status || "DOWN";

    // Build 90-day history
    const history: { date: string; status: "UP" | "DOWN" }[] = [];
    const now = new Date();

    for (let i = 89; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Get all records for this date
      const dayRecords = serviceRecords.filter((r) => r.timestamp.startsWith(dateStr));

      if (dayRecords.length === 0) {
        // No records = assume UP (service was running before monitoring started)
        history.push({ date: dateStr, status: "UP" });
      } else {
        // If any DOWN record exists for the day, mark as DOWN
        const hasDown = dayRecords.some((r) => r.status === "DOWN");
        history.push({ date: dateStr, status: hasDown ? "DOWN" : "UP" });
      }
    }

    // Calculate uptime percentage
    const upDays = history.filter((h) => h.status === "UP").length;
    const uptime90d = Math.round((upDays / history.length) * 1000) / 10;

    return {
      name: service,
      currentStatus: currentStatus as "UP" | "DOWN",
      lastCheck: latest?.timestamp || new Date().toISOString(),
      uptime90d,
      history,
    };
  });
}

export function getIncidents(): { date: string; services: { name: string; status: string; error?: string; time: string }[] }[] {
  const records = readLog();
  const incidentsByDate = new Map<string, any[]>();

  // Group DOWN records by date
  records
    .filter((r) => r.status === "DOWN")
    .forEach((r) => {
      const date = r.timestamp.split("T")[0];
      if (!incidentsByDate.has(date)) {
        incidentsByDate.set(date, []);
      }
      incidentsByDate.get(date)!.push({
        name: r.service,
        status: "DOWN",
        error: r.error,
        time: new Date(r.timestamp).toLocaleTimeString(),
      });
    });

  return Array.from(incidentsByDate.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, services]) => ({ date, services }));
}

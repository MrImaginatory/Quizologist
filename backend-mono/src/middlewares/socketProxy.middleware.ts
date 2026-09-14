import http from "http";
import net from "net";
import { env } from "../config/env";

function extractTestServiceHost(): { host: string; port: number } {
  const url = new URL(env.TEST_SERVICE_URL);
  return {
    host: url.hostname,
    port: parseInt(url.port, 10) || 80,
  };
}

export function setupSocketProxy(server: http.Server): void {
  server.on("upgrade", (req, socket, head) => {
    const pathname = req.url?.split("?")[0] || "/";

    // Only proxy /socket.io/ paths
    if (!pathname.startsWith("/socket.io")) {
      socket.destroy();
      return;
    }

    const { host, port } = extractTestServiceHost();

    // Connect to test service and forward the upgrade tunnel
    const proxySocket = net.connect(port, host, () => {
      // Rebuild request line + headers exactly as received
      const headerLines = Object.entries(req.headers)
        .flatMap(([k, v]) =>
          Array.isArray(v) ? v.map((val) => `${k}: ${val}`) : [`${k}: ${v}`]
        )
        .join("\r\n");

      proxySocket.write(
        `${req.method} ${req.url} HTTP/${req.httpVersion}\r\n${headerLines}\r\n\r\n`
      );

      if (head?.length) proxySocket.write(head);

      proxySocket.pipe(socket);
      socket.pipe(proxySocket);
    });

    proxySocket.on("error", () => socket.destroy());
    socket.on("error", () => proxySocket.destroy());
  });
}


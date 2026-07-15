# Nginx Configuration for QuizNew

## Overview

Nginx sits in front of the API Gateway and handles:
- TLS termination (HTTPS)
- Static file serving
- WebSocket upgrade for Socket.IO
- Load balancing (when scaling with containers)

## Architecture

```
Client (Browser)
    │
    ▼
Nginx (:443 / :80)
    │
    ├── /api/* ────────► API Gateway (:3000) ──► Microservices
    └── /socket.io/* ──► API Gateway (:3000) ──► Test Service
```

---

## Nginx Config

```nginx
upstream gateway {
    # Single instance
    server gateway:3000;

    # For multiple gateway replicas (load balancing):
    # server gateway-1:3000;
    # server gateway-2:3000;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # TLS certificates
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Connection upgrade map for WebSocket
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    # REST API
    location /api/ {
        proxy_pass http://gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO (WebSocket)
    location /socket.io/ {
        proxy_pass http://gateway;
        proxy_http_version 1.1;

        # WebSocket upgrade headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Standard proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Long timeout for WebSocket connections (24 hours)
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;

        # Disable buffering for real-time
        proxy_buffering off;
    }

    # Health check endpoint (internal only)
    location /health {
        proxy_pass http://gateway/health;
        access_log off;
    }

    # Static files (if any)
    location /public/ {
        proxy_pass http://gateway/public/;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Socket.IO Specific Settings

The critical part for Socket.IO is the `location /socket.io/` block:

| Directive | Why |
|-----------|-----|
| `proxy_http_version 1.1` | Required for WebSocket upgrade |
| `proxy_set_header Upgrade` | Passes the upgrade header to gateway |
| `proxy_set_header Connection` | Maps to "upgrade" or "close" |
| `proxy_read_timeout 86400s` | Keeps WS alive for 24h (test duration) |
| `proxy_buffering off` | Real-time event delivery |

---

## Docker Compose Example

```yaml
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - gateway

  gateway:
    build: ./backend/apiGateway
    ports:
      - "3000:3000"
    environment:
      - TEST_SERVICE_URL=http://test-service:3005
      - USER_SERVICE_URL=http://user-service:3001
      # ... other service URLs

  test-service:
    build: ./backend/testService
    ports:
      - "3005:3005"

  # ... other services
```

---

## Podman Compose Example

Same as Docker Compose — replace `docker` with `podman`:

```bash
podman-compose up -d
```

Or use `podman pod` for tighter networking:

```bash
podman pod create --name quiznew -p 80:80 -p 443:443
```

---

## Scaling Test Service

When running multiple test service replicas, Socket.IO needs **sticky sessions** so a client's WebSocket always hits the same backend:

```nginx
upstream gateway {
    ip_hash;  # Sticky sessions by client IP
    server gateway-1:3000;
    server gateway-2:3000;
}
```

Or use a cookie-based approach if clients share IPs (e.g., behind corporate NAT):

```nginx
upstream gateway {
    hash $cookie_jsid consistent;  # Sticky by session cookie
    server gateway-1:3000;
    server gateway-2:3000;
}
```

---

## Verification

After deploying, test the WebSocket connection:

```javascript
// Browser console
const socket = io("https://yourdomain.com", {
  path: "/socket.io",
  auth: { token: "your-jwt-token" }
});

socket.on("connect", () => {
  console.log("Connected through Nginx → Gateway → Test Service");
});
```

Check Nginx logs for upgrade requests:

```bash
docker logs nginx --tail 50 | grep "101"
```

A `101 Switching Protocols` response confirms WebSocket upgrade is working.

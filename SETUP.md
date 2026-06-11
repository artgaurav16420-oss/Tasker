# Setup Guide

## AI Agent Instructions

When an AI agent needs to set up this project on a new machine inside the RRCAT network:

### Prerequisites
- Node.js 18+, npm
- Docker Desktop (for local Supabase) — AI agent must check if Docker is installed and running. If not present, ask the user to download from https://www.docker.com/products/docker-desktop/ and do not proceed until Docker is running.
- Supabase CLI (`npm install -g supabase`)
- Git

### Full Setup Sequence

0. **Verify Docker**
   AI agent must run `docker ps` to confirm Docker Desktop is running and responsive. If the command fails or Docker is not installed, ask the user to install Docker Desktop and wait for confirmation before proceeding.

1. **Clone and install**
   ```bash
   git clone <repo-url> Tasker
   cd Tasker
   npm install
   ```

2. **Start local Supabase**
   ```bash
   supabase start
   ```
   This starts all services (DB, Auth, Realtime, Storage, Studio). Note the ports and anon key from output.

3. **Configure environment**
   Copy `.env.example` to `.env.local`. Update `VITE_SUPABASE_URL` to the local Supabase API URL (typically `http://127.0.0.1:54421`) and `VITE_SUPABASE_ANON_KEY` to the publishable key from `supabase start` output.

4. **Run database migrations**
   Open Supabase Studio at `http://127.0.0.1:54423` and run `setup.sql` in the SQL Editor — creates tables, RLS, triggers, and RPC functions.

5. **Configure network access** (if other machines need access)
   - Update `VITE_SUPABASE_URL` in `.env.local` to `http://<LAN_IP>:3000` (points to Vite proxy)
   - Update `site_url` in `supabase/config.toml` to `http://<LAN_IP>:3000`
   - Add `http://<LAN_IP>:3000` and `http://127.0.0.1:3000` to `additional_redirect_urls`
   - Add inbound firewall rules for ports 3000 and 54421
   - Restart Supabase: `supabase stop && supabase start`
   - Restart Vite with `NO_PROXY=<LAN_IP>` set

6. **Start dev server**
   ```bash
   npm run dev
   ```

### Known Constraints
- Only `@rrcat.gov.in` email addresses can register/login
- Corporate Squid proxy at `10.31.31.10:5128` may block non-standard ports — use Vite proxy workaround (see Network Setup)
- Supabase sessions use `sessionStorage` — don't survive tab close

---

# Network Setup (RRCAT Environment)

## LAN Access from Other Machines

The dev server binds to `0.0.0.0` so other machines on the network can access it.

### Access URL

```
http://10.34.2.206:3000
```

### Corporate Proxy

RRCAT network uses a Squid proxy (`http://gaurava:<redacted>@10.31.31.10:5128`). Port 3000 is often blocked by the proxy. The app works around this via Vite proxy — all Supabase API calls go to port 3000 (same origin as the app), and Vite forwards them to the local Supabase instance:

| Route | Proxy Target |
|-------|-------------|
| `/rest/v1/*` | `http://10.34.2.206:54421/rest/v1/*` |
| `/auth/v1/*` | `http://10.34.2.206:54421/auth/v1/*` |
| `/realtime/v1/*` | `http://10.34.2.206:54421/realtime/v1/*` (WebSocket) |
| `/storage/v1/*` | `http://10.34.2.206:54421/storage/v1/*` |

This eliminates CORS issues and proxy blocking because all requests originate from port 3000.

### `site_url` Config

In `supabase/config.toml`, `site_url` is set to `http://10.34.2.206:3000` so the local Supabase auth service accepts CORS requests from the LAN address.

### Firewall

Two inbound firewall rules are required:

| Rule | Port | Purpose |
|------|------|---------|
| `ViteDev3000` | 3000 | Vite dev server |
| `SupabaseLocal54421` | 54421 | Local Supabase API |

### Email Domain Restriction

Only `@rrcat.gov.in` email addresses can login/signup. The AuthScreen input strips the domain — users type just their username prefix (e.g., `jdoe`) and `@rrcat.gov.in` is appended automatically.

### Team Roster / Manager Lookup

In Settings, user lookup accepts three formats:
- **UUID** — direct connector ID
- **Full email** — `jdoe@rrcat.gov.in`
- **Prefix only** — `jdoe` (appends `@rrcat.gov.in` automatically)

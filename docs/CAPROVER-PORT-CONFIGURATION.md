# CapRover Port Configuration Guide

## 🔍 Understanding Ports in CapRover

There are **TWO different ports** you need to configure in CapRover:

1. **Container Port** = What your app listens on **INSIDE the container**
2. **HTTP Port** = What CapRover uses to route traffic (can be **any port**, like 8080, 3000, etc.)

**Important:** These ports **DO NOT have to match!** CapRover automatically maps the HTTP Port to the Container Port.

---

## 📊 Port Configuration Summary

| App | Container Port (Internal) | HTTP Port (CapRover) | Domain |
|-----|--------------------------|---------------------|--------|
| `core-api` | `4000` (or `3000` from Dockerfile) | `8080` (or any port) | `api.afribrok.com` |
| `web-admin` | `3000` (Next.js default) | `3000` (or any port) | `admin.afribrok.com` |
| `web-marketplace` | `3000` (Next.js default) | `3000` (or any port) | `afribrok.com` |
| `media-service` | `3000` (or `3001`) | `3001` (or any port) | (internal) |

---

## 🔧 How Ports Work

### Container Port (Internal)
- This is what your app **actually listens on** inside the Docker container
- Set by the `PORT` environment variable or Dockerfile `EXPOSE` directive
- Your app code uses this port (e.g., `app.listen(4000)`)

### HTTP Port (CapRover Routing)
- This is what **CapRover uses** to route traffic to your app
- Can be **any available port** (8080, 3000, 4000, etc.)
- **Doesn't have to match** the Container Port
- CapRover automatically maps: `HTTP Port → Container Port`

### Example:
```
User Request → api.afribrok.com (port 443/80)
    ↓
CapRover HTTP Port: 8080
    ↓
Container Port: 4000
    ↓
Your App (listening on port 4000)
```

---

## ✅ Correct Configuration

### Core API (`core-api`)

**In CapRover:**
- **HTTP Port**: `8080` (or any port you want - this is what CapRover uses)
- **Container Port**: `4000` (this is what your app listens on)

**Environment Variables:**
```bash
PORT=4000  # This tells your app to listen on port 4000 inside the container
```

**How it works:**
- CapRover receives traffic on HTTP Port `8080`
- CapRover forwards it to Container Port `4000`
- Your app listens on port `4000` inside the container
- ✅ Everything works!

### Web Admin (`web-admin`)

**In CapRover:**
- **HTTP Port**: `3000` (or any port you want)
- **Container Port**: `3000` (Next.js runs on 3000 by default)

**Environment Variables:**
```bash
PORT=3000  # Next.js default port
```

### Web Marketplace (`web-marketplace`)

**In CapRover:**
- **HTTP Port**: `3000` (or any port you want)
- **Container Port**: `3000` (Next.js runs on 3000 by default)

**Environment Variables:**
```bash
PORT=3000  # Next.js default port
```

---

## 🎯 Key Points

1. **HTTP Port can be ANY port** (8080, 3000, 4000, etc.) - it's just for CapRover routing
2. **Container Port must match** what your app actually listens on (from `PORT` env var)
3. **They don't have to match!** CapRover handles the mapping automatically
4. **Each app needs a unique HTTP Port** (can't have two apps on the same HTTP Port)

---

## 📝 Step-by-Step Configuration

### For Core API:

1. **In CapRover → App Configs → HTTP Settings:**
   - **HTTP Port**: `8080` (or whatever port you want)
   - **Container Port**: `4000` (must match your app's PORT env var)

2. **In Environment Variables:**
   ```bash
   PORT=4000  # This is what your app listens on
   ```

3. **Result:**
   - CapRover routes traffic from HTTP Port `8080` → Container Port `4000`
   - Your app listens on port `4000` inside the container
   - ✅ Works perfectly!

### For Web Admin:

1. **In CapRover → App Configs → HTTP Settings:**
   - **HTTP Port**: `3000` (or any port)
   - **Container Port**: `3000` (Next.js default)

2. **In Environment Variables:**
   ```bash
   PORT=3000  # Next.js default
   ```

### For Web Marketplace:

1. **In CapRover → App Configs → HTTP Settings:**
   - **HTTP Port**: `3000` (or any port - but must be different from admin if both use 3000)
   - **Container Port**: `3000` (Next.js default)

2. **In Environment Variables:**
   ```bash
   PORT=3000  # Next.js default
   ```

**Note:** If both admin and marketplace use HTTP Port `3000`, CapRover will handle it because they have different domains. But it's better to use different ports for clarity.

---

## 🔍 How to Check Your Current Configuration

1. Go to **CapRover → Apps → Your App → App Configs**
2. Scroll to **HTTP Settings**
3. Check:
   - **HTTP Port** = What CapRover uses (e.g., 8080)
   - **Container Port** = What your app listens on (e.g., 4000)

4. Go to **Environment Variables**
5. Check:
   - **PORT** = Should match Container Port (e.g., 4000)

---

## ⚠️ Common Mistakes

### ❌ Wrong: HTTP Port and Container Port don't match the app's PORT env var
```
HTTP Port: 8080
Container Port: 4000
PORT env var: 3000  ❌ This won't work!
```

### ✅ Correct: Container Port matches PORT env var
```
HTTP Port: 8080
Container Port: 4000
PORT env var: 4000  ✅ This works!
```

---

## 🎯 Summary

- **HTTP Port** = CapRover's routing port (can be anything: 8080, 3000, etc.)
- **Container Port** = What your app listens on (must match `PORT` env var)
- **They don't have to match!** CapRover maps them automatically
- **Each app needs unique HTTP Port** (or different domains)

Your current setup:
- API: HTTP Port `8080` → Container Port `4000` ✅
- Admin: HTTP Port `3000` → Container Port `3000` ✅
- Marketplace: HTTP Port `3000` → Container Port `3000` ✅

This is **perfectly fine!** Just make sure:
- Core API has `PORT=4000` in environment variables
- Admin and Marketplace have `PORT=3000` in environment variables


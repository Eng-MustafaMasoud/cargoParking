/**
 * Minimal Express + ws server for Parking Reservation System (starter).
 * Run: npm install && npm start
 */
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const BASE = "/api/v1";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check endpoint
app.get(BASE, (req, res) => {
  res.json({
    status: "ok",
    message: "Parking Reservation API is running",
    version: "1.0.0",
    endpoints: [
      "/auth/login",
      "/master/gates",
      "/master/zones",
      "/master/categories",
      "/subscriptions/:id",
      "/tickets/checkin",
      "/tickets/checkout",
      "/tickets/:id",
      "/admin/reports/parking-state",
      "/admin/categories",
      "/admin/categories/:id",
      "/admin/zones",
      "/admin/zones/:id",
      "/admin/zones/:id/open",
      "/admin/gates",
      "/admin/gates/:id",
      "/admin/rush-hours",
      "/admin/rush-hours/:id",
      "/admin/vacations",
      "/admin/vacations/:id",
      "/admin/subscriptions",
      "/admin/subscriptions/:id",
      "/admin/users",
      "/admin/tickets",
      "/chat/messages",
    ],
  });
});

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, "seed.json")));

// In-memory DB (deep copy)
let db = JSON.parse(JSON.stringify(seed));

// Utilities
function nowIso() {
  return new Date().toISOString();
}
function ceil(n) {
  return Math.ceil(n);
}

// Simple auth - returns token "token-<userId>"
function loginUser(username, password) {
  const user = db.users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    token: "token-" + user.id,
  };
}

function getUserByToken(token) {
  if (!token) return null;
  const id = token.replace("Bearer ", "").replace("token-", "");
  return db.users.find((u) => u.id === id) || null;
}

// Helper: find category by id
function categoryById(id) {
  return db.categories.find((c) => c.id === id);
}

// Compute reserved based on subscriptions outside (subscriptions have single category field)
function computeReservedForCategory(categoryId) {
  // Count active subscriptions for this category that are currently not checked-in
  const subs = db.subscriptions.filter(
    (s) => s.active && s.category === categoryId
  );
  let checkedInCount = 0;
  subs.forEach((s) => {
    if (s.currentCheckins && s.currentCheckins.length > 0) {
      checkedInCount += s.currentCheckins.length;
    }
  });
  const subscribersOutside = subs.length - checkedInCount;
  const reserved = ceil(subscribersOutside * 0.15);
  return Math.min(reserved, 1000000); // cap loosely; zones will cap later by totalSlots
}

// Recompute zone state: reserved, free, availableForVisitors, availableForSubscribers
function recomputeZoneState(zone) {
  const category = categoryById(zone.categoryId);
  const reserved = computeReservedForCategory(zone.categoryId);
  const occupied = zone.occupied || 0;
  const total = zone.totalSlots || 0;
  const free = Math.max(0, total - occupied);
  // reservedFree = reserved - number of reserved slots already occupied by subscribers checked-in in this zone
  // We'll estimate reserved occupied in this zone by counting subscriber tickets in db.tickets that are checked-in for this zone (type subscriber)
  const reservedOccupied = db.tickets.filter(
    (t) => t.zoneId === zone.id && !t.checkoutAt && t.type === "subscriber"
  ).length;
  const reservedFree = Math.max(0, reserved - reservedOccupied);
  let availableForVisitors = Math.max(0, free - reservedFree);
  // cap reserved to total
  const finalReserved = Math.min(reserved, total);
  if (availableForVisitors < 0) availableForVisitors = 0;
  const availableForSubscribers = free;
  return {
    reserved: finalReserved,
    occupied,
    free,
    availableForVisitors,
    availableForSubscribers,
    rateNormal: category ? category.rateNormal : 0,
    rateSpecial: category ? category.rateSpecial : 0,
  };
}

// Build zone payload for master endpoints
function zonePayload(zone) {
  const state = recomputeZoneState(zone);
  return {
    id: zone.id,
    name: zone.name,
    categoryId: zone.categoryId,
    gateIds: zone.gateIds,
    totalSlots: zone.totalSlots,
    occupied: state.occupied,
    free: state.free,
    reserved: state.reserved,
    availableForVisitors: state.availableForVisitors,
    availableForSubscribers: state.availableForSubscribers,
    rateNormal: state.rateNormal,
    rateSpecial: state.rateSpecial,
    open: zone.open,
  };
}

// WebSocket server
const server = require("http").createServer(app);
const wss = new WebSocket.Server({ server, path: BASE + "/ws" });
// Map gateId -> Set of ws
const gateSubs = new Map();

function wsBroadcastZoneUpdate(zoneId) {
  const zone = db.zones.find((z) => z.id === zoneId);
  if (!zone) return;
  const payload = zonePayload(zone);
  const message = JSON.stringify({ type: "zone-update", payload });
  // broadcast to all connections subscribed to any gate that includes this zone
  db.gates.forEach((g) => {
    if (g.zoneIds.includes(zoneId)) {
      const conns = gateSubs.get(g.id);
      if (conns) {
        conns.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) ws.send(message);
        });
      }
    }
  });
}

// handle ws connections
wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    try {
      const m = JSON.parse(message.toString());
      if (m.type === "subscribe" && m.payload && m.payload.gateId) {
        const gid = m.payload.gateId;
        if (!gateSubs.has(gid)) gateSubs.set(gid, new Set());
        gateSubs.get(gid).add(ws);
        // send initial zone updates for gate
        const g = db.gates.find((x) => x.id === gid);
        if (g) {
          g.zoneIds.forEach((zid) => {
            const z = db.zones.find((z) => z.id === zid);
            if (z) {
              ws.send(
                JSON.stringify({ type: "zone-update", payload: zonePayload(z) })
              );
            }
          });
        }
      } else if (m.type === "unsubscribe" && m.payload && m.payload.gateId) {
        const gid = m.payload.gateId;
        if (gateSubs.has(gid)) gateSubs.get(gid).delete(ws);
      }
    } catch (err) {
      console.error("ws message error", err);
    }
  });
  ws.on("close", () => {
    // remove from all gateSubs
    gateSubs.forEach((set, gid) => {
      set.delete(ws);
    });
  });
});

// Middleware: auth
function authMiddleware(req, res, next) {
  const auth = req.headers["authorization"];
  if (!auth) {
    req.user = null;
    return next();
  }
  const user = getUserByToken(auth);
  req.user = user;
  next();
}
app.use(authMiddleware);

// Routes

app.post(BASE + "/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const u = loginUser(username, password);
  if (!u)
    return res
      .status(401)
      .json({ status: "error", message: "Invalid credentials" });
  res.json({
    user: { id: u.id, username: u.username, role: u.role },
    token: "token-" + u.id,
  });
});

// Public master endpoints
app.get(BASE + "/master/gates", (req, res) => {
  const list = db.gates.map((g) => ({
    id: g.id,
    name: g.name,
    zoneIds: g.zoneIds,
    location: g.location,
  }));
  res.json(list);
});

app.get(BASE + "/master/zones", (req, res) => {
  const gateId = req.query.gateId;
  let zones = db.zones;
  if (gateId) zones = zones.filter((z) => z.gateIds.includes(gateId));
  res.json(zones.map((z) => zonePayload(z)));
});

app.get(BASE + "/master/categories", (req, res) => {
  res.json(db.categories);
});

// Subscriptions
app.get(BASE + "/subscriptions/:id", (req, res) => {
  const id = req.params.id;
  const sub = db.subscriptions.find((s) => s.id === id);
  if (!sub)
    return res
      .status(404)
      .json({ status: "error", message: "Subscription not found" });
  res.json(sub);
});

// Tickets: checkin
app.post(BASE + "/tickets/checkin", (req, res) => {
  const { gateId, zoneId, type, subscriptionId } = req.body || {};
  if (!gateId || !zoneId || !type)
    return res
      .status(400)
      .json({ status: "error", message: "Missing required fields" });
  const zone = db.zones.find((z) => z.id === zoneId);
  if (!zone)
    return res.status(404).json({ status: "error", message: "Zone not found" });
  // recompute
  const state = recomputeZoneState(zone);
  if (!zone.open)
    return res.status(409).json({ status: "error", message: "Zone is closed" });
  if (type === "visitor") {
    if (state.availableForVisitors <= 0)
      return res
        .status(409)
        .json({ status: "error", message: "No available slots for visitors" });
  } else if (type === "subscriber") {
    const sub = db.subscriptions.find((s) => s.id === subscriptionId);
    if (!sub || !sub.active)
      return res
        .status(400)
        .json({ status: "error", message: "Invalid subscription" });
    if (!sub.categories && sub.category) sub.categories = [sub.category];
    // check permitted categories
    if (
      !sub.categories.includes(zone.categoryId) &&
      sub.category !== zone.categoryId
    ) {
      return res.status(403).json({
        status: "error",
        message: "Subscription not valid for this category",
      });
    }
    if (state.free <= 0)
      return res
        .status(409)
        .json({ status: "error", message: "No free slots for subscribers" });
  } else {
    return res.status(400).json({ status: "error", message: "Invalid type" });
  }
  const ticketId = "t_" + uuidv4().split("-")[0];
  const ticket = {
    id: ticketId,
    type,
    zoneId,
    gateId,
    checkinAt: nowIso(),
    checkoutAt: null,
  };
  db.tickets.push(ticket);
  // update zone occupancy
  zone.occupied = (zone.occupied || 0) + 1;
  // if subscriber, record in subscription.currentCheckins
  if (type === "subscriber") {
    const sub = db.subscriptions.find((s) => s.id === subscriptionId);
    if (sub) {
      if (!sub.currentCheckins) sub.currentCheckins = [];
      sub.currentCheckins.push({
        ticketId: ticket.id,
        zoneId: zoneId,
        checkinAt: ticket.checkinAt,
      });
    }
  }
  // Broadcast zone update
  wsBroadcastZoneUpdate(zoneId);
  res.status(201).json({ ticket, zoneState: zonePayload(zone) });
});

// Tickets: checkout
function isSpecialAt(timestamp) {
  // check vacations first
  const d = new Date(timestamp);
  const dateStr = d.toISOString().slice(0, 10);
  for (const v of db.vacations) {
    if (dateStr >= v.from && dateStr <= v.to)
      return { special: true, reason: "vacation" };
  }
  // then check rush windows (weekday)
  const wd = d.getUTCDay(); // 0..6
  const hhmm = d.toISOString().slice(11, 16); // "HH:MM"
  for (const r of db.rushHours) {
    if (r.weekDay == wd) {
      if (r.from <= hhmm && hhmm < r.to)
        return { special: true, reason: "rush" };
    }
  }
  return { special: false };
}

app.post(BASE + "/tickets/checkout", (req, res) => {
  const { ticketId, forceConvertToVisitor } = req.body || {};
  if (!ticketId)
    return res
      .status(400)
      .json({ status: "error", message: "Missing ticketId" });
  const ticket = db.tickets.find((t) => t.id === ticketId);
  if (!ticket)
    return res
      .status(404)
      .json({ status: "error", message: "Ticket not found" });
  if (ticket.checkoutAt)
    return res
      .status(400)
      .json({ status: "error", message: "Ticket already checked out" });
  const zone = db.zones.find((z) => z.id === ticket.zoneId);
  if (!zone)
    return res.status(404).json({ status: "error", message: "Zone not found" });
  // compute breakdown minute-by-minute and aggregate segments
  const checkin = new Date(ticket.checkinAt);
  const checkout = new Date();
  // allow override: if forceConvertToVisitor and ticket.type === 'subscriber', treat as visitor for billing
  const billingType =
    ticket.type === "subscriber" && forceConvertToVisitor
      ? "visitor"
      : ticket.type;
  // get category rates
  const category = categoryById(zone.categoryId);
  const rateNormal = category ? category.rateNormal : 0;
  const rateSpecial = category ? category.rateSpecial : 0;
  // build per-minute array
  const segments = [];
  let cursor = new Date(checkin.getTime());
  while (cursor < checkout) {
    const next = new Date(
      Math.min(cursor.getTime() + 60 * 1000, checkout.getTime())
    );
    const sp = isSpecialAt(cursor.toISOString());
    const mode = sp.special ? "special" : "normal";
    const rate = mode === "special" ? rateSpecial : rateNormal;
    segments.push({
      from: cursor.toISOString(),
      to: next.toISOString(),
      minutes: (next - cursor) / 60000,
      mode,
      rate,
      amount: ((((next - cursor) / 60000) * rate) / 60) * 60,
    }); // minutes * rate per hour -> convert
    cursor = next;
  }
  // aggregate contiguous segments with same mode
  const agg = [];
  for (const s of segments) {
    if (agg.length === 0) {
      agg.push(Object.assign({}, s));
      continue;
    }
    const last = agg[agg.length - 1];
    if (last.mode === s.mode && last.rate === s.rate && last.to === s.from) {
      last.to = s.to;
      last.minutes += s.minutes;
      last.amount += s.amount;
    } else {
      agg.push(Object.assign({}, s));
    }
  }
  // map to breakdown items hours and amounts
  const breakdown = agg.map((a) => ({
    from: a.from,
    to: a.to,
    hours: +(a.minutes / 60).toFixed(4),
    rateMode: a.mode,
    rate: a.rate,
    amount: +a.amount.toFixed(2),
  }));
  const totalAmount = breakdown.reduce((s, b) => s + b.amount, 0);
  ticket.checkoutAt = checkout.toISOString();
  // update zone occupancy
  zone.occupied = Math.max(0, (zone.occupied || 1) - 1);
  // if subscriber, remove from subscription.currentCheckins
  if (ticket.type === "subscriber") {
    for (const sub of db.subscriptions) {
      if (sub.currentCheckins && sub.currentCheckins.length) {
        const idx = sub.currentCheckins.findIndex(
          (c) => c.ticketId === ticket.id
        );
        if (idx >= 0) sub.currentCheckins.splice(idx, 1);
      }
    }
  }
  // Broadcast zone update
  wsBroadcastZoneUpdate(zone.id);
  res.json({
    ticketId: ticket.id,
    checkinAt: ticket.checkinAt,
    checkoutAt: ticket.checkoutAt,
    durationHours: +((checkout - checkin) / 3600000).toFixed(4),
    breakdown,
    amount: +totalAmount.toFixed(2),
    zoneState: zonePayload(zone),
  });
});

// Get ticket
app.get(BASE + "/tickets/:id", (req, res) => {
  const t = db.tickets.find((x) => x.id === req.params.id);
  if (!t)
    return res
      .status(404)
      .json({ status: "error", message: "Ticket not found" });
  res.json(t);
});

// Admin reports
app.get(BASE + "/admin/reports/parking-state", (req, res) => {
  const report = db.zones.map((z) => {
    const state = recomputeZoneState(z);
    return {
      zoneId: z.id,
      name: z.name,
      totalSlots: z.totalSlots,
      occupied: state.occupied,
      free: state.free,
      reserved: state.reserved,
      availableForVisitors: state.availableForVisitors,
      availableForSubscribers: state.availableForSubscribers,
      subscriberCount: db.subscriptions.filter(
        (s) => s.active && s.category === z.categoryId
      ).length,
      open: z.open,
    };
  });
  res.json(report);
});

// Admin: update category (rates)
app.put(BASE + "/admin/categories/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  const id = req.params.id;
  const cat = db.categories.find((c) => c.id === id);
  if (!cat)
    return res
      .status(404)
      .json({ status: "error", message: "Category not found" });
  const { rateNormal, rateSpecial, name, description } = req.body || {};
  if (rateNormal !== undefined) cat.rateNormal = rateNormal;
  if (rateSpecial !== undefined) cat.rateSpecial = rateSpecial;
  if (name) cat.name = name;
  if (description) cat.description = description;
  // broadcast admin-update (simple)
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "category-rates-changed",
      targetType: "category",
      targetId: id,
      details: { rateNormal: cat.rateNormal, rateSpecial: cat.rateSpecial },
      timestamp: nowIso(),
    },
  });
  // broadcast to all gate subscribers
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );
  res.json(cat);
});

// Admin: open/close zone
app.put(BASE + "/admin/zones/:id/open", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  const id = req.params.id;
  const zone = db.zones.find((z) => z.id === id);
  if (!zone)
    return res.status(404).json({ status: "error", message: "Zone not found" });
  zone.open = !!req.body.open;
  // broadcast admin-update and zone-update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: zone.open ? "zone-opened" : "zone-closed",
      targetType: "zone",
      targetId: id,
      details: { open: zone.open },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );
  wsBroadcastZoneUpdate(zone.id);
  res.json({ zoneId: zone.id, open: zone.open });
});

// ===== ZONE MANAGEMENT ENDPOINTS =====

// Admin: get all zones
app.get(BASE + "/admin/zones", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  res.json(db.zones.map((z) => zonePayload(z)));
});

// Admin: create zone
app.post(BASE + "/admin/zones", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const { name, categoryId, gateIds, totalSlots, location, description } =
    req.body;

  if (!name || !categoryId || !gateIds || !totalSlots) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: name, categoryId, gateIds, totalSlots",
    });
  }

  // Validate category exists
  const category = db.categories.find((c) => c.id === categoryId);
  if (!category) {
    return res.status(400).json({
      status: "error",
      message: "Category not found",
    });
  }

  // Validate gates exist
  for (const gateId of gateIds) {
    const gate = db.gates.find((g) => g.id === gateId);
    if (!gate) {
      return res.status(400).json({
        status: "error",
        message: `Gate ${gateId} not found`,
      });
    }
  }

  const zone = {
    id: "zone_" + uuidv4().split("-")[0],
    name,
    categoryId,
    gateIds,
    totalSlots: parseInt(totalSlots),
    location: location || "",
    description: description || "",
    open: true,
    occupied: 0,
  };

  db.zones.push(zone);

  // Update gate zoneIds
  gateIds.forEach((gateId) => {
    const gate = db.gates.find((g) => g.id === gateId);
    if (gate && !gate.zoneIds.includes(zone.id)) {
      gate.zoneIds.push(zone.id);
    }
  });

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "zone-created",
      targetType: "zone",
      targetId: zone.id,
      details: { name: zone.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.status(201).json(zonePayload(zone));
});

// Admin: update zone
app.put(BASE + "/admin/zones/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const zone = db.zones.find((z) => z.id === id);
  if (!zone)
    return res.status(404).json({ status: "error", message: "Zone not found" });

  const { name, categoryId, gateIds, totalSlots, location, description } =
    req.body;

  if (name) zone.name = name;
  if (categoryId) {
    const category = db.categories.find((c) => c.id === categoryId);
    if (!category) {
      return res.status(400).json({
        status: "error",
        message: "Category not found",
      });
    }
    zone.categoryId = categoryId;
  }
  if (gateIds) {
    // Validate gates exist
    for (const gateId of gateIds) {
      const gate = db.gates.find((g) => g.id === gateId);
      if (!gate) {
        return res.status(400).json({
          status: "error",
          message: `Gate ${gateId} not found`,
        });
      }
    }

    // Update gate zoneIds
    const oldGateIds = zone.gateIds;
    const newGateIds = gateIds;

    // Remove zone from old gates
    oldGateIds.forEach((gateId) => {
      const gate = db.gates.find((g) => g.id === gateId);
      if (gate) {
        gate.zoneIds = gate.zoneIds.filter((zid) => zid !== zone.id);
      }
    });

    // Add zone to new gates
    newGateIds.forEach((gateId) => {
      const gate = db.gates.find((g) => g.id === gateId);
      if (gate && !gate.zoneIds.includes(zone.id)) {
        gate.zoneIds.push(zone.id);
      }
    });

    zone.gateIds = gateIds;
  }
  if (totalSlots !== undefined) zone.totalSlots = parseInt(totalSlots);
  if (location !== undefined) zone.location = location;
  if (description !== undefined) zone.description = description;

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "zone-updated",
      targetType: "zone",
      targetId: zone.id,
      details: { name: zone.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json(zonePayload(zone));
});

// Admin: delete zone
app.delete(BASE + "/admin/zones/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const zoneIndex = db.zones.findIndex((z) => z.id === id);
  if (zoneIndex === -1)
    return res.status(404).json({ status: "error", message: "Zone not found" });

  const zone = db.zones[zoneIndex];

  // Remove zone from gates
  zone.gateIds.forEach((gateId) => {
    const gate = db.gates.find((g) => g.id === gateId);
    if (gate) {
      gate.zoneIds = gate.zoneIds.filter((zid) => zid !== zone.id);
    }
  });

  // Remove zone
  db.zones.splice(zoneIndex, 1);

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "zone-deleted",
      targetType: "zone",
      targetId: id,
      details: { name: zone.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json({ message: "Zone deleted successfully" });
});

// ===== CATEGORY MANAGEMENT ENDPOINTS =====

// Admin: get all categories
app.get(BASE + "/admin/categories", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  res.json(db.categories);
});

// Admin: create category
app.post(BASE + "/admin/categories", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const { name, description, rateNormal, rateSpecial } = req.body;

  if (!name || rateNormal === undefined || rateSpecial === undefined) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: name, rateNormal, rateSpecial",
    });
  }

  const category = {
    id: "cat_" + uuidv4().split("-")[0],
    name,
    description: description || "",
    rateNormal: parseFloat(rateNormal),
    rateSpecial: parseFloat(rateSpecial),
  };

  db.categories.push(category);

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "category-created",
      targetType: "category",
      targetId: category.id,
      details: { name: category.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.status(201).json(category);
});

// Admin: delete category
app.delete(BASE + "/admin/categories/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const categoryIndex = db.categories.findIndex((c) => c.id === id);
  if (categoryIndex === -1)
    return res
      .status(404)
      .json({ status: "error", message: "Category not found" });

  const category = db.categories[categoryIndex];

  // Check if category is in use by zones
  const zonesUsingCategory = db.zones.filter((z) => z.categoryId === id);
  if (zonesUsingCategory.length > 0) {
    return res.status(409).json({
      status: "error",
      message: "Cannot delete category that is in use by zones",
    });
  }

  // Remove category
  db.categories.splice(categoryIndex, 1);

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "category-deleted",
      targetType: "category",
      targetId: id,
      details: { name: category.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json({ message: "Category deleted successfully" });
});

// ===== GATE MANAGEMENT ENDPOINTS =====

// Admin: get all gates
app.get(BASE + "/admin/gates", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  res.json(db.gates);
});

// Admin: create gate
app.post(BASE + "/admin/gates", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const { name, zoneIds, location } = req.body;

  if (!name) {
    return res.status(400).json({
      status: "error",
      message: "Missing required field: name",
    });
  }

  // Validate zones exist
  if (zoneIds) {
    for (const zoneId of zoneIds) {
      const zone = db.zones.find((z) => z.id === zoneId);
      if (!zone) {
        return res.status(400).json({
          status: "error",
          message: `Zone ${zoneId} not found`,
        });
      }
    }
  }

  const gate = {
    id: "gate_" + uuidv4().split("-")[0],
    name,
    zoneIds: zoneIds || [],
    location: location || "",
  };

  db.gates.push(gate);

  // Update zone gateIds
  if (zoneIds) {
    zoneIds.forEach((zoneId) => {
      const zone = db.zones.find((z) => z.id === zoneId);
      if (zone && !zone.gateIds.includes(gate.id)) {
        zone.gateIds.push(gate.id);
      }
    });
  }

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "gate-created",
      targetType: "gate",
      targetId: gate.id,
      details: { name: gate.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.status(201).json(gate);
});

// Admin: update gate
app.put(BASE + "/admin/gates/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const gate = db.gates.find((g) => g.id === id);
  if (!gate)
    return res.status(404).json({ status: "error", message: "Gate not found" });

  const { name, zoneIds, location } = req.body;

  if (name) gate.name = name;
  if (location !== undefined) gate.location = location;

  if (zoneIds) {
    // Validate zones exist
    for (const zoneId of zoneIds) {
      const zone = db.zones.find((z) => z.id === zoneId);
      if (!zone) {
        return res.status(400).json({
          status: "error",
          message: `Zone ${zoneId} not found`,
        });
      }
    }

    // Update zone gateIds
    const oldZoneIds = gate.zoneIds;
    const newZoneIds = zoneIds;

    // Remove gate from old zones
    oldZoneIds.forEach((zoneId) => {
      const zone = db.zones.find((z) => z.id === zoneId);
      if (zone) {
        zone.gateIds = zone.gateIds.filter((gid) => gid !== gate.id);
      }
    });

    // Add gate to new zones
    newZoneIds.forEach((zoneId) => {
      const zone = db.zones.find((z) => z.id === zoneId);
      if (zone && !zone.gateIds.includes(gate.id)) {
        zone.gateIds.push(gate.id);
      }
    });

    gate.zoneIds = zoneIds;
  }

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "gate-updated",
      targetType: "gate",
      targetId: gate.id,
      details: { name: gate.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json(gate);
});

// Admin: delete gate
app.delete(BASE + "/admin/gates/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const gateIndex = db.gates.findIndex((g) => g.id === id);
  if (gateIndex === -1)
    return res.status(404).json({ status: "error", message: "Gate not found" });

  const gate = db.gates[gateIndex];

  // Remove gate from zones
  gate.zoneIds.forEach((zoneId) => {
    const zone = db.zones.find((z) => z.id === zoneId);
    if (zone) {
      zone.gateIds = zone.gateIds.filter((gid) => gid !== gate.id);
    }
  });

  // Remove gate
  db.gates.splice(gateIndex, 1);

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "gate-deleted",
      targetType: "gate",
      targetId: id,
      details: { name: gate.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json({ message: "Gate deleted successfully" });
});

// ===== RUSH HOURS MANAGEMENT ENDPOINTS =====

// Admin: get all rush hours
app.get(BASE + "/admin/rush-hours", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  res.json(db.rushHours || []);
});

// Admin rush-hours & vacations (simple create)
app.post(BASE + "/admin/rush-hours", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  const r = {
    id: "rush_" + uuidv4().split("-")[0],
    weekDay: req.body.weekDay,
    from: req.body.from,
    to: req.body.to,
  };
  db.rushHours.push(r);
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "rush-updated",
      targetType: "rush",
      targetId: r.id,
      details: r,
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );
  res.status(201).json(r);
});
// Admin: update rush hour
app.put(BASE + "/admin/rush-hours/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const rushHour = db.rushHours.find((r) => r.id === id);
  if (!rushHour)
    return res
      .status(404)
      .json({ status: "error", message: "Rush hour not found" });

  const { weekDay, from, to } = req.body;
  if (weekDay !== undefined) rushHour.weekDay = weekDay;
  if (from) rushHour.from = from;
  if (to) rushHour.to = to;

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "rush-updated",
      targetType: "rush",
      targetId: rushHour.id,
      details: rushHour,
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json(rushHour);
});

// Admin: delete rush hour
app.delete(BASE + "/admin/rush-hours/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const rushHourIndex = db.rushHours.findIndex((r) => r.id === id);
  if (rushHourIndex === -1)
    return res
      .status(404)
      .json({ status: "error", message: "Rush hour not found" });

  const rushHour = db.rushHours[rushHourIndex];
  db.rushHours.splice(rushHourIndex, 1);

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "rush-deleted",
      targetType: "rush",
      targetId: id,
      details: { weekDay: rushHour.weekDay },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json({ message: "Rush hour deleted successfully" });
});

// ===== VACATIONS MANAGEMENT ENDPOINTS =====

// Admin: get all vacations
app.get(BASE + "/admin/vacations", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  res.json(db.vacations || []);
});

app.post(BASE + "/admin/vacations", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  const v = {
    id: "vac_" + uuidv4().split("-")[0],
    name: req.body.name,
    from: req.body.from,
    to: req.body.to,
  };
  db.vacations.push(v);
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "vacation-added",
      targetType: "vacation",
      targetId: v.id,
      details: v,
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );
  res.status(201).json(v);
});

// Admin: update vacation
app.put(BASE + "/admin/vacations/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const vacation = db.vacations.find((v) => v.id === id);
  if (!vacation)
    return res
      .status(404)
      .json({ status: "error", message: "Vacation not found" });

  const { name, from, to } = req.body;
  if (name) vacation.name = name;
  if (from) vacation.from = from;
  if (to) vacation.to = to;

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "vacation-updated",
      targetType: "vacation",
      targetId: vacation.id,
      details: vacation,
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json(vacation);
});

// Admin: delete vacation
app.delete(BASE + "/admin/vacations/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const vacationIndex = db.vacations.findIndex((v) => v.id === id);
  if (vacationIndex === -1)
    return res
      .status(404)
      .json({ status: "error", message: "Vacation not found" });

  const vacation = db.vacations[vacationIndex];
  db.vacations.splice(vacationIndex, 1);

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "vacation-deleted",
      targetType: "vacation",
      targetId: id,
      details: { name: vacation.name },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json({ message: "Vacation deleted successfully" });
});

// ===== USER MANAGEMENT ENDPOINTS =====

// Admin: get all users
app.get(BASE + "/admin/users", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  res.json(db.users);
});

// Admin: create user
app.post(BASE + "/admin/users", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({
      status: "error",
      message: "Missing required fields: username, password, role",
    });
  }

  // Check if username already exists
  const existingUser = db.users.find((u) => u.username === username);
  if (existingUser) {
    return res.status(409).json({
      status: "error",
      message: "Username already exists",
    });
  }

  const newUser = {
    id: "user_" + uuidv4().split("-")[0],
    username,
    password,
    role: role === "admin" ? "admin" : "employee",
  };

  db.users.push(newUser);

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "user-created",
      targetType: "user",
      targetId: newUser.id,
      details: { username: newUser.username, role: newUser.role },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res
    .status(201)
    .json({ id: newUser.id, username: newUser.username, role: newUser.role });
});

// ===== SUBSCRIPTION MANAGEMENT ENDPOINTS =====

// Admin get subscriptions
app.get(BASE + "/admin/subscriptions", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });
  res.json(db.subscriptions);
});

// Admin: create subscription
app.post(BASE + "/admin/subscriptions", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const { userName, category, cars, startsAt, expiresAt } = req.body;

  if (!userName || !category || !cars || !startsAt || !expiresAt) {
    return res.status(400).json({
      status: "error",
      message:
        "Missing required fields: userName, category, cars, startsAt, expiresAt",
    });
  }

  // Validate category exists
  const categoryExists = db.categories.find((c) => c.id === category);
  if (!categoryExists) {
    return res.status(400).json({
      status: "error",
      message: "Category not found",
    });
  }

  const subscription = {
    id: "sub_" + uuidv4().split("-")[0],
    userName,
    active: true,
    category,
    cars,
    startsAt,
    expiresAt,
    currentCheckins: [],
  };

  db.subscriptions.push(subscription);

  // Recompute zone states for affected zones
  db.zones.forEach((zone) => {
    if (zone.categoryId === category) {
      wsBroadcastZoneUpdate(zone.id);
    }
  });

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "subscription-created",
      targetType: "subscription",
      targetId: subscription.id,
      details: {
        userName: subscription.userName,
        category: subscription.category,
      },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.status(201).json(subscription);
});

// Admin: update subscription
app.put(BASE + "/admin/subscriptions/:id", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const id = req.params.id;
  const subscription = db.subscriptions.find((s) => s.id === id);
  if (!subscription)
    return res
      .status(404)
      .json({ status: "error", message: "Subscription not found" });

  const { userName, category, cars, startsAt, expiresAt, active } = req.body;

  if (userName) subscription.userName = userName;
  if (category) {
    // Validate category exists
    const categoryExists = db.categories.find((c) => c.id === category);
    if (!categoryExists) {
      return res.status(400).json({
        status: "error",
        message: "Category not found",
      });
    }
    subscription.category = category;
  }
  if (cars) subscription.cars = cars;
  if (startsAt) subscription.startsAt = startsAt;
  if (expiresAt) subscription.expiresAt = expiresAt;
  if (active !== undefined) subscription.active = active;

  // Recompute zone states for affected zones
  db.zones.forEach((zone) => {
    if (zone.categoryId === subscription.category) {
      wsBroadcastZoneUpdate(zone.id);
    }
  });

  // Broadcast admin update
  const msg = JSON.stringify({
    type: "admin-update",
    payload: {
      adminId: user.id,
      action: "subscription-updated",
      targetType: "subscription",
      targetId: subscription.id,
      details: { userName: subscription.userName, active: subscription.active },
      timestamp: nowIso(),
    },
  });
  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(msg);
    })
  );

  res.json(subscription);
});

// ===== TICKET QUERY ENDPOINTS =====

// Get ticket by ID
app.get(BASE + "/tickets/:id", (req, res) => {
  const user = req.user;
  if (!user)
    return res.status(401).json({ status: "error", message: "Unauthorized" });

  const id = req.params.id;
  const ticket = db.tickets.find((t) => t.id === id);
  if (!ticket)
    return res
      .status(404)
      .json({ status: "error", message: "Ticket not found" });

  res.json(ticket);
});

// Admin: get tickets with status filter
app.get(BASE + "/admin/tickets", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const { status } = req.query;
  let tickets = db.tickets;

  if (status) {
    if (status === "checkedin") {
      tickets = tickets.filter((t) => !t.checkoutAt);
    } else if (status === "checkedout") {
      tickets = tickets.filter((t) => t.checkoutAt);
    }
  }

  res.json(tickets);
});

// Admin parking state report
app.get(BASE + "/admin/reports/parking-state", (req, res) => {
  const user = req.user;
  if (!user || user.role !== "admin")
    return res.status(403).json({ status: "error", message: "Forbidden" });

  const report = {
    timestamp: nowIso(),
    zones: db.zones.map((zone) => {
      const state = recomputeZoneState(zone);
      return {
        id: zone.id,
        name: zone.name,
        categoryId: zone.categoryId,
        open: zone.open,
        totalSlots: zone.totalSlots,
        occupied: state.occupied,
        free: state.free,
        reserved: state.reserved,
        availableForVisitors: state.availableForVisitors,
        availableForSubscribers: state.availableForSubscribers,
        rateNormal: zone.rateNormal,
        rateSpecial: zone.rateSpecial,
      };
    }),
    gates: db.gates.map((gate) => ({
      id: gate.id,
      name: gate.name,
      location: gate.location,
      zoneIds: gate.zoneIds,
    })),
    categories: db.categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      rateNormal: cat.rateNormal,
      rateSpecial: cat.rateSpecial,
    })),
    totalZones: db.zones.length,
    totalGates: db.gates.length,
    totalCategories: db.categories.length,
  };

  res.json(report);
});

// Chat endpoints
app.get(BASE + "/chat/messages", (req, res) => {
  const user = req.user;
  if (!user)
    return res.status(401).json({ status: "error", message: "Unauthorized" });

  // Initialize chat messages if not exists
  if (!db.chatMessages) db.chatMessages = [];

  res.json(db.chatMessages.slice(-50)); // Return last 50 messages
});

app.post(BASE + "/chat/messages", (req, res) => {
  const user = req.user;
  if (!user)
    return res.status(401).json({ status: "error", message: "Unauthorized" });

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res
      .status(400)
      .json({ status: "error", message: "Message is required" });
  }

  // Initialize chat messages if not exists
  if (!db.chatMessages) db.chatMessages = [];

  const chatMessage = {
    id: "msg-" + uuidv4(),
    userId: user.id,
    username: user.username,
    role: user.role,
    message: message.trim(),
    timestamp: nowIso(),
  };

  db.chatMessages.push(chatMessage);

  // Broadcast message to all connected clients
  const broadcastMessage = JSON.stringify({
    type: "chat-message",
    payload: chatMessage,
  });

  gateSubs.forEach((set) =>
    set.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) ws.send(broadcastMessage);
    })
  );

  res.status(201).json(chatMessage);
});

// Start server
server.listen(PORT, () => {
  console.log(
    `Parking backend starter listening on http://localhost:${PORT}${BASE}`
  );
});

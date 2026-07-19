"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "./localAuth";

const API_BASE = "/api/webpilot";

export const webpilotApi = {
  startTask: async (prompt: string, modelTier: string = "auto") => {
    const token = getAccessToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/runs`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt, modelTier }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  listTasks: async (limit: number = 20) => {
    const res = await fetch(`${API_BASE}/runs?limit=${limit}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getActiveTask: async () => {
    const res = await fetch(`${API_BASE}/runs/active`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  getTask: async (runId: string) => {
    const res = await fetch(`${API_BASE}/runs/${runId}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  stopTask: async (runId: string) => {
    const res = await fetch(`${API_BASE}/runs/${runId}/stop`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  pauseTask: async (runId: string) => {
    const res = await fetch(`${API_BASE}/runs/${runId}/pause`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  resumeTask: async (runId: string) => {
    const res = await fetch(`${API_BASE}/runs/${runId}/resume`, { method: "POST" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
};

export function useWebPilotSocket(runId: string | null) {
  const [events, setEvents] = useState<any[]>([]);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("unknown");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!runId) return;
    
    // Clear state on runId change
    setEvents([]);
    setScreenshot(null);
    setStatus("unknown");

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // WebSocket goes directly to the Python microservice (Next.js rewrites don't proxy WS)
    const webpilotHost =
      process.env.NEXT_PUBLIC_WEBPILOT_WS_URL || "localhost:8001";
    const ws = new WebSocket(`${protocol}//${webpilotHost}/ws/webpilot/${runId}`);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = (err) => console.error("WebPilot WS Error:", err);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "screenshot") {
          setScreenshot(`data:image/jpeg;base64,${msg.payload.imageBase64}`);
        } else if (msg.type === "run_status") {
          setStatus(msg.payload.state);
        } else {
          setEvents((prev) => [...prev, msg]);
        }
      } catch (e) {
        console.error("Failed to parse WS msg", e);
      }
    };

    return () => {
      ws.close();
    };
  }, [runId]);

  return { events, screenshot, status, connected };
}

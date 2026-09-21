/**
 * Unified Single-Connection Server-Sent Events (SSE) Client
 * Ensures only 1 persistent HTTP connection is maintained per browser tab,
 * completely preventing browser socket exhaustion (HTTP/1.1 max 6 connections).
 */

type SSEHandler = (data: any) => void;

class SSEClient {
  private eventSource: EventSource | null = null;
  private listeners: Map<string, Set<SSEHandler>> = new Map();
  private isConnecting = false;
  private reconnectTimer: any = null;
  private reconnectAttempts = 0;
  private broadcast: BroadcastChannel | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.broadcast = new BroadcastChannel('si_apin_sse_channel');
          this.broadcast.onmessage = (event) => {
            if (event.data && event.data.type) {
              this.dispatchLocal(event.data.type, event.data.data);
            }
          };
        }
      } catch {}
      this.initConnection();
    }
  }

  private initConnection() {
    if (typeof window === 'undefined' || this.isConnecting || this.eventSource) return;
    this.isConnecting = true;

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        console.log('[SSE] Unified stream connected successfully');
      };

      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.type) {
            this.dispatchLocal(payload.type, payload.data);
            // Share to other tabs via BroadcastChannel
            try {
              this.broadcast?.postMessage(payload);
            } catch {}
          }
        } catch {
          // Non-JSON or heartbeat
        }
      };

      this.eventSource.onerror = () => {
        this.cleanup();
        this.scheduleReconnect();
      };
    } catch {
      this.cleanup();
      this.scheduleReconnect();
    }
  }

  private cleanup() {
    if (this.eventSource) {
      try {
        this.eventSource.close();
      } catch {}
      this.eventSource = null;
    }
    this.isConnecting = false;
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.initConnection();
    }, delay);
  }

  private dispatchLocal(type: string, data: any) {
    const handlers = this.listeners.get(type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (err) {
          console.error(`[SSE] Handler error for ${type}:`, err);
        }
      });
    }

    const wildcardHandlers = this.listeners.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler({ type, data });
        } catch (err) {
          console.error(`[SSE] Wildcard handler error for ${type}:`, err);
        }
      });
    }
  }

  /**
   * Subscribe to specific SSE event types (e.g. 'users_changed', 'bookings_changed', 'bank_data_synced', 'activity_logged')
   */
  public subscribe(eventType: string, handler: SSEHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    // Ensure connection is active
    if (!this.eventSource && typeof window !== 'undefined') {
      this.initConnection();
    }

    return () => {
      const handlers = this.listeners.get(eventType);
      if (handlers) {
        handlers.delete(handler);
        if (handlers.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Broadcast an event to other tabs & listeners manually
   */
  public notifyLocal(type: string, data?: any) {
    this.dispatchLocal(type, data);
    try {
      this.broadcast?.postMessage({ type, data, timestamp: Date.now() });
    } catch {}
  }
}

export const sseClient = new SSEClient();

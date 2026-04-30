declare global {
  interface Window {
    aplus_queue: Array<{ action: string; arguments: unknown[] }>;
  }
}

export function trackEvent(eventName: string, params?: Record<string, string | number>) {
  window.aplus_queue = window.aplus_queue || [];
  window.aplus_queue.push({
    action: 'aplus.record',
    arguments: [eventName, 'CLK', params || {}]
  });
}

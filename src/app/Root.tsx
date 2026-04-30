import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { trackEvent } from "./utils/track";

export default function Root() {
  const location = useLocation();

  useEffect(() => {
    window.aplus_queue = window.aplus_queue || [];
    window.aplus_queue.push({
      action: 'aplus.sendPV',
      arguments: [{ is_auto: false }, { page_url: location.pathname }]
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
    </div>
  );
}

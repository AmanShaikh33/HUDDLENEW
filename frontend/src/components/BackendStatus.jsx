import { useEffect, useState } from "react";

export default function BackendStatus({ children }) {
  const [backendReady, setBackendReady] = useState(false);

  const backendURL = import.meta.env.DEV
    ? "http://localhost:7000/health"
    : "https://huddlenew-1.onrender.com/health";

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(backendURL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          setBackendReady(true);
          return;
        }
      } catch (err) {}

      setTimeout(checkBackend, 3000);
    };

    checkBackend();
  }, []);

  if (!backendReady) {
    return (
      <div className="fixed inset-0 bg-white z-[99999] flex items-center justify-center flex-col gap-3 overflow-hidden">
        <div className="animate-spin h-12 w-12 border-4 border-gray-400 border-t-purple-600 rounded-full"></div>
        <p className="text-lg font-semibold">
          Backend is starting…  
          <br />
          Please wait 20–30 seconds.
        </p>
      </div>
    );
  }

  return children;
}

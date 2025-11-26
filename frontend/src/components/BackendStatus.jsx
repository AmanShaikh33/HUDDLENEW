import { useEffect, useState } from "react";

export default function BackendStatus() {
  const [backendReady, setBackendReady] = useState(false);

  const backendURL = "https://huddlenew-1.onrender.com/health";

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(backendURL, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          setBackendReady(true);
          return;
        }
      } catch (err) {
        // Backend not ready (sleeping), retry later
      }

      
      setTimeout(checkBackend, 3000);
    };

    checkBackend();
  }, []);

  if (!backendReady) {
    return (
      <div className="flex items-center justify-center h-screen flex-col text-center gap-2">
        <div className="animate-spin h-10 w-10 border-4 border-gray-400 border-t-black rounded-full"></div>
        <p className="text-lg font-semibold">
          Backend is starting…  
          <br />
          Please wait 20–30 seconds.
          render time leta he bhai wait kro
        </p>
      </div>
    );
  }

  return null;
}

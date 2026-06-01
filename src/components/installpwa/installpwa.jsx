import { useEffect, useState } from "react";
import "./installpwa.css";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);



  useEffect(() => {
const handler = (e) => {
  e.preventDefault();
  console.log("Install prompt ready");
  setDeferredPrompt(e);
};
}, []);


  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      console.log("App installed");
    }

    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // ❌ Don't render anything if not installable
  if (!isInstallable) return null;

  return (
    <button className="install-btn" onClick={handleInstall}>
      📲 Install App
    </button>
  );
}
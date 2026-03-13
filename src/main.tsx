import { createRoot } from "react-dom/client";
import { useState, useCallback } from "react";
import App from "./App.tsx";
import { SplashScreen } from "./components/SplashScreen.tsx";
import "./index.css";

function Root() {
  const [showSplash, setShowSplash] = useState(true);
  const handleComplete = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleComplete} />}
      <App />
    </>
  );
}

createRoot(document.getElementById("root")!).render(<Root />);

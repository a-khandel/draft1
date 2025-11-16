import { useState, useCallback } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SecondPage from "./SecondPage";
import LoadingScreen from "./LoadingScreen";
import LandingPage from "./LandingPage";
import { getXRBaseUrl } from "./xrEnv";

type AppState = "loading" | "landing" | "main";

function App() {
  const [appState, setAppState] = useState<AppState>("loading");
  const baseUrl = getXRBaseUrl();

  const handleLoadingComplete = useCallback(() => {
    setAppState("landing");
  }, []);

  return (
    <Router basename={baseUrl}>
      <Routes>
        <Route path="/second-page" element={<SecondPage />} />
        <Route
          path="/"
          element={
            <>
              {appState === "loading" && (
                <LoadingScreen onLoadingComplete={handleLoadingComplete} />
              )}
              {appState === "landing" && <LandingPage />}
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

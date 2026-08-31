import { useEffect, useRef, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { LoadingOverlay } from "../components/loading/LoadingAnimation";
import { LandingPage, MainPage } from "../pages";

const getRouteLabel = (pathname: string) => {
  if (pathname === "/main") return "Loading editor";
  return "Loading landing page";
};

const RouterContent = () => {
  const location = useLocation();
  const [showLoading, setShowLoading] = useState(true);
  const [renderLocation, setRenderLocation] = useState(location);
  const [loadingLabel, setLoadingLabel] = useState(getRouteLabel(location.pathname));
  const pendingLocation = useRef(location);

  useEffect(() => {
    if (location.key === renderLocation.key) return;

    pendingLocation.current = location;
    setLoadingLabel(getRouteLabel(location.pathname));
    setShowLoading(true);
  }, [location, renderLocation.key]);

  const handleLoadingComplete = () => {
    setRenderLocation(pendingLocation.current);
    setShowLoading(false);
  };

  return (
    <>
      <LoadingOverlay
        show={showLoading}
        label={loadingLabel}
        onComplete={handleLoadingComplete}
      />
      <Routes location={renderLocation}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </>
  );
};

const Routers = () => {
  return (
    <Router>
      <RouterContent />
    </Router>
  );
};

export default Routers;

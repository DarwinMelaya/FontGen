import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LandingPage, MainPage } from "../pages";

const Routers = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/main" element={<MainPage />} />
      </Routes>
    </Router>
  );
};

export default Routers;

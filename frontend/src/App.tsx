import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";
import Routers from "./routers/Routers";

const App = () => {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <Routers />
      </MotionConfig>
    </ThemeProvider>
  );
};

export default App;

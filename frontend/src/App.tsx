import { ThemeProvider } from "./context/ThemeContext";
import Routers from "./routers/Routers";

const App = () => {
  return (
    <ThemeProvider>
      <Routers />
    </ThemeProvider>
  );
};

export default App;

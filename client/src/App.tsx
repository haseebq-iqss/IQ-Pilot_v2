import { useState } from "react";
import UserDataContext from "./context/UserDataContext";
import MainRouter from "./router/MainRouter";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PaletteMode, ThemeProvider } from "@mui/material";
import ProjectTheme from "./style_extentions/ProjectTheme";
import EmployeeTypes from "./types/EmployeeTypes";
import ThemeModeContext from "./context/ThemeModeContext";

function App() {
  const [userData, setUserData] = useState<EmployeeTypes>();
  const [themeMode, setThemeMode] = useState<PaletteMode>("light");

  return (
    <ThemeProvider theme={ProjectTheme(themeMode)}>
      <ThemeModeContext.Provider value={{ themeMode, setThemeMode }}>
        <UserDataContext.Provider value={{ userData, setUserData }}>
          <MainRouter />
          <ReactQueryDevtools />
        </UserDataContext.Provider>
      </ThemeModeContext.Provider>
    </ThemeProvider>
  );
}

export default App;

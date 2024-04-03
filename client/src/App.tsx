import { useState } from "react";
import UserDataContext from "./context/UserDataContext";
import MainRouter from "./router/MainRouter";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PaletteMode, ThemeProvider } from "@mui/material";
import ProjectTheme from "./style_extentions/ProjectTheme";
import EmployeeTypes from "./types/EmployeeTypes";
import ThemeModeContext from "./context/ThemeModeContext";
import SnackbarContext from "./context/SnackbarContext";
import { SnackbarTypes } from "./types/SnackbarTypes";
import GlobalSnackbar from "./components/ui/Snackbar";

function App() {
  const [userData, setUserData] = useState<EmployeeTypes>();
  const [themeMode, setThemeMode] = useState<PaletteMode>("light");
  const [openSnack, setOpenSnack] = useState<SnackbarTypes>({
    open: false,
    message: "no message",
    severity: "success",
  });

  return (
    <ThemeProvider theme={ProjectTheme(themeMode)}>
      <SnackbarContext.Provider value={{ openSnack, setOpenSnack }}>
      <GlobalSnackbar value={{ openSnack, setOpenSnack }} />
        <ThemeModeContext.Provider value={{ themeMode, setThemeMode }}>
          <UserDataContext.Provider value={{ userData, setUserData }}>
            <MainRouter />
            <ReactQueryDevtools />
          </UserDataContext.Provider>
        </ThemeModeContext.Provider>
      </SnackbarContext.Provider>
    </ThemeProvider>
  );
}

export default App;

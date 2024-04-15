import { useEffect, useState } from "react";
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
import useAxios from "./api/useAxios";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<EmployeeTypes>();
  const [themeMode, setThemeMode] = useState<PaletteMode>("light");
  const [openSnack, setOpenSnack] = useState<SnackbarTypes>({
    open: false,
    message: "no message",
    severity: "success",
  });

  const isBaseRoute: boolean =
    !location.pathname.includes("admin") &&
    !location.pathname.includes("employee") &&
    !location.pathname.includes("driver");

  useEffect(() => {
    if (!userData) {
      useAxios
        .post("auth/autologin", {})
        .then((res) => {
          let user: EmployeeTypes = res.data.data;
          setUserData(user);
          // if (res.data.currentUser?.role) {
          isBaseRoute && navigate(`/${res.data.currentUser?.role}`);
          // }
        })
        .catch(() => navigate("/"));
    }
  }, []);

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

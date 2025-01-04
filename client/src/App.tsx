import { useEffect, useRef, useState } from "react";
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
import SelectedEmpsContext from "./context/SelectedEmpsContext";
import { registerServiceWorker } from "./serviceWorkerRegistration";
import DefaultSnackPositionContext from "./context/DefaultSnackPositionContext";
import useLocalStorage from "./hooks/useLocalStorage";
import DefaultCabViewMode from "./context/DefaultCabViewModeContext";
import DefaultMapStyleContext from "./context/DefaultMapStyleContext";

declare global {
  interface Window {
    navigateApp: (path: string, state?: Record<string, any>) => void;
    openSnackbar: (options: {
      open: boolean;
      message: string;
      severity?: "success" | "error" | "info" | "warning";
    }) => void;
  }
}

function App() {
  registerServiceWorker();

  const { getItem } = useLocalStorage();

  const [userData, setUserData] = useState<EmployeeTypes>();
  const [themeMode, setThemeMode] = useState<PaletteMode>("dark");
  const [openSnack, setOpenSnack] = useState<SnackbarTypes>({
    open: false,
    message: "no message",
    severity: "success",
  });
  const [selectedEmps, setSelectedEmps] = useState<EmployeeTypes[]>([]);
  const [defaultSnackbarPosition, setDefaultSnackbarPosition] = useState(
    () => getItem("defaultSnackbarPosition") || "top center"
  );
  const [defaultCabView, setDefaultCabView] = useState(
    () => getItem("defaultCabView") || "expanded"
  );
  const [defaultMapStyle, setDefaultMapStyle] = useState(
    () => getItem("defaultMapStyle") || "vanilla"
  );

  const isBaseRoute: boolean =
    !location.pathname.includes("admin") &&
    !location.pathname.includes("employee") &&
    !location.pathname.includes("driver");

  // Expose the navigate function to a global reference
  const navigate = useNavigate();
  const navigateRef = useRef<typeof navigate | null>(navigate);
  useEffect(() => {
    navigateRef.current = navigate;
    window.navigateApp = navigate;
    window.openSnackbar = ({ message, severity = "success" }) => {
      setOpenSnack({ open: true, message, severity });
    };
  }, []);

  useEffect(() => {
    if (!userData) {
      useAxios
        .post("auth/autologin", {})
        .then((res) => {
          let user: EmployeeTypes = res.data.data;
          // console.log(user)
          const defaultAdminLogin = getItem("defaultAdminLogin") || "admin";
          if (user.role == "admin") {
            user.role = defaultAdminLogin as any;
            setUserData(user);
            // console.log(defaultAdminLogin)
            isBaseRoute && navigate(`/${defaultAdminLogin}`);
          } else {
            setUserData(user);
            isBaseRoute && navigate(`/${user.role}`);
          }
        })
        .catch(() => navigate("/"));
    }
  }, []);

  return (
    <ThemeProvider theme={ProjectTheme(themeMode)}>
      <SelectedEmpsContext.Provider value={{ selectedEmps, setSelectedEmps }}>
        <DefaultSnackPositionContext.Provider
          value={{ defaultSnackbarPosition, setDefaultSnackbarPosition }}
        >
          <SnackbarContext.Provider value={{ openSnack, setOpenSnack }}>
            <GlobalSnackbar value={{ openSnack, setOpenSnack }} />
            <ThemeModeContext.Provider value={{ themeMode, setThemeMode }}>
              <UserDataContext.Provider value={{ userData, setUserData }}>
                <DefaultCabViewMode.Provider
                  value={{ defaultCabView, setDefaultCabView }}
                >
                  <DefaultMapStyleContext.Provider
                    value={{ defaultMapStyle, setDefaultMapStyle }}
                  >
                    <MainRouter />
                  </DefaultMapStyleContext.Provider>
                </DefaultCabViewMode.Provider>
                <ReactQueryDevtools />
              </UserDataContext.Provider>
            </ThemeModeContext.Provider>
          </SnackbarContext.Provider>
        </DefaultSnackPositionContext.Provider>
      </SelectedEmpsContext.Provider>
    </ThemeProvider>
  );
}

export default App;

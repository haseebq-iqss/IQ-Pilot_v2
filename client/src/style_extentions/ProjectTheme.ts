import { createTheme, PaletteMode } from "@mui/material";

const ProjectTheme = (themeMode: PaletteMode) =>
  createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: "#2997FC",
      },
      secondary: {
        main: "#9329FC",
      },
      text: {
        primary: "#212A3B",
      },
    },
    typography: {
      fontFamily: "Inter",
    },
    components: {
      MuiTypography: {
        styleOverrides: {
          root: {
            // letterSpacing: "0.5px",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            // fontWeight: 600,
            textTransform: "none",
            // letterSpacing:"0.5px"
          },
        },
      },
    },
  });

export default ProjectTheme;

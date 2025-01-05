import { Alert, Box, LinearProgress, Snackbar } from "@mui/material";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { SnackbarTypes } from "../../types/SnackbarTypes";
import DefaultSnackPositionContext from "../../context/DefaultSnackPositionContext";
import { ColFlex } from "../../style_extentions/Flex";

interface SnackbarPropTypes {
  value: {
    openSnack: SnackbarTypes;
    setOpenSnack: Dispatch<SetStateAction<SnackbarTypes>>;
  };
}

const GlobalSnackbar = ({
  value: { openSnack, setOpenSnack },
}: SnackbarPropTypes) => {
  const { defaultSnackbarPosition }: any = useContext(
    DefaultSnackPositionContext
  );

  const [snackPostion, setSnackPostion] = useState<string>(
    defaultSnackbarPosition || "top center"
  );

  useEffect(() => {
    setSnackPostion(defaultSnackbarPosition);
  }, [defaultSnackbarPosition]);

  const isFromAI =
    openSnack?.message.includes("Processing") ||
    openSnack?.message.toLowerCase().includes("pilot");

  const LoadingIcon = () => {
    return (
      <Box
        className={"size-change-infinite"}
        sx={{
          ...ColFlex,
          width: "100%",
          height: "100%",
          ml: "15%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* <CircularProgress color="inherit" size={25} sx={{zIndex:99}} /> */}
        <LinearProgress
          color="inherit"
          sx={{ width: "50px", height: "10px" }}
        />
      </Box>
    );
  };

  return (
    <Snackbar
      sx={{ borderRadius: "100px" }}
      open={openSnack.open}
      anchorOrigin={{
        vertical: snackPostion?.split(" ")[0] as any,
        horizontal: snackPostion?.split(" ")[1] as any,
      }}
      autoHideDuration={isFromAI ? 2500 : 4000}
      onClick={() =>
        setOpenSnack({
          open: false,
          message: "",
          severity: "success",
        })
      }
      onClose={() =>
        setOpenSnack({
          open: !openSnack.open,
          message: openSnack.message,
          severity: openSnack.severity,
        })
      }
    >
      <Alert
        sx={{
          ...ColFlex,
          color: "white",
          overflow: "hidden",
          alignItems: "center",
          justifyContent: "center",
          ...(isFromAI && {
            background: "linear-gradient(90deg, #FF4500, #9329FC)", // Gradient for AI messages
          }),
        }}
        severity={openSnack.severity || "info"}
        icon={isFromAI ? <LoadingIcon /> : ""}
        variant="filled"
      >
        {openSnack.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;

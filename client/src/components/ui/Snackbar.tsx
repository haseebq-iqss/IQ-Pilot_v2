import { Alert, Snackbar } from "@mui/material";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { SnackbarTypes } from "../../types/SnackbarTypes";
import DefaultSnackPositionContext from "../../context/DefaultSnackPositionContext";

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

  return (
    <Snackbar
      sx={{ borderRadius: "100px" }}
      open={openSnack.open}
      anchorOrigin={{
        vertical: snackPostion?.split(" ")[0] as any,
        horizontal: snackPostion?.split(" ")[1] as any,
      }}
      autoHideDuration={4000}
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
        sx={{ color: "white" }}
        severity={openSnack.severity || "info"}
        variant="filled"
      >
        {openSnack.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;

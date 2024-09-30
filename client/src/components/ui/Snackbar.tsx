import { Alert, Snackbar } from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import { SnackbarTypes } from "../../types/SnackbarTypes";

interface SnackbarPropTypes {
  value: {
    openSnack: SnackbarTypes;
    setOpenSnack: Dispatch<SetStateAction<SnackbarTypes>>;
  };
}

const GlobalSnackbar = ({
  value: { openSnack, setOpenSnack },
}: SnackbarPropTypes) => {
  return (
    <Snackbar
    sx={{borderRadius:"100px"}}
      open={openSnack.open}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
      <Alert sx={{color: "white"}} severity={openSnack.severity || "info"} variant="filled">
        {openSnack.message}
      </Alert>
    </Snackbar>
  );
};

export default GlobalSnackbar;
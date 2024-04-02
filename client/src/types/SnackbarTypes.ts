export type SnackbarTypes = {
    open: boolean;
    message: string;
    severity: "warning" | "error" | "success" | "info";
}

export type SnackBarContextTypes = {
    openSnack: SnackbarTypes
    setOpenSnack: (value: SnackbarTypes) => void;
} 
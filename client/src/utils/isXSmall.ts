import { useMediaQuery, useTheme } from "@mui/material";

export default function isXSmall() {
  const themeInstance = useTheme();
  const isXS: boolean = useMediaQuery(themeInstance.breakpoints.only("xs"));
  const isSM: boolean = useMediaQuery(themeInstance.breakpoints.only("sm"));
  const isMD: boolean = useMediaQuery(themeInstance.breakpoints.only("md"));
  return { isXS, isSM, isMD };
}
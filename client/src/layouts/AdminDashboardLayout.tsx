import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Appbar from "../components/ui/Appbar";
import Sidebar from "../components/ui/Sidebar";
import { ColFlex, RowFlex } from "../style_extentions/Flex";
import isXSmall from "../utils/isXSmall";

function AdminDashboardLayout() {

  const {isXS, isSM,isMD} = isXSmall()

  return (
    <Box
      sx={{
        ...RowFlex,
        width: "100%",
        height: "100vh",
        alignItems: "flex",
        justifyContent: isXS || isSM || isMD ? "center"  : "flex-start",
        p: "15px",
        gap: "15px",
        backgroundColor: "#1E375B",
      }}
    >
      {/* SIDEBAR */}
      <Sidebar />
      <Box
        sx={{
          ...ColFlex,
          justifyContent: "flex-start",
          width: isSM || isMD ? "90%" :"80%",
          height: "100%",
          gap: "15px",
          // p:"15px"
        }}
      >
        {/* APPBAR */}
        <Appbar />
        <Outlet />
      </Box>
    </Box>
  );
}

export default AdminDashboardLayout;

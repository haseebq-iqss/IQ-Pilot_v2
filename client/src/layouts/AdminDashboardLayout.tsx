import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Appbar from "../components/ui/Appbar";
import Sidebar from "../components/ui/Sidebar";
import { ColFlex, RowFlex } from "../style_extentions/Flex";

function AdminDashboardLayout() {
  return (
    <Box
      sx={{
        ...RowFlex,
        width: "100%",
        height: "100vh",
        alignItems: "flex-start",
        justifyContent: "flex-start",
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
          width: "80%",
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

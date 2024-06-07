import {
  AccessTime,
  DeleteForever,
  EditLocation,
  MoreHoriz,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useContext, useState } from "react";
import PageContainer from "../../components/ui/PageContainer";
import { RowFlex } from "../../style_extentions/Flex";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import EmployeeTypes from "../../types/EmployeeTypes";
import Cabtypes from "../../types/CabTypes";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat";
import FormatDateString from "../../utils/DateFormatter";
import { useNavigate } from "react-router-dom";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import SnackbarContext from "../../context/SnackbarContext";

// type routeCacheTypes = {
//   nonActiveroutes: [RouteTypes];
// };

function ScheduledRoutes() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const { data: routes, refetch } = useQuery({
    queryKey: ["all-routes"],
    queryFn: async () => {
      const response = await useAxios.get("routes");
      return response?.data?.data;
    },
  });

  const handlerDeleteRoute = async (route_id: string) => {
    try {
      await useAxios.delete(`/routes/${route_id}`);
      handleMenuClose();
      setOpenSnack({
        open: true,
        message: "Route was deleted!",
        severity: "info",
      });
      refetch();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  return (
    <PageContainer
      headerText={`Scheduled Routes (${routes?.length || 0})`}
      subHeadingText="All of your scheduled routes are here."
    >
      <Box
        sx={{
          width: "100%",
          height: "50vh",
        }}
      >
        <TableContainer sx={{}}>
          <Table sx={{ minWidth: 650 }} aria-label="routes table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Shift time</TableCell>
                <TableCell align="left">Cab</TableCell>
                <TableCell align="left">Driver</TableCell>
                <TableCell align="center">Pickup/Drop</TableCell>
                <TableCell align="center">Assigned Date</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {routes?.length &&
                routes?.map((route: any, index: number) => (
                  <TableRow
                    key={route._id}
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          gap: "10px",
                          fontWeight: 600,
                        }}
                      >
                        <AccessTime />
                        {ConvertShiftTimeTo12HrFormat(
                          route?.currentShift as string,
                          route?.typeOfRoute
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="left">
                      {routes[index]?.cab?.cabNumber}
                    </TableCell>
                    <TableCell align="center">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-start",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {((route?.cab as Cabtypes)?.cabDriver as EmployeeTypes)
                          ?.fname +
                          " " +
                          ((route?.cab as Cabtypes)?.cabDriver as EmployeeTypes)
                            ?.lname}{" "}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      {(route.typeOfRoute?.charAt(0).toUpperCase() as string) +
                        route.typeOfRoute?.slice(1, 99)}
                    </TableCell>
                    <TableCell align="center">
                      {/* {route.totalDistance || "Not Calculated"} */}
                      {FormatDateString(route.createdAt)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color:
                          route.routeStatus === "completed"
                            ? "success.main"
                            : route.routeStatus === "inProgress"
                            ? "primary.main"
                            : "inherit",
                        fontWeight: 600,
                      }}
                      align="center"
                    >
                      {route.routeStatus === "notStarted"
                        ? "Not Started"
                        : route.routeStatus === "inProgress"
                        ? "In Progress"
                        : "Completed"}
                    </TableCell>
                    <TableCell align="center">
                      <MoreHoriz
                        sx={{ cursor: "pointer" }}
                        onClick={(e: any) => handleMenuOpen(e, index)}
                      />
                      <Menu
                        key={route?._id}
                        elevation={1}
                        anchorEl={anchorEl}
                        open={menuIndex === index}
                        onClose={handleMenuClose}
                        MenuListProps={{
                          "aria-labelledby": "basic-button",
                        }}
                      >
                        <MenuItem
                          sx={{
                            ...RowFlex,
                            color: "info.main",
                            fontWeight: 600,
                            justifyContent: "flex-start",
                            gap: "10px",
                          }}
                          onClick={() =>
                            navigate(`/admin/viewRoute/${route?._id}`, {
                              state: route,
                            })
                          }
                        >
                          <Visibility sx={{}} />
                          View Route
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          sx={{
                            ...RowFlex,
                            color: "warning.main",
                            fontWeight: 600,
                            justifyContent: "flex-start",
                            gap: "10px",
                          }}
                        >
                          <EditLocation sx={{}} />
                          Edit Route
                        </MenuItem>
                        <Divider />
                        <MenuItem
                          sx={{
                            ...RowFlex,
                            color: "error.main",
                            fontWeight: 600,
                            justifyContent: "flex-start",
                            gap: "10px",
                          }}
                          onClick={() => handlerDeleteRoute(route?._id)}
                        >
                          <DeleteForever sx={{}} />
                          Delete Route
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageContainer>
  );
}

export default ScheduledRoutes;

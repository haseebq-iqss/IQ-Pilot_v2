import {
  AccessTime,
  Commute,
  DeleteForever,
  DepartureBoard,
  EditLocation,
  EmojiTransportation,
  MoreHoriz,
  Visibility,
} from "@mui/icons-material";
import {
  Box,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import PageContainer from "../../components/ui/PageContainer";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import EmployeeTypes from "../../types/EmployeeTypes";
import Cabtypes from "../../types/CabTypes";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat";
import { useNavigate } from "react-router-dom";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import SnackbarContext from "../../context/SnackbarContext";
import formatDateString from "../../utils/DateFormatter";
import RouteTypes from "../../types/RouteTypes";
import IsToday from "../../utils/IsToday";
import IsFutureDate from "../../utils/IsFutureDate";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

// type routeCacheTypes = {
//   nonActiveroutes: [RouteTypes];
// };

function ScheduledRoutes() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [selectedRoute, setSelectedRoute] = useState<string>("");

  const [tableDataView, settableDataView] = useState<
    "Active" | "Scheduled" | "Completed" | "All"
  >("Active");

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
      return response?.data?.data as [RouteTypes];
    },
  });

  const [selectedRoutes, setSelectedRoutes] = useState<Array<RouteTypes>>();

  const ExtractSelectedRouteTypes = (currentView: any) => {
    // console.log(tableDataView)
    if (currentView === "Active") {
      const filtered = routes?.filter((route: RouteTypes) => {
        return IsToday(route.activeOnDate as Date) === true;
      });
      setSelectedRoutes(filtered);
    } else if (currentView === "Scheduled") {
      const filtered = routes?.filter((route: RouteTypes) => {
        return IsFutureDate(route.activeOnDate as Date) === true;
      });
      setSelectedRoutes(filtered);
    } else if (currentView === "Completed") {
      const filtered = routes?.filter((route: RouteTypes) => {
        return route.routeStatus === "completed";
      });
      setSelectedRoutes(filtered);
    } else {
      setSelectedRoutes(routes);
    }
  };

  useEffect(() => {
    ExtractSelectedRouteTypes(tableDataView);
  }, [routes]);

  const handleOpenDeleteModal = (routeId: string) => {
    setSelectedRoute(routeId);
    setOpenConfirmModal(true);
    setMenuIndex(null);
  };

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

  const handleDeleteRoute = () => {
    handlerDeleteRoute(selectedRoute);
    console.log("route deleted");
    setOpenConfirmModal(false);
  };

  const HandleChangeTabletableDataView = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: any
  ) => {
    if (newAlignment != null) {
      settableDataView(newAlignment);
      ExtractSelectedRouteTypes(newAlignment);
      // console.log(newAlignment, tableDataView)
    }
  };

  return (
    <PageContainer
      headerText={`All Routes (${routes?.length || 0})`}
      subHeadingText="All of your scheduled routes are here."
    >
      <Box
        sx={{
          width: "100%",
          height: "50vh",
          color: "text.primary",
        }}
      >
        <Box
          sx={{ ...ColFlex, width: "100%", alignItems: "flex-start", mt: 2.5 }}
        >
          {/* SELECTION HEADER */}
          <Box
            sx={{
              ...RowFlex,
              flexDirection: {xs:"column",sm:"column",md:"column",lg:"row"},
              width: "100%",
              alignItems: {xs:"flex-start",sm:"flex-start",md:"flex-start",lg:"center"},
              justifyContent: "space-between",
              mb: 2,
              gap:{xs:2.5,sm:2.5,md:2.5,lg: 0}
            }}
          >
            <Box sx={{ ...RowFlex, gap: 2 }}>
              {tableDataView == "Active" ? (
                <>
                  <Commute sx={{ fontSize: "2.5rem" }} />{" "}
                  <Typography sx={{ fontWeight: 600 }} variant="h5">
                    {`Viewing Today's Routes (${selectedRoutes?.length || 0})`}
                  </Typography>
                </>
              ) : tableDataView == "Scheduled" ? (
                <>
                  <DepartureBoard sx={{ fontSize: "2rem" }} />
                  <Typography sx={{ fontWeight: 600 }} variant="h5">
                    {`Viewing Scheduled Routes (${selectedRoutes?.length})`}
                  </Typography>
                </>
              ) : tableDataView == "Completed" ? (
                <>
                  <EmojiTransportation sx={{ fontSize: "2.5rem" }} />
                  <Typography sx={{ fontWeight: 600 }} variant="h5">
                    {`Viewing Completed Routes (${selectedRoutes?.length})`}
                  </Typography>
                </>
              ) : (
                <>
                  <EmojiTransportation sx={{ fontSize: "2.5rem" }} />
                  <Typography sx={{ fontWeight: 600 }} variant="h5">
                    {`Viewing All Routes (${selectedRoutes?.length})`}
                  </Typography>
                </>
              )}
            </Box>

            <ToggleButtonGroup
              size="small"
              color="primary"
              value={tableDataView}
              exclusive
              onChange={HandleChangeTabletableDataView}
              aria-label="View"
            >
              <ToggleButton sx={{ px: 2.5 }} value="Active">
                Active
              </ToggleButton>
              <ToggleButton sx={{ px: 2.5 }} value="Scheduled">
                Scheduled
              </ToggleButton>
              <ToggleButton sx={{ px: 2.5 }} value="Completed">
                Completed
              </ToggleButton>
              <ToggleButton sx={{ px: 2.5 }} value="All">
                All Routes
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {/* ACTIVE ROUTES */}
        <TableContainer sx={{}}>
          <Table sx={{ minWidth: 650 }} aria-label="routes table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Shift time</TableCell>
                <TableCell align="left">Cab</TableCell>
                <TableCell align="left">Driver</TableCell>
                <TableCell align="center">Pickup/Drop</TableCell>
                <TableCell align="center">Office</TableCell>
                <TableCell align="center">Date</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedRoutes?.length ? (
                selectedRoutes?.map((route: any, index: number) => (
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
                          route?.currentShift as string
                        )}
                      </Box>
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: 600, color: "primary.dark" }}
                      align="left"
                    >
                      {(selectedRoutes[index]?.cab as Cabtypes)?.cabNumber}
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
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {route.workLocation}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">
                      {/* {route.totalDistance || "Not Calculated"} */}
                      {/* {DaysTillActive(route.createdAt, route.daysRouteIsActive)} */}
                      {formatDateString(route?.activeOnDate)}
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
                        <MenuItem
                          sx={{
                            ...RowFlex,
                            color: "error.main",
                            fontWeight: 600,
                            justifyContent: "flex-start",
                            gap: "10px",
                          }}
                          onClick={() => handleOpenDeleteModal(route?._id)}
                        >
                          <DeleteForever sx={{}} />
                          Delete Route
                        </MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell sx={{ border: 0 }}>
                    <Typography variant="h6" sx={{ p: 1, fontWeight: 500 }}>
                      No {tableDataView} Routes Found 🤷‍♂️
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <ConfirmationModal
        headerText="Confirm Your Action?"
        subHeaderText="Deleting this route is permanent and cannot be undone. Please confirm if you wish to continue."
        openConfirmModal={openConfirmModal}
        setOpenConfirmModal={setOpenConfirmModal}
        triggerFunction={handleDeleteRoute}
      />
    </PageContainer>
  );
}

export default ScheduledRoutes;

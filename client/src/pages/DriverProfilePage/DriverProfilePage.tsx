import {
  Typography,
  List,
  Divider,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  Menu,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import { useNavigate, useParams } from "react-router-dom";
import baseURL from "../../utils/baseURL";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import {
  AccessTime,
  AirportShuttle,
  Call,
  Close,
  DeleteForever,
  DoneAll,
  EditLocation,
  MoreHoriz,
  Visibility,
} from "@mui/icons-material";
import Groups2Icon from "@mui/icons-material/Groups2";
import TagIcon from "@mui/icons-material/Tag";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EmployeeTypes from "../../types/EmployeeTypes";
import { useEffect, useState } from "react";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat";
import formatDateString from "../../utils/DateFormatter";

const DriverProfile = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [allDriverRoutes, setAllDriverRoutes] = useState<any>();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  const { data: driverDetails } = useQuery({
    queryKey: ["driver-details"],
    queryFn: async () => {
      const response = await useAxios.get(`/cabs/${id}`);
      return response?.data?.data;
    },
  });

  const { data: driverRoutes } = useQuery({
    queryKey: ["driver-routes"],
    queryFn: async () => {
      const response = await useAxios.get(
        `routes/driverRoutesMonth/${
          (driverDetails?.cabDriver as EmployeeTypes)?._id
        }`
      );
      const { dropArr, pickArr }: any = response?.data?.data;
      setAllDriverRoutes([...dropArr, ...pickArr]);

      return [...dropArr, ...pickArr];
    },
    enabled: !!driverDetails,
  });

  const [totalDistance, setTotalDistance] = useState<number>(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState<number>(0);

  useEffect(() => {
    if (driverRoutes) {
      // Compute the totals
      const totalDistance = driverRoutes.reduce((acc, route) => {
        return acc + (route.totalDistance || 0);
      }, 0);

      const totalTimeSpent = driverRoutes.reduce((acc, route) => {
        return acc + (route.estimatedTime || 0);
      }, 0);

      // Set the totals
      setTotalDistance(totalDistance);
      setTotalTimeSpent(totalTimeSpent);
    }
  }, [driverRoutes]);

  // console.log(totalDistance);

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

  console.log(driverRoutes);

  return (
    <Box sx={{ maxWidth: "100%", p: 2.5 }}>
      <Box sx={{}}>
        <Box
          sx={{
            bgcolor: "primary.main",
            borderRadius: 2,
            ...RowFlex,
            gap: 5,
            p: 2.5,
            justifyContent: "start",
          }}
        >
          <img
            alt={driverDetails?.cabDriver?.fname}
            src={baseURL + driverDetails?.cabDriver?.profilePicture}
            style={{
              width: "12rem",
              height: "12rem",
              borderRadius: 10,
              objectFit: "cover",
              aspectRatio: "1.5",
            }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: "bold", mb: 2, color: "white" }}
            >
              {driverDetails?.cabDriver?.fname +
                " " +
                driverDetails?.cabDriver?.lname}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                ...RowFlex,
                gap: 5,
                justifyContent: "start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  ...RowFlex,
                  gap: "6px",
                  color: "white",
                }}
              >
                <MailOutlineIcon sx={{ fontSize: "1.5rem" }} />
                <span style={{ fontWeight: 700 }}>Email: </span>
                {driverDetails?.cabDriver?.email}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <Call sx={{ fontSize: "1.5rem" }} />
                <span style={{ fontWeight: 700 }}>Phone Number: </span>
                +91-{driverDetails?.cabDriver?.phone}
              </Typography>
            </Box>
            <Box
              sx={{
                ...RowFlex,
                justifyContent: "start",
                gap: 4,
                alignItems: "flex-start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <TagIcon
                  sx={{
                    fontSize: "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Cab Number: </span>
                {driverDetails?.cabNumber}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <DirectionsCarIcon
                  sx={{
                    fontSize: "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Number Plate: </span>{" "}
                {driverDetails?.numberPlate}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  textTransform: "capitalize",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <FormatColorFillIcon
                  sx={{
                    fontSize: "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Cab Color: </span>
                {driverDetails?.carColor}
              </Typography>
            </Box>
            <Box
              sx={{
                ...RowFlex,
                justifyContent: "start",
                gap: 4,
                alignItems: "flex-start",
              }}
            >
              <Typography sx={{ mb: 1, fontSize: "1.2rem", color: "white" }}>
                <span style={{ fontWeight: 700 }}>Cab Model: </span>{" "}
                {driverDetails?.carModel}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: "1.2rem",
                  color: "white",
                  ...RowFlex,
                  gap: "6px",
                }}
              >
                <Groups2Icon
                  sx={{
                    fontSize: "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Seating Capacity: </span>
                {driverDetails?.seatingCapacity}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            mt: "1.5rem",
            ...RowFlex,
            justifyContent: "space-around",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              ...ColFlex,
              // borderRight: "1px solid lightGray"
            }}
          >
            <span style={{ fontWeight: 500, fontSize: 20 }}>
              Total Amount (INR)
            </span>

            <span style={{ fontSize: 38, fontWeight: 600 }}>
              <span>&#8377;</span> {((totalDistance / 15) * 100).toFixed(0)}
            </span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span style={{ fontWeight: 500, fontSize: 20 }}>
              Kilometers Traveled
            </span>
            <span style={{ fontSize: 38, fontWeight: 600 }}>
              {totalDistance.toFixed(2)}km
            </span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span style={{ fontWeight: 500, fontSize: 20 }}>Total Routes</span>
            <span style={{ fontSize: 38, fontWeight: 600 }}>
              {allDriverRoutes?.length}
            </span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span style={{ fontWeight: 500, fontSize: 20 }}>Time Spent</span>
            <span style={{ fontSize: 38, fontWeight: 600 }}>
              {totalTimeSpent.toFixed(0)}mins
            </span>
          </Typography>
        </Box>
        <Box sx={{ px: 10, bgcolor: "#eeeeee", py: 4, borderRadius: 2 }}>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mt: 2, fontWeight: "bold" }}
          >
            Assigned Routes
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <TableContainer sx={{}}>
            <Table sx={{ minWidth: 650 }} aria-label="routes table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Shift time</TableCell>
                  <TableCell align="center">Pickup/Drop</TableCell>
                  <TableCell align="center">Distance</TableCell>
                  <TableCell align="center">Cost Of Travel</TableCell>
                  <TableCell align="center">Date</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {driverRoutes?.length &&
                  driverRoutes?.map((route: any, index: number) => (
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
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        {(route.typeOfRoute
                          ?.charAt(0)
                          .toUpperCase() as string) +
                          route.typeOfRoute?.slice(1, 99)}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        {route.totalDistance
                          ? route.totalDistance + " Km"
                          : "Not Calculated"}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        {route.totalDistance
                          ? (route.totalDistance / 15) * 100
                          : "Not Calculated"}
                      </TableCell>
                      <TableCell component="th" scope="row">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "10px",
                            fontWeight: 600,
                          }}
                        >
                          <AccessTime />
                          {formatDateString(route?.createdAt)}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        {route?.routeStatus === "completed" ? (
                          <DoneAll />
                        ) : route.routeStatus === "inProgress" ? (
                          <AirportShuttle />
                        ) : (
                          <Close />
                        )}
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
                        </Menu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default DriverProfile;

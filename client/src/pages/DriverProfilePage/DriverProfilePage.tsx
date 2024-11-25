import {
  Typography,
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
import isXSmall from "./../../utils/isXSmall";

const DriverProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isXS } = isXSmall();

  const [allDriverRoutes, setAllDriverRoutes] = useState<any>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  const { data: driverDetails } = useQuery({
    queryKey: [`driver-details ${id}`],
    queryFn: async () => {
      const response = await useAxios.get(`/cabs/getDriverCab/${id}`);
      return response?.data?.data;
    },
  });

  const { data: driverRoutes } = useQuery({
    queryKey: [
      `${(driverDetails?.cabDriver as EmployeeTypes)?.fname} - driver-routes`,
    ],
    queryFn: async () => {
      const response = await useAxios.get(
        `routes/driverRoutesMonth/${
          (driverDetails?.cabDriver as EmployeeTypes)?._id
        }`
      );
      console.log(response);
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
    <Box
      sx={{
        width: "100%",
        p: 2.5,
        backgroundColor: "background.default",
        color: "text.primary",
        height: isXS ? "auto" : "100vh",
      }}
    >
      <Box sx={{}}>
        <Box
          sx={{
            borderRadius: 2,
            ...(isXS ? ColFlex : RowFlex),
            gap: 5,
            p: isXS ? 1 : 2.5,
            justifyContent: "start",
          }}
        >
          <img
            alt={driverDetails?.cabDriver?.fname}
            src={baseURL + driverDetails?.cabDriver?.profilePicture}
            style={{
              width: isXS ? "8rem" : "12rem",
              height: isXS ? "8rem" : "12rem",
              borderRadius: isXS ? 100 : 10,
              objectFit: "cover",
              aspectRatio: "1.5",
            }}
          />
          <Box>
            <Typography
              variant={isXS ? "h6" : "h4"}
              component="h1"
              sx={{
                fontWeight: "bold",
                mb: 2,
                color: "text.primary",
                textAlign: isXS ? "center" : "start",
              }}
            >
              {driverDetails?.cabDriver?.fname +
                " " +
                driverDetails?.cabDriver?.lname}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{
                ...(isXS ? ColFlex : RowFlex),
                gap: isXS ? 1 : 5,
                justifyContent: "start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: isXS ? "1rem" : "1.2rem",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                  color: "text.primary",
                }}
              >
                <MailOutlineIcon
                  sx={{ fontSize: isXS ? "1.2rem" : "1.5rem", fontWeight: 600 }}
                />
                <span style={{ fontWeight: 600 }}>Email: </span>
                {driverDetails?.cabDriver?.email}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: isXS ? "1rem" : "1.2rem",
                  color: "text.primary",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                }}
              >
                <Call sx={{ fontSize: isXS ? "1.2rem" : "1.5rem" }} />
                <span style={{ fontWeight: 700 }}>Phone Number: </span>
                +91-{driverDetails?.cabDriver?.phone}
              </Typography>
            </Box>
            <Box
              sx={{
                ...(isXS ? ColFlex : RowFlex),
                justifyContent: "start",
                gap: isXS ? 1 : 4,
                alignItems: isXS ? "center" : "flex-start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: isXS ? "1rem" : "1.2rem",
                  color: "text.primary",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                }}
              >
                <TagIcon
                  sx={{
                    fontSize: isXS ? "1.2rem" : "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Cab Number: </span>
                {driverDetails?.cabNumber}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: isXS ? "1rem" : "1.2rem",
                  color: "text.primary",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                }}
              >
                <DirectionsCarIcon
                  sx={{
                    fontSize: isXS ? "1.2rem" : "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Number Plate: </span>{" "}
                {driverDetails?.numberPlate}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: isXS ? "1rem" : "1.2rem",
                  textTransform: "capitalize",
                  color: "text.primary",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                }}
              >
                <FormatColorFillIcon
                  sx={{
                    fontSize: isXS ? "1.2rem" : "1.4rem",
                  }}
                />
                <span style={{ fontWeight: 700 }}>Cab Color: </span>
                {driverDetails?.carColor}
              </Typography>
            </Box>
            <Box
              sx={{
                ...(isXS ? ColFlex : RowFlex),
                justifyContent: "start",
                gap: isXS ? 1 : 4,
                alignItems: isXS ? "center" : "flex-start",
              }}
            >
              <Typography
                sx={{
                  mb: 1,
                  fontSize: isXS ? "1rem" : "1.2rem",
                  color: "text.primary",
                }}
              >
                <span style={{ fontWeight: 700 }}>Cab Model: </span>{" "}
                {driverDetails?.carModel}
              </Typography>
              <Typography
                sx={{
                  mb: 1,
                  fontSize: isXS ? "1rem" : "1.2rem",
                  color: "text.primary",
                  ...(isXS ? ColFlex : RowFlex),
                  gap: "6px",
                }}
              >
                <Groups2Icon
                  sx={{
                    fontSize: isXS ? "1.2rem" : "1.4rem",
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
            ...(isXS ? ColFlex : RowFlex),
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Typography
            variant="body1"
            sx={{
              ...ColFlex,
              // borderRight: "1px solid lightGray"
            }}
          >
            <span
              style={{
                fontWeight: 500,
                fontSize: 20,
              }}
            >
              Total Amount (INR)
            </span>

            <span
              style={{
                fontSize: isXS ? 30 : 38,
                fontWeight: 600,
              }}
            >
              <span>&#8377;</span> {((totalDistance / 15) * 100).toFixed(0)}
            </span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span
              style={{
                fontWeight: 500,
                fontSize: 20,
                marginTop: isXS ? 8 : 0,
              }}
            >
              Kilometers Traveled
            </span>
            <span style={{ fontSize: isXS ? 30 : 38, fontWeight: 600 }}>
              {totalDistance.toFixed(2)}km
            </span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span
              style={{ fontWeight: 500, fontSize: 20, marginTop: isXS ? 8 : 0 }}
            >
              Total Routes
            </span>
            <span style={{ fontSize: isXS ? 30 : 38, fontWeight: 600 }}>
              {allDriverRoutes?.length || 0}
            </span>
          </Typography>
          <Typography variant="body1" sx={{ ...ColFlex }}>
            <span
              style={{ fontWeight: 500, fontSize: 20, marginTop: isXS ? 8 : 0 }}
            >
              Time Spent
            </span>
            <span style={{ fontSize: isXS ? 30 : 38, fontWeight: 600 }}>
              {totalTimeSpent.toFixed(0)}mins
            </span>
          </Typography>
        </Box>
        <Box
          sx={{
            px: 10,
            backgroundColor: "background.default",
            color: "text.primary",
            py: 4,
            borderRadius: 2,
            marginTop: isXS ? 1 : 5,
            textAlign: isXS ? "center" : "start",
          }}
        >
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
                            route?.currentShift as string
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
                          ? "₹ " + ((route.totalDistance / 15) * 100).toFixed(0)
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
                          {formatDateString(route?.activeOnDate)}
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

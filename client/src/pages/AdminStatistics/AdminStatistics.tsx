import {
  Avatar,
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
import { ColFlex, RowFlex } from "./../../style_extentions/Flex";
import GetCurrentMonth from "../../utils/GetCurrentMonth";
import GetDaysLeftInCurrentMonth from "../../utils/DaysLeftInMonth";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import { useState } from "react";
import {
  DeleteForever,
  EditLocation,
  GridView,
  MoreHoriz,
  TableRows,
  Visibility,
} from "@mui/icons-material";
import Cabtypes from "../../types/CabTypes";
import baseURL from "../../utils/baseURL";
import EmployeeTypes from "../../types/EmployeeTypes";
import { useNavigate } from "react-router-dom";
import BigNumberFormatter from "../../utils/BigNumberFormatter";

function AdminStatistics() {
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

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

  const { data: allCabs } = useQuery({
    queryKey: ["all-cabs"],
    queryFn: async () => {
      const response = await useAxios.get("/cabs/");
      return response?.data?.data;
    },
  });

  const { data: totalShrinkage } = useQuery({
    queryKey: ["shrinkage-this-month"],
    queryFn: async () => {
      const response = await useAxios.get("attendances/shrinkageMonth");
      return response?.data?.data;
    },
  });

  const { data: totalKilometers } = useQuery({
    queryKey: ["total-distance-for-month"],
    queryFn: async () => {
      const response = await useAxios.get("routes/totalDistanceMonth");
      return response?.data?.data;
    },
  });

  const [dataView, setDataView] = useState<"tiles" | "table">("tiles");

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: any
  ) => {
    setDataView(newAlignment);
  };

  return (
    <Box
      sx={{
        ...ColFlex,
        width: "100%",
        height: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        // backgroundColor: "black",
        // borderRadius: "10px",
        gap: "15px",
      }}
    >
      {/* STATISTICS */}
      <Box
        sx={{
          ...RowFlex,
          width: "100%",
          height: "20%",
          backgroundColor: "background.default",
          borderRadius: "15px",
          justifyContent: "space-between",
        }}
      >
        {/* section-1 */}
        <Box
          sx={{
            ...RowFlex,
            width: "40%",
            height: "20%",
            backgroundColor: "background.default",
            borderRadius: "15px",
            justifyContent: "flex-start",
            marginLeft: "50px",
          }}
        >
          <Box
            sx={{
              ...ColFlex,
              alignItems: "flex-start",
              gap: "5px",
              color: "text.primary",
            }}
          >
            <Typography variant="h4" fontWeight={700}>
              {GetCurrentMonth()}'s Statistics
            </Typography>
            <Typography color={"GrayText"} variant="body1">
              <span style={{ fontWeight: 600 }}>
                ~ {GetDaysLeftInCurrentMonth()} days left in this month
              </span>
            </Typography>
          </Box>
        </Box>
        {/* section-2 */}
        <Box
          sx={{
            ...RowFlex,
            width: "60%",
            height: "20%",
            backgroundColor: "background.default",
            color: "text.primary",
            borderRadius: "15px",
            justifyContent: "space-evenly",
          }}
        >
          <Box
            title={
              "Shrinkage is derived from the no. of absent TMs in comparison to the present no. of TMs in the month."
            }
            sx={{ ...ColFlex, gap: "5px" }}
            // onClick={() => {
            //   navigate("assignedRoutes", { state: allRoutes });
            // }}
          >
            <Typography sx={{ fontWeight: 600 }} variant="h4">
              {totalShrinkage ? totalShrinkage : 0}
              <Box
                component={"span"}
                sx={{ fontSize: "1rem", color: "text.secondary" }}
              >
                %
              </Box>
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                color: "text.secondary",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
              }}
              variant="subtitle2"
            >
              Total Shrinkage
            </Typography>
          </Box>
          <Box
            title={
              "The cost of travel is calculated by multiplying the total kilometers covered by the cab driver with the cab fare per kilometer (10km / 15kmpl * 100) ."
            }
            sx={{ ...ColFlex, gap: "5px" }}
          >
            <Typography sx={{ fontWeight: 600 }} variant="h4">
              {totalKilometers?.length
                ? BigNumberFormatter(
                    ((totalKilometers / 15) * 100).toFixed(
                      0
                    ) as unknown as number
                  )
                : 0}
              <Box
                component={"span"}
                sx={{ fontSize: "1rem", color: "text.secondary" }}
              >
                ₹
              </Box>
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
              }}
              color={"GrayText"}
              variant="subtitle2"
            >
              Cost of Travel (Est.)
            </Typography>
          </Box>
          <Box
            title={
              "The total kilometers covered by all the cab drivers in the month."
            }
            sx={{
              ...ColFlex,
              gap: "5px",
              "& > [title]:hover::after": { color: "red" },
            }}
          >
            <Typography sx={{ fontWeight: 600 }} variant="h4">
              {totalKilometers?.length
                ? BigNumberFormatter(totalKilometers)
                : 0}
              <Box
                component={"span"}
                sx={{ fontSize: "0.95rem", color: "text.secondary" }}
              >
                km
              </Box>
            </Typography>
            <Typography
              sx={{
                width: "100%",
                textAlign: "center",
                fontSize: "0.8rem",
                lineHeight: "15px",
                fontWeight: 600,
              }}
              variant="subtitle2"
              color={"GrayText"}
            >
              Total Kilometers Covered
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* DRIVER STATS */}
      <Box
        sx={{
          ...ColFlex,
          width: "100%",
          height: "80%",
          backgroundColor: "background.default",
          borderRadius: "15px",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          overflow: "hidden",
          p: 2.5,
          gap: 2.5,
        }}
      >
        {/* VIEW OPTIONS */}
        <Box
          sx={{
            ...RowFlex,
            width: "100%",
            alignItems: "flex-end",
            justifyContent: "space-between",
            color: "text.primary",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Active Drivers ({allCabs?.length ? allCabs?.length : 0})
          </Typography>
          <ToggleButtonGroup
            size="small"
            color="primary"
            value={dataView}
            exclusive
            onChange={handleChange}
            aria-label="View"
          >
            <ToggleButton sx={{ px: 2.5 }} value="tiles">
              <GridView /> Tiles
            </ToggleButton>
            <ToggleButton sx={{ px: 2.5 }} value="table">
              <TableRows /> Table
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        {/* DATA VIEW */}
        <Box
          sx={{
            ...RowFlex,
            width: "100%",
            maxHeight: "50vh",
            flexWrap: "wrap",
            gap: 2,
            overflowY: "scroll",
            justifyContent: "flex-start",
          }}
        >
          {dataView === "tiles" ? (
            allCabs?.map((cab: Cabtypes) => {
              return (
                <Box
                  onClick={() => navigate(`/admin/driverProfile/${cab?._id}`)}
                  key={cab._id}
                  sx={{
                    ...ColFlex,
                    width: "125px",
                    aspectRatio: 1,
                    borderRadius: 5,
                    cursor: "pointer",
                    backgroundImage: `url(${
                      baseURL +
                      (cab?.cabDriver as EmployeeTypes)?.profilePicture
                    })`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                    backgroundRepeat: "no-repeat",
                    backgroundOrigin: "center",
                    ":hover": {
                      border: "10px solid white",
                      // backgroundSize: "110%",
                      transition: "all 0.3s",
                      // transition:"all 0.3 ease"
                    },
                    ":not(:hover)": {
                      border: "0px solid white",
                      // backgroundSize: "cover",
                      transition: "all 0.15s",
                      // transition:"all 0.3 ease"
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "3rem",
                      color: "white",
                      textShadow: "0px 0px 6px rgba(18, 178, 231, 0.7)",
                    }}
                  >
                    {cab?.cabNumber}
                  </Typography>
                </Box>
              );
            })
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "50vh",
              }}
            >
              <TableContainer sx={{}}>
                <Table sx={{ minWidth: 650 }} aria-label="driver's table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Driver</TableCell>
                      <TableCell align="center">Cab Number</TableCell>
                      <TableCell align="center">Number Plate</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allCabs?.map((driver: Cabtypes, index: number) => (
                      <TableRow
                        key={driver._id}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell component="th" scope="row">
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "flex-start",
                              alignItems: "center",
                              gap: "10px",
                            }}
                          >
                            <Avatar
                              src={
                                baseURL +
                                (driver?.cabDriver as EmployeeTypes)
                                  ?.profilePicture
                              }
                              sx={{ width: "30px", height: "30px" }}
                            />
                            {(driver?.cabDriver as EmployeeTypes)?.fname +
                              " " +
                              (driver?.cabDriver as EmployeeTypes)?.lname}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          {driver?.cabNumber}
                        </TableCell>
                        <TableCell align="center">
                          {driver?.numberPlate}
                        </TableCell>
                        <TableCell align="center">
                          {!(driver?.cabDriver as EmployeeTypes)?.isCabCancelled
                            ? "Active"
                            : "Suspended"}
                        </TableCell>
                        <TableCell align="center">
                          <MoreHoriz
                            sx={{ cursor: "pointer" }}
                            onClick={(e: any) => handleMenuOpen(e, index)}
                          />
                          <Menu
                            key={driver?._id}
                            elevation={1}
                            anchorEl={anchorEl}
                            open={menuIndex === index}
                            onClose={handleMenuClose}
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
                                navigate(`/admin/driverProfile/${driver?._id}`)
                              }
                            >
                              <Visibility sx={{}} />
                              View Details
                            </MenuItem>
                            <MenuItem
                              sx={{
                                ...RowFlex,
                                color: "warning.main",
                                fontWeight: 600,
                                justifyContent: "flex-start",
                                gap: "10px",
                              }}
                              onClick={() =>
                                navigate(
                                  `/admin/editDetails/${
                                    (driver?.cabDriver as EmployeeTypes)?._id
                                  }`
                                )
                              }
                            >
                              <EditLocation sx={{}} />
                              Edit Details
                            </MenuItem>
                            <MenuItem
                              sx={{
                                ...RowFlex,
                                color: "error.main",
                                fontWeight: 600,
                                justifyContent: "flex-start",
                                gap: "10px",
                              }}
                            >
                              <DeleteForever sx={{}} />
                              Remove Driver
                            </MenuItem>
                          </Menu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default AdminStatistics;

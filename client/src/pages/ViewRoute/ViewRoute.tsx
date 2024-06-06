import {
  NavigationOutlined,
  AccessTimeOutlined,
  Route,
  DoneAll,
  Tag,
  Groups2,
  FormatColorFill,
  DirectionsCar,
} from "@mui/icons-material";
import { Typography, Avatar, Box, ButtonBase } from "@mui/material";
import { useLocation } from "react-router-dom";
import MapComponent from "../../components/Map";
import { PageFlex, ColFlex, RowFlex } from "../../style_extentions/Flex";
import Convert24To12HourFormat from "../../utils/24HourTo12HourFormat";
import RouteTypes from "../../types/RouteTypes";
import baseURL from "../../utils/baseURL";
import Cabtypes from "./../../types/CabTypes";
import EmployeeTypes from "../../types/EmployeeTypes";

function ViewRoute() {
  const location = useLocation();
  const routeState: RouteTypes = location.state;
  console.log(routeState);
  return (
    <Box
      sx={{
        ...PageFlex,
        flexDirection: "row",
        gap: "15px",
        p: "15px",
        height: "100vh",
        backgroundColor: "#D9D9D9",
      }}
    >
      {/* LS */}
      <Box
        sx={{
          ...ColFlex,
          justifyContent: "space-between",
          alignItems: "center",
          //   flex: 3.5,
          width: "30%",
          height: "100%",
          borderRadius: "15px",
          gap: "20px",
        }}
      >
        {/* L-1 */}
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            height: "20%",
            backgroundColor: "white",
            justifyContent: "center",
            alignItems: "flex-start",
            p: "15px",
            borderRadius: "15px",
            gap: 1,
          }}
        >
          <Box
            sx={{ ...RowFlex, width: "100%", justifyContent: "space-between" }}
          >
            <Box
              sx={{ width: "100px", aspectRatio: 2.6863 }}
              component={"img"}
              src={
                routeState?.typeOfRoute === "pickup"
                  ? "/images/pickup-dark.png"
                  : "/images/drop-dark.png"
              }
            />

            <Box
              sx={{
                padding: "5px 15px",
                backgroundColor:
                  routeState?.routeStatus === "completed"
                    ? "primary.main"
                    : routeState?.routeStatus === "inProgress"
                    ? "purple"
                    : "black",
                color: "white",
                borderRadius: 1,
              }}
            >
              <Typography variant="h6">
                {routeState?.routeStatus?.toUpperCase()}
              </Typography>
            </Box>
          </Box>
          <Typography
            sx={{ fontWeight: 600, fontSize: "2rem", color: "#212A3B" }}
            variant="body2"
            fontWeight={600}
            color={"GrayText"}
          >
            {Convert24To12HourFormat(routeState?.currentShift as string)}
          </Typography>
        </Box>
        {/* L-2 */}
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            height: "80%",
            backgroundColor: "white",
            padding: "15px 20px",
            borderRadius: "15px",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 1,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            Passengers (5 out of {routeState?.passengers?.length} present)
          </Typography>
          {routeState?.passengers?.map((employee: any) => {
            // console.log(employee);
            return (
              <Box key={employee?._id} sx={{ ...RowFlex, width: "100%" }}>
                <Box
                  sx={{
                    ...RowFlex,
                    width: "80%",
                    justifyContent: "flex-start",
                    gap: "20px",
                  }}
                >
                  <Avatar
                    sx={{ width: "40px", height: "40px" }}
                    src={baseURL + employee?.profilePicture}
                  />
                  <Box>
                    <Typography sx={{ fontSize: "1.25rem", fontWeight: 500 }}>
                      {employee.fname + " " + employee.lname}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Route
                        sx={{
                          width: "15px",
                          height: "15px",
                          mr: "5px",
                          color: "secondary.main",
                        }}
                      />
                      {employee?.pickUp?.address}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ ...RowFlex, width: "20%" }}>
                  <ButtonBase sx={{ borderRadius: "100px" }}>
                    <DoneAll
                      sx={{
                        backgroundColor: "primary.main",
                        borderRadius: "100px",
                        p: 0.5,
                        width: "40px",
                        height: "40px",
                        color: "white",
                      }}
                    />
                  </ButtonBase>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
      {/* RS */}
      <Box
        sx={{
          ...ColFlex,
          //   flex: 6.5,
          width: "70%",
          backgroundColor: "white",
          height: "100%",
          borderRadius: "15px",
          overflow: "hidden",
        }}
      >
        <MapComponent
          mode="route-view"
          routePathArray={routeState?.cabPath as []}
          employees={routeState?.passengers as [EmployeeTypes]}
          height="100%"
        />
        {/* CALCULATED + MEASURED TIME & DISTANCE */}
        <Box
          sx={{
            ...ColFlex,
            gap: "15px",
            position: "absolute",
            alignItems: "flex-end",
            top: "25px",
            right: "25px",
            zIndex: "999",
          }}
        >
          {/* DISTANCE */}
          <Box
            sx={{
              ...RowFlex,
              gap: "5px",
              backgroundColor: "primary.main",
              padding: "10px 20px",
              borderRadius: "15px",
              minWidth: "10%",
            }}
          >
            <NavigationOutlined
              sx={{ color: "white", width: "30px", height: "30px" }}
            />
            <Typography sx={{ color: "white" }} variant="h5" fontWeight={600}>
              {routeState?.totalDistance}{" "}
              <span style={{ fontWeight: 500 }}>kms</span>
            </Typography>
          </Box>
          {/* TIME */}
          <Box
            sx={{
              ...RowFlex,
              gap: "5px",
              backgroundColor: "warning.main",
              padding: "10px 20px",
              borderRadius: "15px",
            }}
          >
            <AccessTimeOutlined
              sx={{ color: "white", width: "30px", height: "30px" }}
            />
            <Typography sx={{ color: "white" }} variant="h5" fontWeight={600}>
              {routeState?.estimatedTime}{" "}
              <span style={{ fontWeight: 500 }}>mins</span>
            </Typography>
          </Box>
        </Box>
        {/* EMPS */}
        <Box
          sx={{
            ...ColFlex,
            position: "absolute",
            bottom: "25px",
            right: "25px",
            zIndex: "999",
            width: "30%",
            // gap: "10px",
            // border: "2px solid #212A3B",
            p: "15px",
            borderRadius: "15px",
            alignItems: "flex-start",
            backgroundColor: "white",
            transition: "all 1s",
          }}
        >
          <Typography variant="h5" fontWeight={600}>
            Capacity {routeState?.passengers?.length || 0} of{" "}
            {(routeState?.cab as Cabtypes)?.seatingCapacity} occupied
          </Typography>
          {/* DRIVER */}
          <Box sx={{ ...ColFlex, p: 2.5, gap: 2.5 }}>
            <Box
              sx={{
                ...RowFlex,
                width: "100%",
              }}
            >
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "flex-start",
                  gap: "10px",
                }}
              >
                <Avatar
                  sx={{ width: "30px", height: "30px" }}
                  src={
                    baseURL +
                    ((routeState?.cab as Cabtypes)?.cabDriver as EmployeeTypes)
                      ?.profilePicture
                  }
                />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {"Cab " +
                      (routeState?.cab as Cabtypes)?.cabNumber +
                      " - " +
                      (
                        (routeState?.cab as Cabtypes)
                          ?.cabDriver as EmployeeTypes
                      )?.fname +
                      " " +
                      (
                        (routeState?.cab as Cabtypes)
                          ?.cabDriver as EmployeeTypes
                      )?.lname}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                ...RowFlex,
                justifyContent: "space-between",
                width: "100%",
                gap: 2.5,
              }}
            >
              <Typography
                sx={{
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "orange",
                }}
                fontWeight={500}
              >
                <Tag
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "orange",
                  }}
                />
                {(routeState?.cab as Cabtypes)?.cabNumber}
              </Typography>

              <Typography
                sx={{
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "primary.main",
                }}
                fontWeight={500}
              >
                <Groups2
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "primary.main",
                  }}
                />
                {(routeState?.cab as Cabtypes)?.seatingCapacity}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "green",
                }}
                fontWeight={500}
              >
                <FormatColorFill
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "green",
                  }}
                />
                {(routeState?.cab as Cabtypes)?.carColor}
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  color: "black",
                }}
                fontWeight={500}
              >
                <DirectionsCar
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "black",
                  }}
                />
                {(routeState?.cab as Cabtypes)?.numberPlate}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ViewRoute;

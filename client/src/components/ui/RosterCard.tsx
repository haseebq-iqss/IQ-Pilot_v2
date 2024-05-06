import { Avatar, Box, ButtonBase, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import TagIcon from "@mui/icons-material/Tag";
import Groups2Icon from "@mui/icons-material/Groups2";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Route } from "@mui/icons-material";
import MultipleStopIcon from "@mui/icons-material/MultipleStop";
import baseURL from "../../utils/baseURL.ts";
import Cabtypes from "./../../types/CabTypes";
import EmployeeTypes from "./../../types/EmployeeTypes";
import { useEffect } from "react";

type RosterCardTypes = {
  passengers: [EmployeeTypes];
  cab: Cabtypes;
  setRosterData: React.Dispatch<
    React.SetStateAction<
      {
        cab: Cabtypes;
        passengers: [EmployeeTypes];
      }[]
    >
  >;
};

const RosterCard = ({ passengers, cab, setRosterData }: RosterCardTypes) => {
  const cabDriverDetails = (cab?.cabDriver as [EmployeeTypes])[0];

  useEffect(() => {
    const newData = {
      cab,
      passengers,
    };
    setRosterData((prevData) => {
      if (
        prevData.some(
          (item) => item.cab === cab && item.passengers === passengers
        )
      ) {
        return prevData;
      } else {
        return [...prevData, newData];
      }
    });
  }, [cab, passengers, setRosterData]);
  return (
    <>
      <Box
        sx={{
          ...ColFlex,
          width: "27.5vw",
          height: "90%",
          flexDirection: "column",
          p: "20px",
          borderRadius: "15px",
          backgroundColor: "white",
          transition: "all 1s",
          justifyContent: "flex-start",
          gap: "0.5rem",
        }}
      >
        <Box
          sx={{
            ...RowFlex,
            gap: "1rem",
            justifyContent: "start",
            width: "100%",
          }}
        >
          <Box>
            <Avatar src={baseURL + cabDriverDetails?.profilePicture}></Avatar>
          </Box>
          <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {cabDriverDetails?.fname + " " + cabDriverDetails?.lname}
              </Typography>
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
                <TagIcon
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "orange",
                  }}
                />
                {cab?.cabNumber}
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
                <Groups2Icon
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "primary.main",
                  }}
                />
                {cab?.seatingCapacity}
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
                <FormatColorFillIcon
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "green",
                  }}
                />
                {cab?.carColor}
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
                <DirectionsCarIcon
                  sx={{
                    width: "20px",
                    height: "20px",
                    mr: "2px",
                    color: "black",
                  }}
                />
                {cab?.numberPlate}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ ...ColFlex, width: "100%", my: 2, gap: "0.8rem" }}>
          <Typography fontSize={24} fontWeight={600}>
            <span
              style={{
                color:
                  passengers?.length !== cab?.seatingCapacity
                    ? "crimson"
                    : "#2997FC",
              }}
            >
              {passengers?.length + " " + "out of 6"}
            </span>{" "}
            Seats Used
          </Typography>
          <hr
            style={{
              border: "2px solid #D8D8D8",
              width: "40%",
              borderRadius: 100,
            }}
          />
        </Box>

        <Box
          className="child-scroll"
          sx={{
            ...ColFlex,
            width: "100%",
            gap: 1.5,
            justifyContent: "flex-start",
            overflowY: "auto",
          }}
        >
          {passengers?.map((passenger: EmployeeTypes, index) => (
            <Box
              sx={{
                ...ColFlex,
                justifyContent: "flex-start",
                width: "100%",
              }}
              key={index}
            >
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  paddingBottom: "4px",
                  borderBottom: "1px solid #BDBDBD",
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    ...RowFlex,
                    width: "80%",
                    justifyContent: "flex-start",
                    gap: "10px",
                  }}
                >
                  <Avatar
                    sx={{ width: "35px", height: "35px" }}
                    src={baseURL + passenger?.profilePicture}
                  />
                  <Box>
                    <Typography fontSize={15} fontWeight={600}>
                      {passenger?.fname + " " + passenger?.lname}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.8rem",
                        display: "flex",
                        alignItems: "center",
                        color: "grey",
                      }}
                      fontWeight={500}
                    >
                      <Route
                        sx={{
                          width: "12.5px",
                          height: "12.5px",
                          mr: "5px",
                          color: "primary.main",
                        }}
                      />
                      {(passenger?.pickUp?.address as string)?.length > 30
                        ? (passenger?.pickUp?.address as string).slice(0, 30) +
                          "..."
                        : (passenger?.pickUp?.address as string)}
                    </Typography>
                  </Box>
                </Box>
                <ButtonBase
                  //   onClick={() => handleRemovePassengersFromCab(employee)}
                  sx={{ ...RowFlex, borderRadius: "100px" }}
                >
                  <MultipleStopIcon
                    sx={{
                      backgroundColor: "primary.main",
                      borderRadius: "100px",
                      p: 0.5,
                      width: "35px",
                      height: "35px",
                      color: "white",
                    }}
                  />
                </ButtonBase>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
};

export default RosterCard;

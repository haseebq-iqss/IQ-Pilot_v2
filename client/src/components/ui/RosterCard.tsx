import { Avatar, Box, Button, ButtonBase, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import TagIcon from "@mui/icons-material/Tag";
import Groups2Icon from "@mui/icons-material/Groups2";
import FormatColorFillIcon from "@mui/icons-material/FormatColorFill";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { Route } from "@mui/icons-material";
import MultipleStopIcon from "@mui/icons-material/MultipleStop";
import baseURL from "../../utils/baseURL.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";

const RosterCard = ({ passengers, cab }) => {
  console.log(cab);
  return (
    <>
      <Box
        sx={{
          ...ColFlex,
          height: "90%",
          flexDirection: "column",
          p: "20px",
          borderRadius: "15px",
          backgroundColor: "white",
          transition: "all 1s",
          justifyContent: "flex-start",
          gap: "0.2rem",
        }}
      >
        <Box sx={{ ...RowFlex, gap: "0.7rem", justifyContent: "start" }}>
          <Box>
            <Avatar></Avatar>
          </Box>
          <Box sx={{ ...ColFlex, justifyContent: "flex-start" }}>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Mohammad Haneef Shah
              </Typography>
            </Box>
            <Box
              sx={{
                ...RowFlex,
                justifyContent: "space-between",
                width: "100%",
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
                {cab?.numberPlate.slice(5, 9)}
              </Typography>
            </Box>
          </Box>
        </Box>
        <Box sx={{ ...ColFlex, width: "100%", my: "0.5rem", gap: "0.8rem" }}>
          <hr style={{ border: "1px solid #BDBDBD", width: "50%" }} />
          <Typography fontSize={22} fontWeight={600}>
            <span style={{ color: "#2997FC" }}>
              {passengers?.length + " " + "out of 6"}
            </span>{" "}
            Seats Used
          </Typography>
        </Box>

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
                    {(passenger?.pickUp?.address as string).slice(0, 25) +
                      "..."}
                  </Typography>
                </Box>
              </Box>
              <ButtonBase
                //   onClick={() => handleRemovePassengersFromCab(employee)}
                sx={{ ...RowFlex, width: "20%", borderRadius: "100px" }}
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
    </>
  );
};

export default RosterCard;

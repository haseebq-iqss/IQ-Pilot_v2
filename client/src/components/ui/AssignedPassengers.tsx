import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, Box, Typography } from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import { Route } from "@mui/icons-material";
import baseURL from "../../utils/baseURL.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";

const AssignedPassengers = ({
  // id,
  passenger,
}: {
  // id: string;
  passenger: EmployeeTypes;
}) => {
  console.log(passenger);
  //   const {
  //     setNodeRef,
  //     attributes,
  //     listeners,
  //     transform,
  //     transition,
  //     isDragging,
  //   } = useSortable({
  //     id: passenger._id,
  //     data: {
  //       type: "Task",
  //       task: passenger,
  //     },
  //   });

  //   const style = {
  //     transition,
  //     transform: CSS.Transform.toString(transform),
  //   };

  //   if (isDragging) {
  //     return (
  //       <div
  //         ref={setNodeRef}
  //         style={{
  //           ...style,
  //           opacity: 0.3,
  //           backgroundColor: "grey",
  //           padding: "0.625rem", // 2.5px
  //           height: "100px",
  //           minHeight: "20px",
  //           alignItems: "center",
  //           display: "flex",
  //           width: "100%",
  //           textAlign: "left",
  //           borderRadius: "0.75rem",
  //           borderWidth: "2px",
  //           borderColor: "#FF00A0",
  //           borderStyle: "solid",
  //           cursor: "grab",
  //           position: "relative",
  //         }}
  //       />
  //     );
  //   }
  return (
    <>
      <Box
        sx={{
          ...ColFlex,
          //   justifyContent: "flex-start",
          width: "30%",
          //   height: "3rem",
          //   minHeight: "2rem",
          backgroundColor: "white",
          padding: "5px",
          borderRadius: "100px",
          boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px",
          cursor: "grab",
        }}
        // ref={setNodeRef}
        // {...attributes}
        // {...listeners}
        // style={style}
      >
        <Box
          sx={{
            ...RowFlex,
            width: "100%",
            // paddingBottom: "4px",
            // borderBottom: "1px solid #BDBDBD",
            height: "100%",
          }}
        >
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "flex-start",
              gap: "5px",
            }}
          >
            <Avatar
              sx={{ width: "25px", height: "25px" }}
              src={baseURL + passenger?.profilePicture}
            />
            <Box>
              <Typography fontSize={13} fontWeight={500} color={"#2997FC"}>
                {passenger?.fname + " " + passenger?.lname[0] + "."}
              </Typography>
              {/* <Typography
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
                  ? (passenger?.pickUp?.address as string).slice(0, 30) + "..."
                  : (passenger?.pickUp?.address as string)}
              </Typography> */}
            </Box>
          </Box>
          {/* <ButtonBase
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
          </ButtonBase> */}
        </Box>
      </Box>
    </>
  );
};

export default AssignedPassengers;

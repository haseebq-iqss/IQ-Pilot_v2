import { Box, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex.ts";
import LogoImage from "/images/logo.png";
import RosterCard from "../../components/ui/RosterCard.tsx";
import { ConvertShiftTimeTo12HrFormat } from "../../utils/12HourFormat.ts";
import { ShiftTypes } from "../../types/ShiftTypes.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import Cabtypes from "../../types/CabTypes.ts";

function CreateShift() {
  const location = useLocation();

  const routeState = location?.state;
  console.log(location.state);

  //   const driverId: string | undefined = (routeState?.driver as any)?._id;
  function mapCoordinatesToText(value: string) {
    switch (value) {
      case "[34.07918418861709, 74.76795882716988]":
        return "Bemina Area";
      case "[34.07884610905441, 74.77249651656975]":
        return "Lal Bazar Area";
      case "[34.084051032954854, 74.79703437982327]":
        return "Karanagar Area";
      case "[34.01011349472341, 74.79879001141188]":
        return "Rangreth Area";
      case "[34.13990801842636, 74.80077605668806]":
        return "Soura Area";
      default:
        return "Unknown Area";
    }
  }

  return (
    <Box
      sx={{
        ...PageFlex,
        width: "100vw",
        height: "100vh",
        flexDirection: "column",
        gap: "15px",
        // height: "100vh",
        backgroundColor: "white",
      }}
    >
      {/* R1 */}
      <Box
        sx={{
          ...RowFlex,
          width: "100%",
          height: "10%",
          px: "25px",
          pt: "15px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* S1 */}
        <Box sx={{ ...ColFlex, alignItems: "flex-start", width: "60%" }}>
          <Typography variant="h4" fontWeight={600}>
            {routeState?.data?.workLocation}
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {mapCoordinatesToText(routeState?.centralPoint) +
              " --> " +
              ConvertShiftTimeTo12HrFormat(routeState?.data?.currentShift)}
          </Typography>
        </Box>

        {/* S2 */}
        <Box
          sx={{
            ...RowFlex,
            width: "40%",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 7.5,
          }}
        >
          <Box
            sx={{
              //   width: "50%",
              pl: 2.5,
              height: "50px",
              ...RowFlex,
              justifyContent: "space-between",
              gap: 2.5,
              backgroundColor: "white",
              border: "3px solid #2997fc",
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontStyle: "italic",
                fontWeight: "700",
                color: "primary.main",
              }}
            >
              RESERVE
            </Typography>
            <Box
              sx={{
                ...ColFlex,
                width: "100%",
                px: 1.75,
                height: "100%",
                bgcolor: "primary.main",
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: "white", fontStyle: "italic" }}
                variant="h5"
              >
                10
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              //   width: "50%",
              px: 5,
              height: "50px",
              bgcolor: "primary.main",
              ...RowFlex,
              gap: 2.5,
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="h5"
              sx={{ fontStyle: "italic", fontWeight: "700", color: "white" }}
            >
              DEPLOY
            </Typography>
            <Box
              component={"img"}
              src={LogoImage}
              sx={{ width: "25px", aspectRatio: 1 }}
            />
          </Box>
        </Box>
      </Box>
      {/* R2 */}
      <Box
      className="scroll-mod"
        sx={{
          ...RowFlex,
          display: "flex",
          height: "90%",
          width: "100vw",
          overflowX: "scroll",
          backgroundColor: "rgba(158, 158, 158, 0.1)",
        }}
      >
        <Box
          sx={{
            ...RowFlex,
            height: "100%",
            width: "100%",
            px: 2.5,
            whiteSpace: "nowrap",
            gap: "3rem",
            // alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          {routeState?.data?.data.map((shift : ShiftTypes, index:number) => (
            <>
            {console.log(shift)}
            <RosterCard
              key={index}
              passengers={(shift?.passengers as [EmployeeTypes])}
              cab={(shift?.cab as Cabtypes)}
              />
              </>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default CreateShift;

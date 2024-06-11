import { Box, Button, Typography } from "@mui/material";
import { CSSProperties, ReactNode } from "react";
import { ColFlex } from "../../style_extentions/Flex";
import PageHeader from "./PageHeader";
import { AddCircleOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

type PageContainerPropTypes = {
  children: ReactNode;
  headerText: string;
  subHeadingText?: string;
  parentStyles?: CSSProperties;
};

function PageContainer({
  children,
  headerText,
  subHeadingText,
  parentStyles,
}: PageContainerPropTypes) {
  const navigate = useNavigate();
  const goBackHandler = () => {
    navigate(-1);
  };
  return (
    <Box
      sx={{
        ...ColFlex,
        width: "100%",
        height: "100%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        backgroundColor: "white",
        borderRadius: "15px",
        overflowY: "scroll",
        gap: "25px",
        p: "25px",
        ...parentStyles,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          width: "100%",
          gap: 0,
        }}
      >
        <Box
          sx={{
            ...ColFlex,
            justifyContent: "flex-start",
            alignItems: "flex-start",
            width: "100%",
            gap: 0,
          }}
        >
          <PageHeader>{headerText}</PageHeader>
          <Typography color={"GrayText"} variant="body1">
            {subHeadingText}
          </Typography>
        </Box>

        {!location.pathname.includes("/admin/scheduledRoutes") && (
          <Button
            sx={{
              backgroundColor: "text.primary",
              color: "white",
              borderRadius: "4px",
              px: 2.5,
              width: "15rem",
              display: "flex",
              alignItems: "center",
            }}
            variant="contained"
            startIcon={
              !location.pathname.includes("/admin/addTeamMembers") &&
              !location.pathname.includes("/admin/addCabDrivers") ? (
                <AddCircleOutline />
              ) : (
                <ChevronLeftIcon />
              )
            }
            onClick={() =>
              location.pathname.includes("/admin/allCabDrivers")
                ? navigate("/admin/addCabDrivers")
                : location.pathname.includes("/admin/allTeamMembers")
                ? navigate("/admin/addTeamMembers")
                : goBackHandler()
            }
          >
            {`${
              location.pathname.includes("/admin/allTeamMembers")
                ? "Add Team Member"
                : location.pathname.includes("/admin/addTeamMembers") ||
                  location.pathname.includes("/admin/addCabDrivers") ||
                  location.pathname.includes("/admin/editDetails")
                ? "Go Back"
                : " Add Cab Driver"
            }`}
          </Button>
        )}
      </Box>

      {children}
    </Box>
  );
}

export default PageContainer;

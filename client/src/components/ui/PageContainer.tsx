import { Box, Button, Typography } from "@mui/material";
import { CSSProperties, ReactNode } from "react";
import { ColFlex } from "../../style_extentions/Flex";
import PageHeader from "./PageHeader";
import { AddCircleOutline } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

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
          {" "}
          <PageHeader>{headerText}</PageHeader>
          <Typography color={"GrayText"} variant="body1">
            {subHeadingText}
          </Typography>
        </Box>

        <Button
          sx={{
            backgroundColor: "text.primary",
            color: "white",
            borderRadius: "4px",
            px: 2.5,
            width: "15rem",
          }}
          variant="contained"
          startIcon={<AddCircleOutline />}
          onClick={() => {
            navigate("/admin/addTeamMembers");
          }}
        >
          Add Team Member
        </Button>
      </Box>

      {children}
    </Box>
  );
}

export default PageContainer;

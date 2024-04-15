import { Box, Typography } from "@mui/material";
import { CSSProperties, ReactNode } from "react";
import { ColFlex } from "../../style_extentions/Flex";
import PageHeader from "./PageHeader";

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
      {children}
    </Box>
  );
}

export default PageContainer;

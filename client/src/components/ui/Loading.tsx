import { Box } from "@mui/material";
import { ColFlex } from "./../../style_extentions/Flex";

function Loading() {
  return (
      <Box
      className="fade-in-slow"
      sx={{
        ...ColFlex,
        position:"absolute",
        top:0,
        zIndex:999,
        bottom:0,
        width: "100vw",
        height: "100vh",
        // background: "rgba(0, 0, 0, 0.5)",
        backgroundColor: "primary.main",
        overflow:"hidden",
        gap:10,
        transition: "all 1s ease"
      }}
    >
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "10%", left : "25px"}} />
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "20%", left : "525px"}} />
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "30%", left : "125px"}} />
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "40%", left : "525px"}} />
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "50%", left : "655px"}} />
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "60%", left : "225px"}} />
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "70%", left : "1055px"}} />
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "90%", left : "555px"}} />
      <Box className="logo-animation" component={"img"} src="/images/logo.png" sx={{width:"50px", position : "absolute", top : "100%", left : "1255px"}} />
    </Box>
  );
}

export default Loading;

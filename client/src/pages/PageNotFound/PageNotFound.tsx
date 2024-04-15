import { Box, Button } from "@mui/material";
import { PageFlex } from "../../style_extentions/Flex";
import { ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function PageNotFound() {
  const navigate = useNavigate();
  return (
    <Box sx={{ ...PageFlex, justifyContent: "center", alignItems: "center" }}>
      <h1 style={{ fontSize: "4rem" }}>404</h1>
      <h6 style={{ fontSize: "1rem", marginBottom: "5%" }}>Ouch!</h6>
      <Button
        onClick={() => navigate(-1)}
        variant="outlined"
        startIcon={<ArrowBack />}
      >
        Back to Home
      </Button>
    </Box>
  );
}

export default PageNotFound;

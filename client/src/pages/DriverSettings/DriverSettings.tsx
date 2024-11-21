import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import PageContainer from "../../components/ui/PageContainer";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import { Place, Style } from "@mui/icons-material";
import { useContext, useState } from "react";
import MapComponent from "../../components/Map";
import useLocalStorage from "../../hooks/useLocalStorage";
import DefaultMapStyleContext from "../../context/DefaultMapStyleContext";
import isXSmall from "./../../utils/isXSmall";

function DriverSettings() {
  const { getItem, setItem } = useLocalStorage();

  // App Settings Logic

  const {
    defaultMapStyle: defaultMapStyleValue,
    setDefaultMapStyle: setDefaultMapStyleValue,
  }: any = useContext(DefaultMapStyleContext);

  const [defaultMapStyle, setSetDefaultMapStyle] = useState(
    () => getItem("defaultMapStyle") || defaultMapStyleValue
  );
  const handleChangeDefaultMapStyle = (event: any) => {
    setItem("defaultMapStyle", (event.target as HTMLSelectElement).value);
    setDefaultMapStyleValue((event.target as HTMLSelectElement).value);
    setSetDefaultMapStyle((event.target as HTMLSelectElement).value);
  };

  const { isXS } = isXSmall();

  return (
    <PageContainer
      headerText="Application Settings"
      subHeadingText="Personalize your app and set defaults"
      options={false}
    >
      {/* App Settings */}
      <Box
        sx={{
          ...ColFlex,
          width: "100%",
          height: "auto",
          alignItems: "flex-start",
        }}
      >
        {/* Options Box */}
        <Box
          sx={{
            ...ColFlex,
            width: "95%",
            height: "auto",
            alignItems: "flex-start",
            gap: 5,
          }}
        >
          {/* Default Map Styles */}
          <Box sx={{ ...ColFlex, width: "100%" }}>
            <Box
              sx={{
                ...(isXS ? ColFlex : RowFlex),
                width: "100%",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              {/* Text */}
              <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
                <Typography
                  sx={{ ...RowFlex, gap: 1, alignItems: "center" }}
                  variant="h6"
                >
                  <Place /> Default Map Style
                </Typography>
                <Typography
                  sx={{ ...RowFlex, gap: 1 }}
                  variant="body2"
                  color={"GrayText"}
                >
                  Set the default Map Styles for this application.
                </Typography>
              </Box>
              {/* Select */}
              <Box sx={{ width: isXS ? "100%" : "40%", mt: isXS ? 3 : 0 }}>
                <FormControl fullWidth>
                  <InputLabel
                    sx={{ lineHeight: "10px", fontSize: "0.8rem" }}
                    id="style-select-label"
                  >
                    Default Map Style
                  </InputLabel>
                  <Select
                    size="small"
                    labelId="default-style-label"
                    value={defaultMapStyle}
                    onChange={handleChangeDefaultMapStyle}
                    label="Default Style"
                  >
                    <MenuItem
                      value={"vanilla"}
                      sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                    >
                      <Style /> Default (Vanilla)
                    </MenuItem>
                    <MenuItem
                      value={"france-hot"}
                      sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                    >
                      <Style /> France Hot Style
                    </MenuItem>
                    <MenuItem
                      value={"swiss"}
                      sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                    >
                      <Style /> Swiss Style
                    </MenuItem>
                    <MenuItem
                      value={"dutch"}
                      sx={{ ...RowFlex, gap: 2, justifyContent: "flex-start" }}
                    >
                      <Style /> Dutch Style
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
          {/* Map View */}
          <Box
            sx={{
              width: "100%",
              height: "200px",
              overflow: "hidden",
              borderRadius: "15px",
            }}
          >
            <MapComponent width="100%" height="100%" mode="route-view" />
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
}

export default DriverSettings;

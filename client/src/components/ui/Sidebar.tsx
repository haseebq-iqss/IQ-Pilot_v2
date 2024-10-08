import {
  Dashboard,
  EmojiPeople,
  Hail,
  KeyboardDoubleArrowDown,
  LiveTv,
  LocalTaxi,
  NoCrash,
  QueryStats,
  Route,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  ButtonProps,
  Divider,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserDataContext from "../../context/UserDataContext";
import { ColFlex } from "../../style_extentions/Flex";
// import UserContextTypes from "../../types/UserContextTypes";
import useAxios from "../../api/useAxios";
import baseURL from "../../utils/baseURL";
import { UserContextTypes } from "../../types/UserContextTypes";

interface SidebarButtonPropTypes extends ButtonProps {
  text: string;
  // isActive?: boolean;
  link: string;
}

function Sidebar() {
  const { userData, setUserData }: UserContextTypes =
    useContext(UserDataContext);

  const navigate = useNavigate();
  const location = useLocation();

  function Logout() {
    useAxios
      .post("auth/logout", {})
      .then(() => {
        navigate("/");
        setUserData?.(undefined);
      })
      .catch((err) => console.log(err));
    // });
  }

  const SideBarButton = ({
    text,
    // isActive = false,
    link,
    ...rest
  }: SidebarButtonPropTypes) => {
    const isActive = location.pathname.endsWith(link);
    return (
      <Button
        sx={{
          borderRadius: "100px",
          backgroundColor: isActive ? "text.primary" : "inherit",
          color: !isActive ? "text.primary" : "background.default",
          width: "90%",
          py: "10px",
          justifyContent: "flex-start",
          gap: "10px",
          pl: "25px",
        }}
        variant={isActive ? "contained" : "text"}
        onClick={() => navigate(link)}
        {...rest}
        size="small"
      >
        {text}
      </Button>
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: "background.default",
        width: "20%",
        height: "100%",
        borderRadius: "15px",
      }}
    >
      {/* Section - 1 */}
      <Box sx={{ ...ColFlex, width: "100%", height: "20%" }}>
        <Box
          component={"img"}
          src="/images/logo_new.png"
          sx={{ width: "75px", aspectRatio: 0.95 }}
        />
      </Box>

      <Divider
        sx={{ width: "80%", borderWidth: "1px", margin: "auto", mb: "25px" }}
      />

      {/* Section - 2 */}
      <Box
        sx={{
          ...ColFlex,
          width: "100%",
          height: "50%",
          justifyContent: "flex-start",
          gap: "10px",
          overflow: "auto",
          scrollbarWidth: "none",
        }}
      >
        <Box sx={{ position: "absolute", left: "17.5%", bottom: "27.5%" }}>
          <KeyboardDoubleArrowDown sx={{ color: "text.primary" }} />
        </Box>
        <SideBarButton
          text="Dashboard"
          link="/admin"
          startIcon={<Dashboard />}
          // isActive={true}
        />
        <SideBarButton
          text="Admin Statistics"
          startIcon={<QueryStats />}
          link="adminStatistics"
          // isActive={false}
        />
        <SideBarButton
          text="Scheduled Routes"
          startIcon={<Route />}
          link="scheduledRoutes"
          // isActive={false}
        />
        <SideBarButton
          text="All Cab Drivers"
          link="allCabDrivers"
          startIcon={<LocalTaxi />}
          // isActive={false}
        />
        <SideBarButton
          text="All Team Members"
          startIcon={<EmojiPeople />}
          link="allTeamMembers"
          // isActive={false}
        />
        <SideBarButton
          text="Pending Team Members"
          startIcon={<Hail />}
          link="pendingTeamMembers"
          // isActive={false}
        />
        <SideBarButton
          text="Rostered Team Members"
          startIcon={<NoCrash />}
          link="rosteredTeamMembers"
          // isActive={false}
        />
        <SideBarButton
          text="Live Driver Tracking"
          startIcon={<LiveTv />}
          link="live-driver-tracking"
          // isActive={false}
        />
      </Box>

      {/* <Divider
        sx={{ width: "85%", borderWidth: "1px", margin: "auto", mb: "15px" }}
      /> */}

      {/* Section - 3 */}
      <Box
        sx={{
          ...ColFlex,
          width: "100%",
          height: "25%",
          justifyContent: "flex-start",
        }}
      >
        <Avatar
          sx={{ width: "60px", height: "60px", mb: "10px" }}
          src={baseURL + userData?.profilePicture}
        />
        <Typography
          variant="body1"
          fontWeight={600}
          sx={{ color: "text.primary" }}
        >
          {userData?.fname + " " + userData?.lname![0] + "."}
        </Typography>
        <Typography
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            mb: "20px",
            fontSize: "0.65rem",
          }}
          variant="subtitle2"
        >
          {userData?.email}
        </Typography>
        <Button
          onClick={Logout}
          sx={{
            borderRadius: "100px",
            width: "35%",
            p: "1px",
            fontSize: "0.7rem",
          }}
          size="small"
          variant="contained"
          color="error"
          // startIcon={<Dashboard />}
        >
          LOG OUT
        </Button>
      </Box>
    </Box>
  );
}

export default Sidebar;

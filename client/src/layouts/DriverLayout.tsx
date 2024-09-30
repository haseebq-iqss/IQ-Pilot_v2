import { Close, Person, Settings, Warning } from "@mui/icons-material";
import { Avatar, Box, Button, Drawer, Modal, Typography } from "@mui/material";
import { useContext, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import UserDataContext from "../context/UserDataContext";
import baseURL from "../utils/baseURL";
import useAxios from "../api/useAxios";
import SnackbarContext from "../context/SnackbarContext";
import { SnackBarContextTypes } from "../types/SnackbarTypes";
import { UserContextTypes } from "../types/UserContextTypes";
import { PageFlex, ColFlex, RowFlex } from "./../style_extentions/Flex";

const socket = io(baseURL);

function DriverLayout() {
  const { userData, setUserData }: UserContextTypes =
    useContext(UserDataContext);

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const navigate = useNavigate();

  const [openModal, setOpenModal] = useState<boolean>(false);
  // const [currPos, setCurrPos] = useState<Array<number>>([]);

  function Logout() {
    useAxios
      .post("auth/logout", {})
      .then(() => {
        navigate("/");
        setUserData?.(undefined);
      })
      .catch(() =>
        setOpenSnack({
          open: true,
          message: "something went wrong!",
          severity: "error",
        })
      );
  }

    const SendEmergencyAlert = () => {
      let sosData;
      navigator.geolocation.getCurrentPosition((pos) => {
        sosData = {
          sosFrom: userData?.fname + " " + userData?.lname,
          phone: userData?.phone,
          location: [pos.coords.latitude, pos.coords.longitude],
        };
        socket.emit("SOS", sosData);
        setOpenDrawer(!openDrawer);
        setOpenSnack({
          open: true,
          message:
            "Emergency SOS was sent. Admin will get in touch with you shortly.",
          severity: "info",
        });
        // console.log(sosData);
      });
    };

  return (
    <Box sx={{ ...PageFlex, height: "100vh" }}>
      {/* SIDEBAR */}
      <Drawer open={openDrawer} onClose={() => setOpenDrawer(!openDrawer)}>
        <Box
          sx={{
            ...ColFlex,
            width: "80vw",
            height: "100vh",
            gap: "40px",
            p: "15px",
          }}
        >
          {/* Logo Header */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box
              component={"img"}
              src="/images/logo-blue.png"
              sx={{ width: "50px", aspectRatio: 1 }}
            />
            <Close
              sx={{ width: 30, height: 30 }}
              onClick={() => setOpenDrawer(!openDrawer)}
            />
          </Box>
          {/* Profile Card */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              gap: "15px",
              backgroundColor: "text.primary",
              color:"text.primary",
              borderRadius: "10px",
              p: "5px",
            }}
          >
            <Avatar src={baseURL + userData?.profilePicture} />
            <Box sx={{ ...ColFlex, width: "70%", alignItems: "flex-start" }}>
              <Typography variant="h6">
                {userData?.fname + " " + userData?.lname}
              </Typography>
              <Typography variant="caption" color={"lightgrey"}>
                {(userData?.department?.charAt(0).toUpperCase() as string) +
                  userData?.department?.slice(1, 99)}{" "}
                Department
              </Typography>
            </Box>
          </Box>
          {/* OPTIONS/ACTIONS */}
          <Box sx={{ ...ColFlex, width: "100%" }}>
            <Button
              sx={{
                justifyContent: "flex-start",
                p: "15px",
                pl: "20px",
                color: "text.primary",
              }}
              fullWidth
              startIcon={<Person />}
              // variant={"outlined"}
            >
              Profile
            </Button>
            <Button
              sx={{
                justifyContent: "flex-start",
                p: "15px",
                pl: "20px",
                color: "text.primary",
              }}
              fullWidth
              startIcon={<Settings />}
              // variant={"outlined"}
            >
              Settings
            </Button>
          </Box>
          {/* LOGOUT AND SOS */}
          <Box
            sx={{ ...ColFlex, width: "100%", gap: "15px", marginTop: "auto" }}
          >
            <Button
              onClick={() => setOpenModal(!openModal)}
              sx={{
                backgroundColor: "error",
                borderRadius: "10px",
                p: "15px",
              }}
              color={"error"}
              fullWidth
              startIcon={<Warning />}
              variant={"contained"}
            >
              EMERGENCY SOS
            </Button>
            <Button
              onClick={() => Logout()}
              sx={{
                backgroundColor: "text.primary",
                color:"text.primary",
                borderRadius: "10px",
                p: "15px",
              }}
              fullWidth
              variant={"contained"}
            >
              LOG OUT
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Body Start */}
      <Box
        sx={{
          ...ColFlex,
          justifyContent: "flex-start",
          width: "100%",
          height: "100%",
          backgroundColor: "background.default",
          gap: "0px",
          pb: "20px",
        }}
      >
        {/* SOS MODAL */}
        <Modal
          sx={{ ...ColFlex, width: "100%", height: "100%" }}
          open={openModal}
          onClose={() => setOpenModal(!openModal)}
        >
          <Box
            sx={{
              ...ColFlex,
              p: "30px 10px",
              // minHeight: "40vh",
              width: { xs: "90%", lg: "75%" },
              borderRadius: "15px",
              gap: 5,
              alignItems: "center",
              textAlign: "center",
              justifyContent: "center",
              backgroundColor: "background.default",
            }}
          >
            {/* DANGER POPUP */}
            <Box
              sx={{
                ...ColFlex,
                width: "100%",
                textAlign: "center",
                gap: "15px",
                marginTop: "15px",
              }}
            >
              <Typography variant="h5" fontWeight={600} sx={{ mb: "10px" }}>
                Are you in Danger ?
              </Typography>
              <Warning
                sx={{ color: "error.main", width: "50px", height: "50px" }}
              />
              <Typography
                sx={{ width: "60%" }}
                variant="body1"
                color={"GrayText"}
                fontWeight={600}
              >
                The admin will be alerted instantly!
              </Typography>
              <Button
                onClick={() => SendEmergencyAlert()}
                sx={{
                  backgroundColor: "error.main",
                  color: "background.default",
                  padding: "10px 50px",
                  borderRadius: "100px",
                }}
                variant="contained"
                size="large"
              >
                Send Alert
              </Button>
            </Box>
          </Box>
        </Modal>

        {/* Header */}
        <Box
          sx={{
            ...RowFlex,
            width: "100%",
            justifyContent: "space-between",
            borderBottom: "2px solid lightgrey",
            p: "15px",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {userData?.lname &&
              userData?.fname + " " + userData?.lname[0] + "."}
          </Typography>
          {/* Profile Picture */}
          <Avatar
            src={baseURL + userData?.profilePicture}
            onClick={() => setOpenDrawer(!openDrawer)}
          />
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}

export default DriverLayout;

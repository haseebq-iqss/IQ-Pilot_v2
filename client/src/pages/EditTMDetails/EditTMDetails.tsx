import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import baseURL from "../../utils/baseURL";
import {
  ArrowBackIos,
  ExpandLess,
  ExpandMore,
  Password,
  Save,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import EmployeeTypes from "../../types/EmployeeTypes";
import Convert24To12HourFormat from "../../utils/24HourTo12HourFormat";

function EditTMDetails() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();
  const employee: EmployeeTypes = location?.state;
  const [fName, setFName] = useState(employee?.fname);
  const [lName, setLName] = useState(employee?.lname);
  const [email, _setEmail] = useState(employee?.email);
  const [phone, setPhone] = useState(employee?.phone);
  const [department, _setDepartment] = useState(employee?.department);
  const [workLocation, setWorkLocation] = useState(employee?.workLocation);
  const [address, setAddress] = useState(employee?.pickUp?.address);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        p: 2.5,
        backgroundColor: "background.default",
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          ...RowFlex,
          width: "100%",
          justifyContent: "space-between",
          gap: 2.5,
          mb: 5,
        }}
      >
        <ArrowBackIos
          onClick={() => navigate(-1)}
          sx={{
            fontSize: 40,
            color: "text.primary",
            pl: "10px",
            border: "2px solid white",
            borderRadius: "10px",
          }}
        />
        <Typography variant="h5">Edit Details</Typography>
      </Box>
      <Box
        sx={{
          width: "100%",
          ...RowFlex,
          justifyContent: "center",
        }}
      >
        <Avatar src={baseURL} sx={{ width: "120px", height: "120px" }} />
      </Box>
      <Box
        sx={{
          ...ColFlex,
          gap: "20px",
          width: "100%",
          mt: 5,
        }}
      >
        <Box sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start" }}>
          <Typography variant="body1">First Name</Typography>
          <TextField
            fullWidth
            name="firstName"
            value={fName}
            onChange={(e) => setFName(e.target.value)}
          />
        </Box>
        <Box sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start" }}>
          <Typography variant="body1">Last Name</Typography>
          <TextField
            fullWidth
            name="lastName"
            value={lName}
            onChange={(e) => setLName(e.target.value)}
          />
        </Box>
        <Box sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start" }}>
          <Typography variant="body1">Email</Typography>
          <TextField fullWidth name="email" value={email} disabled />
        </Box>
        <Box sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start" }}>
          <Typography variant="body1">Phone Number</Typography>
          <TextField
            fullWidth
            name="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value as any)}
          />
        </Box>

        <Box sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start" }}>
          <Typography variant="body1">Department</Typography>
          <TextField fullWidth name="department" value={department} disabled />
        </Box>
        <Box sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start" }}>
          <Typography variant="body1">Current Shift Hours</Typography>
          <Typography variant="h5">
            {Convert24To12HourFormat(employee?.currentShift as string)}
          </Typography>
        </Box>
        <Box sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start" }}>
          <Typography variant="body1">Work Location</Typography>
          <TextField
            fullWidth
            name="workLocation"
            value={workLocation}
            onChange={(e) => setWorkLocation(e.target.value)}
          />
        </Box>
        <Box sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start" }}>
          <Typography variant="body1">Address</Typography>
          <TextField
            fullWidth
            name="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </Box>
        <Box
          sx={{ width: "100%", ...ColFlex, gap: 1, alignItems: "start", mt: 1 }}
        >
          <Button
            fullWidth
            sx={{
              ...RowFlex,
              gap: 2,
              padding: 1,
              fontSize: "1.2rem",
            }}
            type="submit"
            color="primary"
            variant="contained"
          >
            <Save />
            Save Changes
          </Button>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            mt: 5,
          }}
        >
          <Typography variant="h5" onClick={() => setExpanded(!expanded)}>
            Change Password
          </Typography>
          <IconButton onClick={() => setExpanded(!expanded)}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>

        {expanded && (
          <>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "start",
              }}
            >
              <Typography variant="body1">Old Password</Typography>
              <TextField fullWidth type="password" />
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "start",
              }}
            >
              <Typography variant="body1">New Password</Typography>
              <TextField fullWidth type="password" />
            </Box>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                alignItems: "start",
                mt: 1,
              }}
            >
              <Button
                fullWidth
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  padding: 1,
                  fontSize: "1.2rem",
                }}
                type="submit"
                color="primary"
                variant="contained"
              >
                <Password />
                Change Password
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default EditTMDetails;

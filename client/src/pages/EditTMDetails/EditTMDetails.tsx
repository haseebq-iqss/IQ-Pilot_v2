import {
  Avatar,
  Box,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import {
  ArrowBackIos,
  ExpandLess,
  ExpandMore,
  Password,
  Save,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { FormEvent, useContext, useState } from "react";
import EmployeeTypes from "../../types/EmployeeTypes";
import Convert24To12HourFormat from "../../utils/24HourTo12HourFormat";
import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import SnackbarContext from "../../context/SnackbarContext";
import { UserContextTypes } from "../../types/UserContextTypes";
import UserDataContext from "../../context/UserDataContext";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import baseURL from "../../utils/baseURL";

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
  const [_profilePicture, setProfilePicture] = useState<File>();
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  const { userData, setUserData }: UserContextTypes =
    useContext(UserDataContext);

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const editAdminProfile = (TMProfileData: any) => {
    return useAxios.patch(`/users/tm/${userData?._id}`, TMProfileData);
  };

  const updatePassword = (passwordData: {
    user: EmployeeTypes;
    oldPassword: string;
    newPassword: string;
  }) => {
    return useAxios.put("auth/change-password", passwordData);
  };

  const { mutate: updatePasswordMutation } = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      setOpenSnack({
        open: true,
        message: "Password updated successfully!",
        severity: "success",
      });
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message || "Password update failed",
        severity: "warning",
      });
    },
  });

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    // const { oldPassword, newPassword } = e.target as any;
    const formTarget = e.target as any;
    const passwordData = {
      user: userData as EmployeeTypes,
      oldPassword: formTarget.oldPassword.value,
      newPassword: formTarget.newPassword.value,
    };
    updatePasswordMutation(passwordData);
    // updatePasswordMutation({
    //   oldPassword: oldPassword.value,
    //   newPassword: newPassword.value,
    // });
  };

  const { mutate: EditTMMutation } = useMutation({
    mutationFn: editAdminProfile,
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: "Profile was Updated!",
        severity: "success",
      });
      // console.log(data)
      setUserData!(data.data.data);
      navigate("/employee");
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message,
        severity: "warning",
      });
    },
  });

  function HandleEditTMProfile(e: FormEvent) {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLFormElement;

    // USING PARTIALS
    // const teamMemberData: Partial<EmployeeTypes> = {
    const teamMemberData: EmployeeTypes = {
      fname: fName,
      lname: lName,
      phone: phone,
      address: address,
      profilePicture: currentTarget.profilePicture.files[0], // Disabled due to no integration found!
      workLocation: workLocation,
    };

    const formData = new FormData();

    for (const key in teamMemberData) {
      if (teamMemberData.hasOwnProperty(key)) {
        const value = teamMemberData[key as keyof EmployeeTypes];
        if (key === "profilePicture") {
          formData.append(key, value as File);
        } else if (typeof value === "object") {
          formData.append(
            "pickUp[coordinates][]",
            teamMemberData.pickUp!.coordinates[0].toString()
          );
          formData.append(
            "pickUp[coordinates][]",
            teamMemberData.pickUp!.coordinates[1].toString()
          );
          formData.append("pickUp[address]", teamMemberData.pickUp!.address);
          // console.log(key, value);
          // console.log(JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }

    // Display the key/value pairs
    for (var pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }
    EditTMMutation(formData);
  }

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
      <Box component={"form"} onSubmit={HandleEditTMProfile}>
        <Box
          sx={{
            width: "100%",
            ...ColFlex,
            justifyContent: "center",
            position: "relative",
          }}
        >
          <Avatar
            src={baseURL + employee?.profilePicture}
            sx={{ width: "120px", height: "120px" }}
          />
          <Button component="label">
            <DriveFileRenameOutlineIcon
              sx={{
                position: "absolute",
                bottom: "20px",
                right: "-36px",
                color: "white",
              }}
            />
            <input
              type="file"
              accept="image/png, image/gif, image/jpeg"
              hidden
              name="profilePicture"
              onChange={handleProfilePictureChange}
            />
          </Button>
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
            <TextField
              fullWidth
              name="department"
              value={department}
              disabled
            />
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
            sx={{
              width: "100%",
              ...ColFlex,
              gap: 1,
              alignItems: "start",
              mt: 1,
            }}
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
          <Box
            component="form"
            onSubmit={handlePasswordChange}
            sx={{ ...ColFlex, gap: 1, width: "100%" }}
          >
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
              <TextField
                required
                fullWidth
                type="password"
                name="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
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
              <TextField
                required
                fullWidth
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
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
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default EditTMDetails;

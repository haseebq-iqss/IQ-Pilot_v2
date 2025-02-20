import PageContainer from "../../components/ui/PageContainer";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";

interface InitialData {
  fname: string;
  lname: string;
  email: string;
  phone: string;
  address: string;
  coordinates: string;
  workLocation: string;
  currentShift: string;
  // Optional cab details
  cabNumber?: string;
  carColor?: string;
  seatingCapacity?: string;
  numberPlate?: string;
  carModel?: string;
}

export const EditDetails = () => {
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<InitialData>({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    address: "",
    coordinates: "",
    workLocation: "",
    currentShift: "",
  });

  // Define timing options (removed duplicate entry)
  const pickupTimings = [
    { t4Time: "09:00", t2Time: "09:00 AM" },
    { t4Time: "10:00", t2Time: "10:00 AM" },
    { t4Time: "11:00", t2Time: "11:00 AM" },
    { t4Time: "12:00", t2Time: "12:00 PM" },
    { t4Time: "13:00", t2Time: "01:00 PM" },
    { t4Time: "14:00", t2Time: "02:00 PM" },
    { t4Time: "15:00", t2Time: "03:00 PM" },
    { t4Time: "16:00", t2Time: "04:00 PM" },
    { t4Time: "17:00", t2Time: "05:00 PM" },
    { t4Time: "18:00", t2Time: "06:00 PM" },
  ];

  const dropTimings = [
    { t4Time: "13:00", t2Time: "01:00 PM" },
    { t4Time: "17:00", t2Time: "05:00 PM" },
    { t4Time: "17:30", t2Time: "05:30 PM" },
    { t4Time: "18:00", t2Time: "06:00 PM" },
    { t4Time: "18:30", t2Time: "06:30 PM" },
    { t4Time: "20:30", t2Time: "08:30 PM" },
    { t4Time: "22:00", t2Time: "10:00 PM" },
    { t4Time: "22:30", t2Time: "10:30 PM" },
    { t4Time: "23:00", t2Time: "11:00 PM" },
    { t4Time: "01:00", t2Time: "01:00 AM" },
  ];

  const combinedTimings = pickupTimings.map((pickup, index) => {
    const drop = dropTimings[index];
    return `${pickup.t4Time}-${drop.t4Time}`;
  });

  const { id } = useParams();

  // Fetch team member details
  const { data: editTMDetails } = useQuery({
    queryKey: ["TM-data", id],
    queryFn: async () => {
      const response = await useAxios.get(`/users/tm/${id}`);
      return response?.data?.data;
    },
  });
  const employeePath = editTMDetails?.role === "employee";

  // Fetch driver details if not an employee
  const { data: editDriverData } = useQuery({
    queryKey: ["Driver-data", id],
    queryFn: async () => {
      const response = await useAxios.get(`/cabs/driver/${id}`);
      return response?.data?.data[0];
    },
    enabled: !employeePath,
  });
  const driverPath = editDriverData?.cabDriver?.role === "driver";

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  // Mutation functions now accept FormData with proper headers
  const editTeamMember = (teamMemberData: FormData) => {
    return useAxios.patch(`/users/tm/${id}`, teamMemberData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const editCabDriver = (cabDriverData: FormData) => {
    return useAxios.patch(`/users/driver/${id}`, cabDriverData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const { mutate: updateTeamMember } = useMutation({
    mutationFn: editTeamMember,
    onSuccess: () => {
      setOpenSnack({
        open: true,
        message: "User was updated successfully",
        severity: "success",
      });
      navigate(-1);
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message || "Error updating user",
        severity: "warning",
      });
    },
  });

  const { mutate: updateCabDriver } = useMutation({
    mutationFn: editCabDriver,
    onSuccess: () => {
      setOpenSnack({
        open: true,
        message: "Profile updated successfully!",
        severity: "success",
      });
      navigate(-1);
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message || "Error updating profile",
        severity: "warning",
      });
    },
  });

  // When the API data loads, update the state.
  useEffect(() => {
    if (editTMDetails) {
      setInitialData({
        fname: editTMDetails.fname || "",
        lname: editTMDetails.lname || "",
        email: editTMDetails.email || "",
        phone: editTMDetails.phone || "",
        address: editTMDetails.pickUp?.address || "",
        coordinates: editTMDetails.pickUp?.coordinates || "",
        workLocation: editTMDetails.workLocation || "",
        currentShift: editTMDetails.currentShift || "",
      });
    }
  }, [editTMDetails]);

  // For driver: simple form submission using FormData
  const handleCabDriverSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    updateCabDriver(formData);
  };

// For team member: process pickUp coordinates and submit
const handleTeamMemberSubmit = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = e.currentTarget;
  const formData = new FormData(form);

  // Process coordinates: convert "coordinates" into pickUp[coordinates][]
  const coordinates = formData.get("coordinates") as string;
  if (coordinates) {
    const coordsArray = coordinates.split(",").map((num) => num.trim());
    formData.delete("coordinates");
    formData.append("pickUp[coordinates][]", coordsArray[0]);
    formData.append("pickUp[coordinates][]", coordsArray[1]);
  }
  
  // Process address: move it under the pickUp object as expected by the API
  const address = formData.get("address") as string;
  if (address) {
    formData.delete("address");
    formData.append("pickUp[address]", address);
  }

  updateTeamMember(formData);
};


  // Generic input change handler that preserves state
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInitialData((prev) => ({ ...prev, [name]: value }));
  };

  // Select change handler
  const handleSelectChange = (
    e: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    if (name) {
      setInitialData((prev) => ({ ...prev, [name]: value as string }));
    }
  };

  return (
    <PageContainer
      headerText={`Edit Details Of ${initialData.fname} ${initialData.lname}`}
      parentStyles={{}}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          py: "2rem",
        }}
      >
        <Box
          component="form"
          sx={{
            ...ColFlex,
            gap: "20px",
            width: "100%",
          }}
          onSubmit={driverPath ? handleCabDriverSubmit : handleTeamMemberSubmit}
        >
          {/* HEADER FIELDS */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <TextField
              fullWidth
              name="firstName"
              label="First Name"
              type="text"
              value={initialData.fname}
              placeholder="Enter your first name"
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setInitialData((prev) => ({ ...prev, fname: e.target.value }))
              }
            />
            <TextField
              fullWidth
              name="lastName"
              label="Last Name"
              type="text"
              value={initialData.lname}
              placeholder="Enter your last name"
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setInitialData((prev) => ({ ...prev, lname: e.target.value }))
              }
            />
          </Box>
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <TextField
              fullWidth
              name="email"
              label="Email"
              type="email"
              value={initialData.email}
              placeholder="Enter your email"
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setInitialData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
            <TextField
              fullWidth
              name="phone"
              label="Phone"
              type="number"
              value={initialData.phone}
              placeholder="Enter your phone number"
              InputLabelProps={{ shrink: true }}
              onChange={(e) =>
                setInitialData((prev) => ({ ...prev, phone: e.target.value }))
              }
            />
          </Box>
          {employeePath && (
            <>
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <TextField
                  fullWidth
                  name="address"
                  label="Address"
                  type="text"
                  value={initialData.address}
                  placeholder="Enter your address"
                  InputLabelProps={{ shrink: true }}
                  onChange={handleInputChange}
                />
                <TextField
                  fullWidth
                  name="coordinates"
                  label="Coordinates"
                  type="text"
                  value={initialData.coordinates}
                  placeholder="Enter coordinates as lat, lng"
                  InputLabelProps={{ shrink: true }}
                  onChange={handleInputChange}
                />
              </Box>
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <FormControl fullWidth>
                  <InputLabel id="workLocation-label">Work Location</InputLabel>
                  <Select
                    name="workLocation"
                    label="Work Location"
                    value={initialData.workLocation}
                    onChange={handleSelectChange as any}
                    labelId="workLocation-label"
                  >
                    <MenuItem value="Rangreth">Rangreth</MenuItem>
                    <MenuItem value="Zaira Tower">Zaira Tower</MenuItem>
                    <MenuItem value="Karanagar">Karanagar</MenuItem>
                    <MenuItem value="Zirakpur">Zirakpur</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="currentShift-label">Current Shift</InputLabel>
                  <Select
                    name="currentShift"
                    label="Current Shift"
                    value={initialData.currentShift}
                    onChange={(e) =>
                      setInitialData((prev) => ({
                        ...prev,
                        currentShift: e.target.value as string,
                      }))
                    }
                    labelId="currentShift-label"
                  >
                    {combinedTimings.map((timeSlot, index) => (
                      <MenuItem key={index} value={timeSlot}>
                        {timeSlot}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </>
          )}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "end",
              gap: "15px",
            }}
          >
            <Button
              variant="contained"
              component="label"
              sx={{
                width: "50%",
                height: "3.4rem",
                bgcolor: "#9329FC",
                color: "text.primary",
                p: "0",
              }}
            >
              + ADD PROFILE PICTURE
              <input
                type="file"
                accept="image/png, image/gif, image/jpeg"
                hidden
                name="profilePicture"
              />
            </Button>
          </Box>
          {/* Uncomment and adjust the cab details section for drivers if needed */}
          {/*
          {driverPath && (
            <>
              <Typography variant="h5">Cab Details</Typography>
              <Box sx={{ ...RowFlex, width: "100%", justifyContent: "space-between", gap: "15px" }}>
                <TextField
                  fullWidth
                  name="cabNumber"
                  label="Cab Number"
                  type="text"
                  value={initialData.cabNumber || ""}
                  placeholder="Cab Number"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    setInitialData((prev) => ({ ...prev, cabNumber: e.target.value }))
                  }
                />
              </Box>
              <Box sx={{ ...RowFlex, width: "100%", justifyContent: "space-between", gap: "15px" }}>
                <TextField
                  fullWidth
                  name="carColor"
                  label="Cab Color"
                  type="text"
                  value={initialData.carColor || ""}
                  placeholder="Cab Color"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    setInitialData((prev) => ({ ...prev, carColor: e.target.value }))
                  }
                />
                <TextField
                  fullWidth
                  name="seatingCapacity"
                  label="Seating Capacity"
                  type="number"
                  value={initialData.seatingCapacity || ""}
                  placeholder="Seating Capacity"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    setInitialData((prev) => ({ ...prev, seatingCapacity: e.target.value }))
                  }
                />
              </Box>
              <Box sx={{ ...RowFlex, width: "100%", justifyContent: "space-between", gap: "15px" }}>
                <TextField
                  fullWidth
                  name="numberPlate"
                  label="Number Plate"
                  type="text"
                  value={initialData.numberPlate || ""}
                  placeholder="Number Plate"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    setInitialData((prev) => ({ ...prev, numberPlate: e.target.value }))
                  }
                />
                <TextField
                  fullWidth
                  name="carModel"
                  label="Car Model"
                  type="text"
                  value={initialData.carModel || ""}
                  placeholder="Car Model"
                  InputLabelProps={{ shrink: true }}
                  onChange={(e) =>
                    setInitialData((prev) => ({ ...prev, carModel: e.target.value }))
                  }
                />
              </Box>
            </>
          )}
          */}
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "flex-end",
              mt: "1rem",
            }}
          >
            <Button
              sx={{
                width: "49.3%",
                padding: "0.3rem",
                height: "3rem",
              }}
              type="submit"
              color="primary"
              variant="contained"
            >
              Confirm and Edit
            </Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

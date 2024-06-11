// @ts-nocheck
import PageContainer from "./PageContainer";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FormEvent, useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import EmployeeTypes from "../../types/EmployeeTypes";
import Cabtypes from "../../types/CabTypes";

export const EditDetails = () => {
  const navigate = useNavigate();
  const [department, setDepartment] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [fullName, setFullName] = useState({
    firstName: "",
    lastName: "",
  });
  const [initialData, setInitialData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    address: "",
    coordinates: "",
    seatingCapacity: "",
    cabNumber: "",
    numberPlate: "",
    carModel: "",
    carColor: "",
  });

  const location = useLocation();
  const { id } = useParams();
  const handleWorkLocation = (event: any) => {
    setWorkLocation(event.target.value);
  };
  const handleChangeDepartment = (event: any) => {
    setDepartment(event.target.value);
  };

  const editTMMF = (teamMemberData: any) => {
    return useAxios.patch(`/users/tm/${id}`, teamMemberData);
  };

  type CabDriverType = EmployeeTypes & Cabtypes;
  const editCabDriver = (cabDriverData: CabDriverType) => {
    // console.log(cabDriverData);
    return useAxios.patch(`/cabs/${id}`, cabDriverData);
  };

  const { data: editTMDetails } = useQuery({
    queryKey: ["TM-data"],
    queryFn: async () => {
      const response = await useAxios.get(`/users/tm/${id}`);
      return response?.data?.data;
    },
  });

  const { data: editDriverData } = useQuery({
    queryKey: ["Driver-data"],
    queryFn: async () => {
      const response = await useAxios.get(`/cabs/driver/${id}`);
      return response?.data?.data[0];
    },
  });
  const driverPath = editDriverData?.cabDriver?.role === "driver";

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  const { mutate: AddTeamMember } = useMutation({
    mutationFn: editTMMF,
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: data.data.message,
        severity: "success",
      });
      navigate(-1);
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message,
        severity: "warning",
      });
    },
  });
  useEffect(() => {
    setInitialData((prev) => {
      return {
        fname: editTMDetails?.fname,
        lname: editTMDetails?.lname,
        email: editTMDetails?.email,
        phone: editTMDetails?.phone,
        address: editTMDetails?.pickUp?.address,
        coordinates: editTMDetails?.pickUp?.coordinates,
        seatingCapacity: editDriverData?.seatingCapacity,
        cabNumber: editDriverData?.cabNumber,
        numberPlate: editDriverData?.numberPlate,
        carModel: editDriverData?.carModel,
        carColor: editDriverData?.carColor,
      };
    });
  }, [editTMDetails, editDriverData]);

  const { mutate: AddCabDriver } = useMutation({
    mutationFn: editCabDriver,
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: data.data.message,
        severity: "success",
      });
    },
    onError: (err: any) => {
      setOpenSnack({
        open: true,
        message: err?.response?.data?.message,
        severity: "warning",
      });
    },
  });

  function HandleCabDriver(e: FormEvent) {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLFormElement;
    interface CabDriverData {
      fname: string;
      lname: string;
      email: string;
      phone: string;
      address: string;
      profilePicture: File;
      password: string;
      seatingCapacity: number;
      cabNumber: string;
      numberPlate: string;
      carModel: string;
      carColor: string;
      role: string;
    }

    const cabDriverData: CabDriverType = {
      fname: currentTarget.firstName.value,
      lname: currentTarget.lastName.value,
      email: currentTarget.email.value,
      phone: currentTarget.phone.value,
      profilePicture: currentTarget.profilePicture.files?.[0] as File,
      seatingCapacity: parseInt(currentTarget.seatingCapacity.value, 10),
      cabNumber: currentTarget.cabNumber.value,
      numberPlate: currentTarget.numberPlate.value,
      carModel: currentTarget.carModel.value,
      carColor: currentTarget.carColor.value,
    };

    const formData = new FormData();

    for (const key in cabDriverData) {
      if (cabDriverData.hasOwnProperty(key)) {
        const value: any = cabDriverData[key as keyof CabDriverData];
        if (key === "profilePicture") {
          formData.append(key, value);
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    }
    // console.log(cabDriverData);
    AddCabDriver(formData as CabDriverType);
  }
  const handleFullName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { name, value } = e.target;
    setFullName((prevFullName) => ({
      ...prevFullName,
      [name]: value,
    }));
  };

  function HandleAddTM(e: FormEvent) {
    e.preventDefault();
    const currentTarget = e.currentTarget as HTMLFormElement;

    const teamMemberData: EmployeeTypes = {
      fname: currentTarget.firstName.value,
      lname: currentTarget.lastName.value,
      email: currentTarget.email.value,
      phone: currentTarget.phone.value,
      address: currentTarget.address.value,
      profilePicture: currentTarget.profilePicture.files[0],
      pickUp: {
        coordinates: currentTarget.coordinates.value.split(",").map(Number) as [
          number,
          number
        ],
        address: currentTarget.address.value as string,
      },
    };
    console.log(teamMemberData);

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
    AddTeamMember(formData);
  }

  return (
    <PageContainer
      headerText={`Edit Details Of ${
        editTMDetails?.fname + " " + editTMDetails?.lname
      }`}
      parentStyles={{}}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          py: "2rem",
          // height: "65vh",
          // overflow: "scroll",
        }}
      >
        {/* FORM */}
        <Box
          component={"form"}
          sx={{
            ...ColFlex,
            gap: "20px",
            width: "100%",
            // py: "5%",
            // my: "2.5%",
          }}
          onSubmit={driverPath ? HandleCabDriver : HandleAddTM}
        >
          {/* HEADER */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            <TextField
              // required
              fullWidth
              name="firstName"
              label="first name"
              type="text"
              value={initialData.fname}
              defaultValue={editTMDetails?.fname}
              placeholder="Enter your first name"
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setInitialData({ fname: e.target.value })}
            />
            <TextField
              //   required
              fullWidth
              name="lastName"
              label="last name"
              type="text"
              placeholder="Enter your last name"
              InputLabelProps={{ shrink: true }}
              value={initialData.lname}
              onChange={(e) => setInitialData({ lname: e.target.value })}
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
              //   required
              fullWidth
              name="email"
              label="email"
              type="email"
              placeholder="Enter your email"
              InputLabelProps={{ shrink: true }}
              value={initialData.email}
              onChange={(e) => setInitialData({ email: e.target.value })}
            />
            <TextField
              //   required
              fullWidth
              name="phone"
              label="phone"
              type="number"
              placeholder="Enter your phone number"
              InputLabelProps={{ shrink: true }}
              value={initialData.phone}
              onChange={(e) => setInitialData({ phone: e.target.value })}
            />
          </Box>{" "}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              justifyContent: "space-between",
              gap: "15px",
            }}
          >
            {!driverPath && (
              <TextField
                // required
                fullWidth
                name="address"
                label="address"
                type="text"
                placeholder="Enter your address"
                InputLabelProps={{ shrink: true }}
                value={initialData.address}
                onChange={(e) => setInitialData({ address: e.target.value })}
              />
            )}
            <Box
              sx={{
                ...RowFlex,
                width: "100%",
                justifyContent: "space-between",
                gap: "15px",
              }}
            >
              {!driverPath && (
                <TextField
                  //   required
                  fullWidth
                  name="coordinates"
                  label="Coordinates"
                  type="string"
                  placeholder="Coordinates"
                  InputLabelProps={{ shrink: true }}
                  value={initialData?.coordinates}
                  onChange={(e) =>
                    setInitialData({ coordinates: e.target.value })
                  }
                />
              )}
            </Box>
          </Box>
          <Box
            full
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
                color: "white",
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
          {driverPath && (
            <>
              <Typography variant="h5">Cab Details</Typography>
              <Box
                sx={{
                  ...RowFlex,
                  width: "100%",
                  justifyContent: "space-between",
                  gap: "15px",
                }}
              >
                <TextField
                  required={driverPath}
                  fullWidth
                  name="cabNumber"
                  label="cab number"
                  type="cab number"
                  placeholder="Cab Number"
                  InputLabelProps={{ shrink: true }}
                  value={initialData.cabNumber}
                  onChange={(e) =>
                    setInitialData({ cabNumber: e.target.value })
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
                  required={driverPath}
                  fullWidth
                  name="carColor"
                  label="cab color"
                  type="cab color"
                  placeholder="Cab Color"
                  InputLabelProps={{ shrink: true }}
                  value={initialData.carColor}
                  onChange={(e) => setInitialData({ carColor: e.target.value })}
                />
                <TextField
                  required={driverPath}
                  fullWidth
                  name="seatingCapacity"
                  label="seating capacity"
                  type="number"
                  placeholder="Seating Capacity"
                  InputLabelProps={{ shrink: true }}
                  value={initialData.seatingCapacity}
                  onChange={(e) =>
                    setInitialData({ seatingCapacity: e.target.value })
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
                  required={driverPath}
                  fullWidth
                  name="numberPlate"
                  label="number plate"
                  type="text"
                  placeholder="Number plate"
                  InputLabelProps={{ shrink: true }}
                  value={initialData.numberPlate}
                  onChange={(e) =>
                    setInitialData({ numberPlate: e.target.value })
                  }
                />
                <TextField
                  required={driverPath}
                  fullWidth
                  name="carModel"
                  label="model"
                  type="text"
                  placeholder="Cab Model"
                  InputLabelProps={{ shrink: true }}
                  value={initialData.carModel}
                  onChange={(e) => setInitialData({ carModel: e.target.value })}
                />
              </Box>
            </>
          )}
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
                // marginTop: "1.2rem",
              }}
              type="submit"
              // disabled={loginStatus === "pending"}
              color="primary"
              variant="contained"
            >
              {"Confirm and Edit "}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageContainer>
  );
};

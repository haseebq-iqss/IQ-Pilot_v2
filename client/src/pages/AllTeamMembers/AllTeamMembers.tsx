// @ts-nocheck
import {
  DeleteForever,
  EditLocation,
  ExitToApp,
  MoreHoriz,
  Pause,
  PlayArrow,
  Search,
} from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import PageContainer from "../../components/ui/PageContainer";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
import { RowFlex } from "../../style_extentions/Flex";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import { useNavigate } from "react-router-dom";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";
import SnackbarContext from "../../context/SnackbarContext";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Convert24To12HourFormat from "../../utils/24HourTo12HourFormat";

function AllTeamMembers() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchtext, setSearchText] = useState("");
  const [cabNumersArray, setCabNumersArray] = useState<Array<string>>([]);
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const GetAllTeamMembersQF = () => {
    return useAxios.get("/users/tms");
  };

  const { data: teamMemberData } = useQuery({
    queryKey: ["all-teamMembers"],
    queryFn: GetAllTeamMembersQF,
    select: (data: any) => {
      return data.data.data;
    },
  });

  // Mark TM Absent
  const {
    status,
    mutate: MarkAsAbsent,
    data,
  } = useMutation({
    mutationFn: (uid: string) => {
      return useAxios.patch(`/users/cancel-cab/${uid}`);
    },
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: `TM marked absent ${
          data.data.data.isCabCancelled ? "absent" : "present"
        } successfully`,
        severity: !data.data.data.isCabCancelled ? "info" : "warning",
      });
      qc.invalidateQueries({ queryKey: ["all-teamMembers"] });
      handleMenuClose();
    },
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  const { mutate: deleteEmpMf } = useMutation({
    mutationKey: ["delete-employee"],
    mutationFn: async (employeeId: string) => {
      await useAxios.delete(`/users/tm/${employeeId}`);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["all-teamMembers"] });
    },
  });

  const handleOpenDeleteModal = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    setOpenConfirmModal(true);
    setMenuIndex(null);
  };

  const handleDeleteEmployee = () => {
    // deleteEmpMf(selectedEmployee);
    console.log("employee deleted");
    setOpenConfirmModal(false);
  };

  useEffect(() => {
    useAxios
      .get("cabs/tms/assignedCabs")
      .then((res) => setCabNumersArray(res.data.data))
      .catch((err) => console.log(err));
  }, []);

  const [usingCab, setUsingCab] = useState<string | null>("all");

  function handleUsingCab(
    _event: React.MouseEvent<HTMLElement>,
    newState: string
  ) {
    if (newState !== null) {
      setUsingCab(newState);
    }
  }

  const filteredTeamMembers = teamMemberData?.filter(
    (teamMember: EmployeeTypes) => {
      // Basic filtering logic based on search text
      const matchesSearch =
        teamMember?.fname?.toLowerCase()?.includes(searchtext.toLowerCase()) ||
        teamMember?.lname?.toLowerCase()?.includes(searchtext.toLowerCase()) ||
        teamMember?.workLocation
          ?.toLowerCase()
          ?.includes(searchtext.toLowerCase()) ||
        teamMember?.pickUp?.address
          ?.toLowerCase()
          ?.includes(searchtext.toLowerCase());

      // Filtering logic based on cab usage
      const matchesUsingCab =
        usingCab === "using"
          ? teamMember?.hasCabService // Adjust property name as per your data structure
          : usingCab === "notUsing"
          ? !teamMember?.hasCabService
          : true; // Show all if `usingCab` is `null`

      // Combine both conditions
      return matchesSearch && matchesUsingCab;
    }
  );

  // Play/Resume cab service
  const { mutate: ToggleCabService, data: toggleCabServiceData } = useMutation({
    mutationKey: ["toggle-cab-service"],
    mutationFn: async (uid: string) => {
      const response = await useAxios.patch(`/users/toggle-cab-service/${uid}`);
      console.log(response?.data?.data);
      return response?.data?.data;
    },
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: `TM's cab service has been ${
          data.hasCabService ? "resumed" : "paused"
        } successfully`,
      });

      qc.invalidateQueries({ queryKey: ["all-teamMembers"] });
      handleMenuClose();
    },
  });

  return (
    <PageContainer
      headerText={`All Team Members (${teamMemberData?.length || 0})`}
      subHeadingText="All team members that are part of your company."
      parentStyles={{}}
    >
      <Box sx={{ width: "100%", height: "50vh" }}>
        <TableContainer sx={{}}>
          <Box
            sx={{
              ...RowFlex,
              flexDirection: { xs: "column", lg: "row" },
              justifyContent: "space-between",
              gap: 2.5,
              width: "100%",
              alignItems: "center",
              mb: 2.5,
            }}
          >
            <TextField
              sx={{
                width: "40%",
              }}
              variant="outlined"
              size="small"
              autoFocus
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              placeholder="Search TMs, Address, Work Location..."
              InputProps={{
                startAdornment: (
                  <IconButton aria-label="search">
                    <Search />
                  </IconButton>
                ),
              }}
            />
            <ToggleButtonGroup
              size="medium"
              color="primary"
              value={usingCab}
              exclusive
              onChange={handleUsingCab}
            >
              <ToggleButton
                size={usingCab === "all" ? "medium" : "small"}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "5px",
                  backgroundColor:
                    usingCab === "all" ? "primary.main" : "transparent", // Default state
                  color: usingCab === "all" ? "white" : "inherit", // Adjust text color
                  "&.Mui-selected": {
                    backgroundColor: "primary.main", // Active state background
                    color: "white", // Active state text color
                    "&:hover": {
                      backgroundColor: "primary.dark", // Change on hover when active
                    },
                  },
                }}
                value="all"
              >
                All Team Members{" "}
                <Typography sx={{ color: "inherit", fontWeight: 500, ml: 1 }}>
                  {usingCab === "all" &&
                    `(${
                      filteredTeamMembers?.length
                        ? filteredTeamMembers?.length
                        : 0
                    })`}
                </Typography>
              </ToggleButton>

              <ToggleButton
                size={usingCab === "using" ? "medium" : "small"}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "5px",
                  backgroundColor:
                    usingCab === "using" ? "primary.main" : "transparent", // Default state
                  color: usingCab === "using" ? "white" : "inherit", // Adjust text color
                  "&.Mui-selected": {
                    backgroundColor: "primary.main", // Active state background
                    color: "white", // Active state text color
                    "&:hover": {
                      backgroundColor: "primary.dark", // Change on hover when active
                    },
                  },
                }}
                value="using"
              >
                Using Cab Service{" "}
                <Typography sx={{ color: "white", fontWeight: 500, ml: 1 }}>
                  {usingCab === "using" &&
                    `(${
                      filteredTeamMembers?.length
                        ? filteredTeamMembers?.length
                        : 0
                    })`}
                </Typography>
              </ToggleButton>
              <ToggleButton
                size={usingCab === "notUsing" ? "medium" : "small"}
                sx={{
                  px: 2.5,
                  py: 1,
                  borderRadius: "5px",
                  backgroundColor:
                    usingCab === "notUsing" ? "primary.main" : "transparent", // Default state
                  color: usingCab === "notUsing" ? "white" : "inherit", // Adjust text color
                  "&.Mui-selected": {
                    backgroundColor: "primary.main", // Active state background
                    color: "white", // Active state text color
                    "&:hover": {
                      backgroundColor: "primary.dark", // Change on hover when active
                    },
                  },
                }}
                value="notUsing"
              >
                Not Using Cab Service
                <Typography sx={{ color: "white", fontWeight: 500, ml: 1 }}>
                  {usingCab === "notUsing" &&
                    `(${
                      filteredTeamMembers?.length
                        ? filteredTeamMembers?.length
                        : 0
                    })`}
                </Typography>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          <Table
            sx={{ minWidth: { xs: "200%", lg: 650 } }}
            aria-label="TM's table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="center">Location</TableCell>
                <TableCell align="center">Shift</TableCell>
                <TableCell align="center">Cab</TableCell>
                <TableCell align="center">Office Location</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Cab Service</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTeamMembers?.map(
                (employee: EmployeeTypes, index: number) => {
                  const empAssignedCab: any = cabNumersArray?.find(
                    (cNum: any) => employee?._id === cNum?.id
                  );
                  return (
                    <TableRow
                      key={employee._id}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      <TableCell component="th" scope="row">
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-start",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <Avatar
                            src={baseURL + employee?.profilePicture}
                            sx={{ width: "30px", height: "30px" }}
                          />
                          {employee.fname + " " + employee.lname}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {employee.pickUp?.address}
                      </TableCell>
                      <TableCell align="center" width={"16%"}>
                        {Convert24To12HourFormat(
                          employee?.currentShift as string
                        )}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          color: empAssignedCab?.cab_number
                            ? "success.main"
                            : "error.main",
                        }}
                        align="center"
                      >
                        {empAssignedCab?.cab_number || "na"}
                      </TableCell>

                      <TableCell width={"10%"} align="center">
                        {employee.workLocation}
                      </TableCell>
                      <TableCell
                        width={"10%"}
                        sx={{
                          color: employee.isCabCancelled
                            ? "error.main"
                            : "info.main",
                          fontWeight: 600,
                        }}
                        align="center"
                      >
                        {!employee.isCabCancelled ? "In Office" : "On Leave"}
                      </TableCell>
                      <TableCell
                        width={"10%"}
                        sx={{
                          color: !employee.hasCabService
                            ? "error.main"
                            : "success.main",
                          fontWeight: 600,
                        }}
                        align="center"
                      >
                        {employee.hasCabService ? "Yes" : "No"}
                      </TableCell>
                      <TableCell align="center" sx={{ position: "relative" }}>
                        <MoreHoriz
                          sx={{ cursor: "pointer" }}
                          onClick={(e) => handleMenuOpen(e, index)}
                        />
                        <Menu
                          key={employee?._id}
                          elevation={1}
                          anchorEl={anchorEl}
                          open={menuIndex === index}
                          onClose={handleMenuClose}
                          MenuListProps={{
                            "aria-labelledby": "basic-button",
                          }}
                        >
                          <MenuItem
                            sx={{
                              ...RowFlex,
                              color: "info.main",
                              fontWeight: 600,
                              justifyContent: "flex-start",
                              gap: "10px",
                            }}
                            onClick={() =>
                              navigate(
                                `/admin/teamMemberProfile/${
                                  employee?.fname + "-" + employee?.lname
                                }`,
                                { state: employee }
                              )
                            }
                          >
                            <VisibilityIcon sx={{}} />
                            View Details
                          </MenuItem>
                          <MenuItem
                            sx={{
                              ...RowFlex,
                              color: "warning.main",
                              fontWeight: 600,
                              justifyContent: "flex-start",
                              gap: "10px",
                            }}
                            onClick={() =>
                              navigate(`/admin/editDetails/${employee?._id}`, {
                                state: employee,
                              })
                            }
                          >
                            <EditLocation sx={{}} />
                            Edit Details
                          </MenuItem>
                          <MenuItem
                            sx={{
                              ...RowFlex,
                              color: !employee?.isCabCancelled
                                ? "warning.light"
                                : "success.main",
                              fontWeight: 600,
                              justifyContent: "flex-start",
                              gap: "10px",
                            }}
                            onClick={() =>
                              // navigate(`/admin/editDetails/${employee?._id}`)
                              // console.log(employee?._id, " is marked!")
                              MarkAsAbsent(employee?._id as string)
                            }
                          >
                            <ExitToApp sx={{}} />
                            {employee?.isCabCancelled
                              ? "Mark Present"
                              : "Mark Absent"}
                          </MenuItem>
                          <MenuItem
                            sx={{
                              ...RowFlex,
                              color: employee?.hasCabService
                                ? "warning.light"
                                : "success.main",
                              fontWeight: 600,
                              justifyContent: "flex-start",
                              gap: "10px",
                            }}
                            onClick={() =>
                              ToggleCabService(employee?._id as string)
                            }
                          >
                            {employee?.hasCabService ? (
                              <Pause sx={{}} />
                            ) : (
                              <PlayArrow sx={{}} />
                            )}

                            {employee?.hasCabService
                              ? "Pause Service"
                              : "Resume Service"}
                          </MenuItem>

                          <MenuItem
                            sx={{
                              ...RowFlex,
                              color: "error.main",
                              fontWeight: 600,
                              justifyContent: "flex-start",
                              gap: "10px",
                            }}
                            onClick={() =>
                              handleOpenDeleteModal(employee._id as string)
                            }
                          >
                            <DeleteForever sx={{}} />
                            Remove Employee
                          </MenuItem>
                        </Menu>
                      </TableCell>
                    </TableRow>
                  );
                }
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <ConfirmationModal
        headerText="Confirm Your Action?"
        subHeaderText="Deleting this TM is permanent and cannot be undone. Please confirm if you wish to continue."
        openConfirmModal={openConfirmModal}
        setOpenConfirmModal={setOpenConfirmModal}
        triggerFunction={handleDeleteEmployee}
      />
    </PageContainer>
  );
}

export default AllTeamMembers;

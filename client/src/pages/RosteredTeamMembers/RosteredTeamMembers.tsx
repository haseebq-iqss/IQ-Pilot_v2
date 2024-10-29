import {
  Search,
  MoreHoriz,
  EditLocation,
  DeleteForever,
  Visibility,
  ExitToApp,
  Warning,
} from "@mui/icons-material";
import {
  Box,
  TableContainer,
  TextField,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Modal,
  Typography,
} from "@mui/material";
import PageContainer from "../../components/ui/PageContainer";
import { ColFlex, RowFlex } from "../../style_extentions/Flex";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";

function RosteredTeamMembers() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchtext, setSearchText] = useState("");
  const [cabNumersArray, setCabNumersArray] = useState<Array<string>>([]);

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  // ALL ROASTERED PASSENGERS
  const getRosteredPassengersQF = () => {
    return useAxios.get("routes/rosteredPassengers");
  };

  const { data: teamMemberData } = useQuery({
    queryKey: ["all-teamMembers"],
    queryFn: getRosteredPassengersQF,
    select: (data: any) => {
      return data.data.rostered_passengers;
    },
  });

  // Mark TM Absent
  const { mutate: MarkAsAbsent } = useMutation({
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

  const filteredTeamMembers = teamMemberData?.filter(
    (teamMember: EmployeeTypes) => {
      return (
        teamMember?.fname?.toLowerCase()?.includes(searchtext) ||
        teamMember?.lname?.toLowerCase()?.includes(searchtext) ||
        teamMember?.workLocation
          ?.toLowerCase()
          ?.includes(searchtext.toLowerCase()) ||
        teamMember?.pickUp?.address
          ?.toLowerCase()
          ?.includes(searchtext.toLowerCase())
      );
    }
  );

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

  const handleDeleteEmployee = (employeeId: string) => {
    deleteEmpMf(employeeId);
  };

  useEffect(() => {
    useAxios
      .get("cabs/tms/assignedCabs")
      .then((res) => setCabNumersArray(res.data.data))
      .catch((err) => console.log(err));
  }, []);
  return (
    <PageContainer
      headerText={`Rostered Team Member (${teamMemberData?.length || 0})`}
      options={false}
    >
      <Box sx={{ width: "100%", height: "50vh" }}>
        <TableContainer sx={{}}>
          <TextField
            sx={{
              width: "40%",
            }}
            variant="outlined"
            autoFocus
            size="small"
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
          <Table sx={{ minWidth: 650 }} aria-label="TM's table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="center">Email</TableCell>
                <TableCell align="center">Cab</TableCell>
                <TableCell align="center">Location</TableCell>
                <TableCell align="center">Office Location</TableCell>
                <TableCell align="center">Status</TableCell>
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
                      <TableCell width={"20%"} component="th" scope="row">
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
                      <TableCell align="center">{employee.email}</TableCell>
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
                      <TableCell align="center">
                        {employee.pickUp?.address}
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
                      <TableCell align="center" sx={{ position: "relative" }}>
                        <MoreHoriz
                          sx={{ cursor: "pointer" }}
                          onClick={(e: any) => handleMenuOpen(e, index)}
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
                            <Visibility sx={{}} />
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
                              navigate(`/admin/editDetails/${employee?._id}`)
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
                              color: "error.main",
                              fontWeight: 600,
                              justifyContent: "flex-start",
                              gap: "10px",
                            }}
                            onClick={() =>
                              handleDeleteEmployee(employee._id as string)
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
      <Modal
        sx={{ ...ColFlex, width: "100%", height: "100%" }}
        open={openConfirmModal ? true : false}
        // onClose={() => setOpenConfirmModal([])}
      >
        <Box
          sx={{
            ...ColFlex,
            p: "30px 10px",
            // minHeight: "40vh",
            width: { xs: "90%", lg: "35%" },
            borderRadius: "10px",
            gap: 5,
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
            backgroundColor: "background.default",
            boxShadow: "0px 10px 100px rgba(0 255 251 / 0.2)",
          }}
        >
          <Box
            sx={{
              ...ColFlex,
              width: "100%",
              textAlign: "center",
              gap: "2rem",
              marginTop: "15px",
            }}
          >
            <Warning
              sx={{ width: "50px", height: "50px", color: "warning.main" }}
            />

            <Box
              sx={{
                ...ColFlex,
                gap: 1,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={600}
                sx={{ mb: "10px", color: "text.primary" }}
              >
                Confirm Your Action
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", width: "80%" }}
              >
                Would you like to proceed with updating the routes now? Please
                confirm if you wish to continue
              </Typography>
            </Box>

            <Box sx={{ gap: 5, ...RowFlex }}>
              <Button
                sx={{
                  backgroundColor: "error.dark",
                  color: "white",
                  padding: "10px 50px",
                }}
                color="inherit"
                variant="contained"
                size="large"
                onClick={() => {
                  setOpenConfirmModal(false);
                }}
              >
                No
              </Button>
              <Button
                sx={{
                  backgroundColor: "success.dark",
                  color: "white",
                  padding: "10px 50px",
                }}
                variant="contained"
                size="large"
                onClick={handleUpdateRoute}
              >
                Yes
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </PageContainer>
  );
}

export default RosteredTeamMembers;

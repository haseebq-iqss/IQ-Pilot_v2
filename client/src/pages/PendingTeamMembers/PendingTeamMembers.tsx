import {
  Search,
  MoreHoriz,
  EditLocation,
  DeleteForever,
  Visibility,
  ExitToApp,
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
  Divider,
} from "@mui/material";
import PageContainer from "../../components/ui/PageContainer";
import { RowFlex } from "../../style_extentions/Flex";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAxios from "../../api/useAxios";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";

function PendingTeamMembers() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [searchtext, setSearchText] = useState("");
  const [cabNumersArray, setCabNumersArray] = useState<Array<string>>([]);

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  // ALL PENDING PASSENGERS
  const getPendingPassengersQF = () => {
    return useAxios.get("routes/pendingPassengers");
  };

  const { data: teamMemberData } = useQuery({
    queryKey: ["all-teamMembers"],
    queryFn: getPendingPassengersQF,
    select: (data: any) => {
      return data.data.pending_passengers;
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
        teamMember?.lname?.toLowerCase()?.includes(searchtext)
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
      headerText={`Pending Team Members (${teamMemberData?.length || 0})`}
      options={false}
    >
      <Box sx={{ width: "100%", height: "50vh" }}>
        <TableContainer sx={{}}>
          <TextField
            variant="outlined"
            size="small"
            autoFocus
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            placeholder="Search TMs"
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
                      <TableCell
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
                          >
                            <Visibility sx={{}} />
                            View Details
                          </MenuItem>
                          <Divider />
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
                          <Divider />
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
                          <Divider />
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
    </PageContainer>
  );
}

export default PendingTeamMembers;

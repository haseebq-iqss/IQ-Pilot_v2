import {
  // AddCircleOutline,
  DeleteForever,
  EditLocation,
  MoreHoriz,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Divider,
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
} from "@mui/material";
import { useState } from "react";
import PageContainer from "../../components/ui/PageContainer";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
// import useCachedData from "./../../hooks/useCachedData";
import { RowFlex } from "../../style_extentions/Flex";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";

// type driverTypes = {
//   employees: [EmployeeTypes];
// };

function AllTeamMembers() {
  const [searchtext, setSearchText] = useState("");
  const { data: teamMemberData } = useQuery({
    queryKey: ["all-teamMembers"],
    queryFn: async () => {
      const response = await useAxios.get("/users/tms");
      return response?.data?.data;
    },
  });

  const filteredTeamMembers = teamMemberData?.filter(
    (teamMember: EmployeeTypes) => {
      return teamMember?.fname?.includes(searchtext);
    }
  );
  // const cachedEmployees: driverTypes = useCachedData("All Employees");

  // const employees = cachedEmployees?.employees;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const handleMenuOpen = (e: any) => {
    setAnchorEl(e.currentTarget);
    setOpenMenu(!openMenu);
  };

  //   console.log(cachedDrivers?.drivers);

  return (
    <PageContainer
      headerText={`All Team Members (${teamMemberData?.length || 0})`}
      subHeadingText="All team members that part of your company."
      parentStyles={{}}
    >
      <Box sx={{ width: "100%", height: "50vh" }}>
        <TableContainer sx={{}}>
          <TextField
            variant="outlined"
            size="small"
            // value={searchField}
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
                <TableCell align="center">Location</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTeamMembers?.length &&
                filteredTeamMembers?.map((employee: EmployeeTypes) => (
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
                    <TableCell align="center">
                      {employee.pickUp?.address}
                    </TableCell>
                    <TableCell align="center">
                      {!employee.isCabCancelled ? "Active" : "On Leave"}
                    </TableCell>
                    <TableCell align="center" sx={{ position: "relative" }}>
                      <MoreHoriz
                        sx={{ cursor: "pointer" }}
                        onClick={handleMenuOpen}
                      />
                      {openMenu && (
                        <div
                          // elevation={1}
                          // anchorEl={anchorEl}
                          // open={openMenu}
                          // onClose={() => setOpenMenu(!openMenu)}
                          // MenuListProps={{
                          //   "aria-labelledby": "basic-button",
                          // }}
                          style={{
                            position: "absolute",
                            right: "10rem",
                            border: "1px solid red",
                            padding: "1rem",
                          }}
                          onClick={handleMenuOpen}
                        >
                          <div
                          // style={{
                          //   ...RowFlex,
                          //   color: "info.main",
                          //   fontWeight: 600,
                          //   justifyContent: "flex-start",
                          //   gap: "10px",
                          // }}
                          >
                            {/* <Visibility sx={{}} /> */}
                            {employee._id}View Details
                          </div>
                          <Divider />
                          <MenuItem
                            sx={{
                              ...RowFlex,
                              color: "warning.main",
                              fontWeight: 600,
                              justifyContent: "flex-start",
                              gap: "10px",
                            }}
                          >
                            <EditLocation sx={{}} />
                            Edit Details
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
                          >
                            <DeleteForever sx={{}} />
                            Remove Employee
                          </MenuItem>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageContainer>
  );
}

export default AllTeamMembers;

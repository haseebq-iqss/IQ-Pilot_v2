import {
  DeleteForever,
  EditLocation,
  MoreHoriz,
  Search,
  Visibility,
} from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
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
import { useEffect, useState } from "react";
import PageContainer from "../../components/ui/PageContainer";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
import { RowFlex } from "../../style_extentions/Flex";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";

function AllTeamMembers() {
  const qc = useQueryClient();
  const [searchtext, setSearchText] = useState("");
  const [cabNumersArray, setCabNumersArray] = useState<Array<string>>([]);

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

  const filteredTeamMembers = teamMemberData?.filter(
    (teamMember: EmployeeTypes) => {
      return (
        teamMember?.fname?.toLowerCase()?.includes(searchtext) ||
        teamMember?.lname?.toLowerCase()?.includes(searchtext)
      );
    }
  );

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTeamMember, setSelectedTeamMember] =
    useState<EmployeeTypes | null>(null);

  const handleMenuOpen = (e: any, teamMember: EmployeeTypes) => {
    setAnchorEl(e.currentTarget);
    setSelectedTeamMember(
      teamMember === selectedTeamMember ? null : teamMember
    );
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
    filteredTeamMembers?.map((emp: EmployeeTypes) => {
      const id = emp?._id;
      useAxios
        .get(`users/tm/cab/${id}`)
        .then((res) =>
          setCabNumersArray((prevArray: any) => [
            ...prevArray,
            {
              id,
              cabNum: res?.data?.found_route
                ? res?.data?.found_route?.cab?.cabNumber
                : "na",
            },
          ])
        )
        .catch((err) => console.log(err));
    });
    // console.log(cabNumersArray);
  }, []);

  // console.log(cabNumersArray);

  // async (empId) => {

  //   const raw = filteredTeamMembers.map((emp:EmployeeTypes) => {
  //     console.log(emp?._id)
  //   })

  //     const res = await useAxios.get(`users/tm/cab/${empId}`);
  //     const data = res.data;
  //     if (data?.found_route) {
  //       setCabNumersArray((prevNumsArray) => [
  //         ...prevNumsArray,
  //         data?.found_route.cab.cabNumber,
  //       ]);
  //     } else {
  //       setCabNumersArray((prevNumsArray) => [...prevNumsArray, "NA"]);
  //     }
  //   }
  // }

  return (
    <PageContainer
      headerText={`All Team Members (${teamMemberData?.length || 0})`}
      subHeadingText="All team members that are part of your company."
      parentStyles={{}}
    >
      <Box sx={{ width: "100%", height: "50vh" }}>
        <TableContainer sx={{}}>
          <TextField
            variant="outlined"
            size="small"
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
              {filteredTeamMembers?.map((employee: EmployeeTypes) => {
                // GetTMsCab(employee._id);
                const oj = cabNumersArray?.find((obj) => {
                  return obj.id === employee?._id;
                });
                const result = oj?.cabNum;
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
                    <TableCell align="center">{result}</TableCell>
                    <TableCell align="center">
                      {employee.pickUp?.address}
                    </TableCell>
                    <TableCell align="center">
                      {!employee.isCabCancelled ? "Active" : "On Leave"}
                    </TableCell>
                    <TableCell align="center" sx={{ position: "relative" }}>
                      <MoreHoriz
                        sx={{ cursor: "pointer" }}
                        onClick={(e) => handleMenuOpen(e, employee)}
                      />
                      {selectedTeamMember === employee && (
                        <div
                          style={{
                            position: "absolute",
                            borderRadius: "10px",
                            right: "3rem",
                            boxShadow:
                              "rgba(0, 0, 0, 0.2) 0px 2px 1px -1px, rgba(0, 0, 0, 0.14) 0px 1px 1px 0px, rgba(0, 0, 0, 0.12) 0px 1px 3px 0px",
                            padding: "8px 0px",
                            backgroundColor: "white",
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
                            <VisibilityIcon sx={{}} />
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
                            onClick={() =>
                              handleDeleteEmployee(employee._id as string)
                            }
                          >
                            <DeleteForever sx={{}} />
                            Remove Employee
                          </MenuItem>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageContainer>
  );
}

export default AllTeamMembers;

// @ts-nocheck
import {
  DeleteForever,
  EditLocation,
  MoreHoriz,
  Search,
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
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useContext, useState } from "react";
import PageContainer from "../../components/ui/PageContainer";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
import { RowFlex } from "../../style_extentions/Flex";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";
import Cabtypes from "../../types/CabTypes";
import { useNavigate } from "react-router-dom";
import SnackbarContext from "../../context/SnackbarContext";
import { SnackBarContextTypes } from "../../types/SnackbarTypes";

// type driverTypes = {
//   drivers: [EmployeeTypes];
// };

function InactiveCabs() {
  const [searchtext, setSearchText] = useState("");
  const qc = useQueryClient();
  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const navigate = useNavigate();

  // ALL AVAILABLE CABS
  const getAllCabsQF = async () => {
    const response = await useAxios.get("cabs/availableCabs");
    return response.data?.data;
  };

  const { data: allCabs, status: allCabStatus } = useQuery({
    queryFn: getAllCabsQF,
    queryKey: ["All Cabs"],
  });

  const filteredCabDrivers = allCabs?.filter((cab: Cabtypes) => {
    return (
      (cab?.cabDriver[0] as EmployeeTypes)?.fname
        ?.toLowerCase()
        ?.includes(searchtext?.toLowerCase()) ||
      (cab?.cabDriver[0] as EmployeeTypes)?.lname
        ?.toLowerCase()
        ?.includes(searchtext?.toLowerCase())
    );
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

  const handleDriverProfilePage = (driverID: string) => {
    navigate(`/admin/driverProfile/${driverID}`);
  };

  const handleDeleteEmployee = (employeeId: string) => {
    deleteEmpMf(employeeId);
  };
  const { mutate: deleteEmpMf } = useMutation({
    mutationKey: ["delete-driver"],
    mutationFn: async (driverID: string) => {
      await useAxios.delete(`/cabs/${driverID}`);
    },
    onSuccess: (data) => {
      setOpenSnack({
        open: true,
        message: "Driver was deleted!",
        severity: "info",
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["all-cabs"] });
    },
  });
  return (
    <PageContainer
      headerText={`Inactive / Available Cabs (${allCabs?.length || 0})`}
      subHeadingText="All available cab drivers that are part of your company"
      parentStyles={{}}
    >
      <Box
        sx={{
          width: "100%",
          height: "50vh",
        }}
      >
        <TableContainer sx={{}}>
          <TextField
            variant="outlined"
            autoFocus
            size="small"
            onChange={(e) => {
              setSearchText(e.target.value);
            }}
            placeholder="Search Drivers"
            InputProps={{
              startAdornment: (
                <IconButton aria-label="search">
                  <Search />
                </IconButton>
              ),
            }}
          />
          <Table sx={{ minWidth: 650 }} aria-label="driver's table">
            <TableHead>
              <TableRow>
                <TableCell>Driver</TableCell>
                <TableCell align="center">Cab Number</TableCell>
                <TableCell align="center">Number Plate</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCabDrivers?.map((driver: Cabtypes, index: number) => (
                <TableRow
                  key={driver?.cabDriver[0]._id}
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
                        src={
                          baseURL +
                          (driver?.cabDriver[0] as EmployeeTypes)
                            ?.profilePicture
                        }
                        sx={{ width: "30px", height: "30px" }}
                      />
                      {(driver?.cabDriver[0] as EmployeeTypes)?.fname +
                        " " +
                        (driver?.cabDriver[0] as EmployeeTypes)?.lname}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">
                    {driver?.cabNumber}
                  </TableCell>
                  <TableCell align="center">{driver?.numberPlate}</TableCell>
                  <TableCell align="center">
                    {!(driver?.cabDriver as EmployeeTypes)?.isCabCancelled
                      ? "Active"
                      : "Suspended"}
                  </TableCell>
                  <TableCell align="center" sx={{ position: "relative" }}>
                    <MoreHoriz
                      sx={{ cursor: "pointer" }}
                      onClick={(e) => handleMenuOpen(e, index)}
                    />
                    <Menu
                      key={driver?._id}
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
                        onClick={() => {
                          handleDriverProfilePage(driver?._id as string);
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
                        onClick={() =>
                          navigate(
                            `/admin/editDetails/${driver?.cabDriver?._id}`
                          )
                        }
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
                          handleDeleteEmployee(driver._id as string)
                        }
                      >
                        <DeleteForever sx={{}} />
                        Remove Employee
                      </MenuItem>
                    </Menu>
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

export default InactiveCabs;
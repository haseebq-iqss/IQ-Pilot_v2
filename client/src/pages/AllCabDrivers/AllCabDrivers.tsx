import {
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
import { MouseEventHandler, useState } from "react";
import PageContainer from "../../components/ui/PageContainer";
import EmployeeTypes from "../../types/EmployeeTypes";
import baseURL from "../../utils/baseURL";
import useCachedData from "./../../hooks/useCachedData";
import { RowFlex } from "../../style_extentions/Flex";
import { useQuery } from "@tanstack/react-query";
import useAxios from "../../api/useAxios";

type driverTypes = {
  drivers: [EmployeeTypes];
};

function AllCabDrivers() {
  const [searchtext, setSearchText] = useState("");
  const { data: driverData, status } = useQuery({
    queryKey: ["all-drivers"],
    queryFn: async () => {
      const response = await useAxios.get("/users/drivers");
      return response?.data?.data;
    },
  });

  const cachedDrivers: driverTypes = useCachedData("All Cabs");

  const filteredCabDrivers = driverData?.filter((driver: EmployeeTypes) => {
    return driver?.fname?.includes(searchtext);
  });
  // const drivers = cachedDrivers?.drivers;

  const [anchorEl, setAnchorEl] = useState<null | SVGSVGElement>(null);
  const [openMenu, setOpenMenu] = useState<boolean>(false);

  const handleMenuOpen: MouseEventHandler<SVGSVGElement> = (e) => {
    setAnchorEl(e.currentTarget);
    setOpenMenu(!openMenu);
  };

  //   console.log(cachedDrivers?.drivers);

  return (
    <PageContainer
      headerText={`All Cab Drivers (${driverData?.length || 0})`}
      subHeadingText="All cab drivers that part of your company."
      parentStyles={{}}
    >
      <Box
        sx={{
          // ...ColFlex,
          width: "100%",
          height: "50vh",
        }}
      >
        <TableContainer sx={{}}>
          <TextField
            variant="outlined"
            size="small"
            // value={searchField}
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
              {filteredCabDrivers?.length &&
                filteredCabDrivers?.map((driver: EmployeeTypes) => (
                  <TableRow
                    key={driver._id}
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
                          src={baseURL + driver?.profilePicture}
                          sx={{ width: "30px", height: "30px" }}
                        />
                        {driver?.fname + " " + driver?.lname}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {"driver.cabDetails?.cabNumber"}
                    </TableCell>
                    <TableCell align="center">
                      {"driver.cabDetails?.numberPlate"}
                    </TableCell>
                    <TableCell align="center">
                      {'!driver.cancelCab ? "Active" : "Suspended"'}
                    </TableCell>
                    <TableCell align="center">
                      <MoreHoriz
                        sx={{ cursor: "pointer" }}
                        onClick={handleMenuOpen}
                      />
                      <Menu
                        elevation={1}
                        anchorEl={anchorEl}
                        open={openMenu}
                        onClose={() => setOpenMenu(!openMenu)}
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
                          Remove Driver
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

export default AllCabDrivers;

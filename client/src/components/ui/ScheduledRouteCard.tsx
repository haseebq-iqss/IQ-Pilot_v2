import {
  Avatar,
  Box,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ColFlex, RowFlex } from "../../style_extentions/Flex.ts";
import baseURL from "../../utils/baseURL.ts";
import EmployeeTypes from "./../../types/EmployeeTypes";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { ShiftTypes } from "../../types/ShiftTypes.ts";
import { useDroppable } from "@dnd-kit/core";
import {
  DirectionsCar,
  FormatColorFill,
  GroupRemove,
  Groups2,
  LocationOn,
  Map,
  NoTransfer,
  PersonSearch,
  Search,
  Tag,
  Tune,
} from "@mui/icons-material";
import MapComponent from "../Map.tsx";
import AssignedPassengers from "./AssignedPassengers.tsx";
import { SlideInOut } from "../../animations/transition.tsx";
import GlobalModal from "./Modal";
import useAxios from "../../api/useAxios.ts";
import { useQuery } from "@tanstack/react-query";
import EmployeeTab from "./EmployeeTab.tsx";
type RosterCardTypes = {
  passengerDetails: EmployeeTypes[];
  column: ShiftTypes;
  passengersSetter: any;
};

const RosterCard = ({
  passengerDetails,
  column,
  passengersSetter,
}: RosterCardTypes) => {
  const [activeRouteCoords, setActiveRouteCoords] = useState<Array<any>>([]);
  const [mapVisible, setMapVisible] = useState<boolean>(false);

  const [openAddExternalTmModal, setOpenAddExternalTmModal] =
    useState<boolean>(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuIndex, setMenuIndex] = useState<number | null>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    // console.log(event);
    setMenuIndex(index);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuIndex(null);
  };

  // console.log(column);

  const handleViewMap = () => {
    setMapVisible(!mapVisible);
    handleMenuClose();
  };

  const handleSearchAndAddTM = () => {
    // setMapVisible(!mapVisible);
    setOpenAddExternalTmModal(true);
    handleMenuClose();
  };

  const handleClearCab = () => {
    // setMapVisible(!mapVisible);
    handleMenuClose();
  };

  const handleRemoveCab = () => {
    // setMapVisible(!mapVisible);
    handleMenuClose();
  };

  useEffect(() => {
    const activeRouteCoordinates: any = passengerDetails?.map(
      (employee: EmployeeTypes) => employee?.pickUp?.coordinates
    );

    setActiveRouteCoords(activeRouteCoordinates);
  }, [passengerDetails]);

  const routesCP: any = activeRouteCoords.slice(
    0,
    activeRouteCoords.length / 2
  );
  const routesCentralPoint: any = routesCP.at(-1);

  const tasksIds = useMemo(() => {
    return passengerDetails.map((passenger) => passenger.id);
  }, [passengerDetails]);

  const { setNodeRef } = useDroppable({
    id: column?.id,
    data: {
      type: "Column",
      column: { ...column, passengers: passengerDetails },
    },
  });

  // ALL PENDING PASSENGERS
  const getPendingPassengersQF = () => {
    return useAxios.get("routes/pendingPassengers");
  };

  const { data: pendingPassengers, status: pendingPassengersStatus } = useQuery(
    {
      queryFn: getPendingPassengersQF,
      queryKey: ["All Pending Passengers"],
      select: (data) => {
        return data.data.pending_passengers;
      },
    }
  );

  const handleAddNewPassenger = (newPassenger: EmployeeTypes) => {
    (newPassenger as any).columnId = column?.id;
    (newPassenger as any).id = newPassenger?._id;
    // console.log(newPassenger)
    setOpenAddExternalTmModal(false);
    passengersSetter((prevPassengers: any) => [
      newPassenger,
      ...prevPassengers,
    ]);
  };

  const cardRef = useRef(null);
  const handleRightClick = (event: any) => {
    event.preventDefault(); // Prevent the default right-click menu

    // Simulate the event object using the cardRef
    console.log(cardRef.current);
    if (cardRef.current) {
      const simulatedEvent: any = { currentTarget: cardRef.current };
      handleMenuOpen(simulatedEvent, 12);
    } else {
      console.warn("Card reference is not available.");
    }
  };

  const [searchtext, setSearchText] = useState("");

  const filteredTeamMembers = pendingPassengers?.filter(
    (teamMember: EmployeeTypes) => {
      return (
        teamMember?.fname?.toLowerCase()?.includes(searchtext.toLowerCase()) ||
        teamMember?.lname?.toLowerCase()?.includes(searchtext.toLowerCase()) ||
        teamMember?.pickUp?.address?.toLowerCase()?.includes(searchtext.toLowerCase()) ||
        teamMember?.workLocation?.toLowerCase()?.includes(searchtext.toLowerCase())
      );
    }
  );

  return (
    <Box
      sx={{
        ...ColFlex,
        // minWidth: "30.5vw",
        // maxWidth: "32vw",
        width: "100%",
        height: mapVisible ? "100%" : "50%",
        flexDirection: "column",
        p: "20px",
        borderRadius: "15px",
        backgroundColor: "background.default",
        boxShadow:
          passengerDetails?.length !== column?.cab?.seatingCapacity
            ? "0px 9px 10px rgba(227 0 0 / 0.30)"
            : "none",

        scale: "0.975",
        color: "text.primary",
        transition: "all 1s",
        justifyContent: "flex-start",
        border:
          passengerDetails?.length === column?.cab?.seatingCapacity
            ? "none"
            : "3px solid rgba(255 0 0 / 0.66)",
        gap: "0.5rem",
        overflow: "hidden",
      }}
      ref={setNodeRef}
      onContextMenu={handleRightClick}
    >
      {/* ADD TEAM MEMBER MODAL */}
      <GlobalModal
        headerText="Search & Add Team Memeber"
        openModal={openAddExternalTmModal}
        setOpenModal={setOpenAddExternalTmModal}
      >
        <Box
          sx={{
            ...ColFlex,
            width: "100%",
            justifyContent: "flex-start",
            height: "100%",
            padding: "1rem",
          }}
        >
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              gap:2.5,
            }}
          >
            <TextField
              variant="outlined"
              size="medium"
              sx={{ width: "65%" }}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              placeholder="Search Team Members, Work Locations or Addresses"
              InputProps={{
                startAdornment: (
                  <IconButton aria-label="search">
                    <Search />
                  </IconButton>
                ),
              }}
            />
            <Box sx={{...ColFlex, width: "20%", alignItems:"flex-start"}}>
            <Typography sx={{color:"white"}} variant="h5">{filteredTeamMembers?.length} Found</Typography>
            <Typography sx={{color:"white"}} variant="body2">Unrostered TMs</Typography>
            </Box>
          </Box>
          <Box
            sx={{
              ...ColFlex,
              height: "75%",
              width: "75%",
              overflowY: "scroll",
              scrollbarWidth: "none", // For Firefox
              msOverflowStyle: "none", // For Internet Explorer and Edge
              justifyContent: "flex-start",
              gap: "1rem",
              pt: 2.5,
            }}
          >
            {pendingPassengersStatus === "success" &&
              filteredTeamMembers?.map((passenger: EmployeeTypes) => {
                return (
                  <EmployeeTab
                    passenger={passenger}
                    newEmployeeSetter={handleAddNewPassenger}
                    key={passenger._id}
                  />
                );
              })}
          </Box>
        </Box>
      </GlobalModal>
      {/* Center Box for Right Click Menu */}
      <Box
        ref={cardRef}
        sx={{
          position: "absolute",
          textAlign: "center",
          top: "50%",
          left: "50%",
        }}
      />
      <Box
        sx={{
          ...RowFlex,
          gap: "1rem",
          justifyContent: "start",
          width: "100%",
        }}
      >
        <Box>
          <Avatar
            src={baseURL + (column.cab?.cabDriver as any)?.profilePicture}
          ></Avatar>
        </Box>
        <Box sx={{ ...ColFlex, alignItems: "flex-start" }}>
          <Box>
            <Typography variant="h6" fontWeight={600} sx={{ fontSize: "1rem" }}>
              {(column.cab?.cabDriver as any)?.fname +
                " " +
                (column.cab?.cabDriver as any)?.lname}
            </Typography>
          </Box>
          <Box
            sx={{
              ...RowFlex,
              justifyContent: "space-between",
              width: "100%",
              gap: 2.5,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                color: "orange",
              }}
              fontWeight={500}
            >
              <Tag
                sx={{
                  width: "15px",
                  height: "15px",
                  mr: "2px",
                  color: "orange",
                }}
              />
              {column?.cab?.cabNumber}
            </Typography>

            <Typography
              sx={{
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                color: "primary.main",
              }}
              fontWeight={500}
            >
              <Groups2
                sx={{
                  width: "15px",
                  height: "15px",
                  mr: "2px",
                  color: "primary.main",
                }}
              />
              {column?.cab?.seatingCapacity}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                color: column?.cab?.carColor,
                textShadow:
                  "#FFF 0px 0px 10px, #FF2D95 0px 0px 40px, -24px 5px 3px rgba(206,89,55,0);",
              }}
              fontWeight={500}
            >
              <FormatColorFill
                sx={{
                  width: "15px",
                  height: "15px",
                  mr: "2px",
                  color: column?.cab?.carColor,
                }}
              />
              {column?.cab?.carColor}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                color: "text.primary",
              }}
              fontWeight={500}
            >
              <DirectionsCar
                sx={{
                  width: "15px",
                  height: "15px",
                  mr: "2px",
                  color: "text.primary",
                }}
              />
              {column?.cab?.numberPlate}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.75rem",
                display: "flex",
                alignItems: "center",
                color: "text.primary",
              }}
              fontWeight={500}
            >
              <LocationOn
                sx={{
                  width: "15px",
                  height: "15px",
                  mr: "2px",
                  color: "secondary.main",
                }}
              />
              {column?.workLocation}
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            ...RowFlex,
            justifyContent: "flex-end",
            width: "100%",
            alignItems: "end",
            my: 2,
            mb: 0,
            gap: "0.8rem",
          }}
        >
          <Typography fontSize={18} fontWeight={600} sx={{ mr: 2.5 }}>
            <span
              style={{
                color:
                  passengerDetails?.length !== column?.cab?.seatingCapacity
                    ? "crimson"
                    : "#2997FC",
              }}
            >
              {passengerDetails?.length +
                " " +
                "out of " +
                column?.cab?.seatingCapacity}
            </span>{" "}
            Seats Used
          </Typography>
          <Tune
            sx={{ cursor: "pointer" }}
            onClick={(e: any) => handleMenuOpen(e, 12)}
          />
          <Menu
            key={column?.cab?._id}
            elevation={1}
            anchorEl={anchorEl}
            open={Boolean(menuIndex)}
            onClose={handleMenuClose}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}
          >
            <SlideInOut duration={0.3} delay={0}>
              <MenuItem
                sx={{ ...RowFlex, justifyContent: "flex-start", gap: 1 }}
                onClick={handleViewMap}
              >
                <Map sx={{ color: "primary.main", mr: 1 }} />
                {mapVisible ? "Hide Map" : "View Map"}
              </MenuItem>
            </SlideInOut>
            <SlideInOut duration={0.3} delay={0.15}>
              <MenuItem
                sx={{ ...RowFlex, justifyContent: "flex-start", gap: 1 }}
                onClick={handleSearchAndAddTM}
              >
                <PersonSearch sx={{ color: "info.main", mr: 1 }} />
                Search and Add TM
              </MenuItem>
            </SlideInOut>
            <SlideInOut duration={0.3} delay={0.3}>
              <MenuItem
                // onClick={AddNewTM}
                sx={{ ...RowFlex, justifyContent: "flex-start", gap: 1 }}
                onClick={handleClearCab}
              >
                <GroupRemove sx={{ color: "warning.main", mr: 1 }} />
                Clear Cab
              </MenuItem>
            </SlideInOut>
            <SlideInOut duration={0.3} delay={0.45}>
              <MenuItem
                sx={{ ...RowFlex, justifyContent: "flex-start", gap: 1 }}
                onClick={handleRemoveCab}
              >
                <NoTransfer sx={{ color: "error.main", mr: 1 }} />
                Remove Cab
              </MenuItem>
            </SlideInOut>
          </Menu>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          // height: "100%",
          borderRadius: "10px",
          border: "none",
        }}
      >
        <Box
          className="child-scroll"
          sx={{
            ...RowFlex,
            alignItems: "flex-start",
            width: "100%",
            height: "100%",
            gap: 1.5,
            justifyContent: "flex-start",
            overflowY: "auto",
            px: 1,
            py: 1.2,
            borderRadius: "1rem",
            transition: "all 0.5s ease-in",
            // backgroundColor: "primary.main",
            flexWrap: "wrap",
          }}
        >
          <SortableContext
            items={tasksIds}
            strategy={verticalListSortingStrategy}
          >
            {passengerDetails?.map((passenger: EmployeeTypes) => (
              <AssignedPassengers passenger={passenger} key={passenger.id} />
            ))}
          </SortableContext>
        </Box>
      </Box>

      {mapVisible && (
        <Box
          className="child-scroll"
          sx={{
            ...ColFlex,
            mt: 1,
            borderRadius: 2,
            alignItems: "flex-start",
            width: "100%",
            height: "50%",
            justifyContent: "flex-start",
          }}
        >
          <Typography variant="body2" fontWeight={600} sx={{color:"primary.main", alignSelf:"flex-end", cursor:"pointer"}} onClick={handleViewMap}>Collapse Map</Typography>
          <MapComponent
            // height="100%"
            mode="route-view"
            activeRoute={
              column.workLocation === "Rangreth"
                ? [...activeRouteCoords, [33.996807, 74.79202]]
                : [...activeRouteCoords, [34.173415, 74.808653]]
            }
            zoom={11}
            center={routesCentralPoint}
          />
        </Box>
      )}
    </Box>
  );
};

export default RosterCard;

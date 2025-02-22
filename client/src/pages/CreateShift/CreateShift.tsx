// @ts-nocheck
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex.ts";
import LogoImage from "/images/logo.png";
import RosterCard from "../../components/ui/RosterCard.tsx";
import { ShiftTypes } from "../../types/ShiftTypes.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import Cabtypes from "../../types/CabTypes.ts";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../api/useAxios.ts";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, arrayMove } from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import PassengerTab from "../../components/ui/PassengerTab.tsx";
import ReserveModal from "../../components/ui/ReserveModal.tsx";
import ConvertShiftTimeTo12HrFormat from "../../utils/12HourFormat.ts";
import ReservedPassengersTab from "../../components/ui/ReservedPassengersTab.tsx";
import Loading from "../../components/ui/Loading.tsx";
import SnackbarContext from "../../context/SnackbarContext.ts";
import { SnackBarContextTypes } from "../../types/SnackbarTypes.ts";
import { ArrowBackIos, Add, Search } from "@mui/icons-material";
import isXSmall from "../../utils/isXSmall.ts";
import NoticeModal from "../../components/ui/NoticeModal.tsx";
import formatDateString from "../../utils/DateFormatter.ts";
import GlobalModal from "../../components/ui/Modal.tsx";
import DriverCard from "../../components/ui/DriverCard.tsx";

function CreateShift() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const location = useLocation();
  const routeState = location?.state;

  if (!routeState) {
    navigate("-1");
  }

  const routeType = routeState?.data?.typeOfRoute;
  const routeTiming = routeState?.data?.currentShift;
  const routeLocation = routeState?.data?.workLocation;
  // console.log(routeState.data.data[0].passengers);
  // console.log(routeTiming, routeLocation);

  const [availableTMs, setavailableTMs] = useState<[any]>([]);
  const [availableDrivers, setavailableDrivers] = useState<[any]>([]);

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

  const fetchAvailableDrivers = async () => {
    try {
      const response = await useAxios.get("/cabs/availableCabs");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching available drivers:", error);
    }
  };
  const { data: getDrivers } = useQuery({
    queryKey: ["all-drivers"],
    queryFn: fetchAvailableDrivers,
  });

  const unoccupiedDrivers = getDrivers?.filter((item) => {
    const driverId = item?.cabDriver?.[0]?._id;
    return (
      driverId &&
      !routeState.data.data.some((occupiedItem) => {
        return occupiedItem?.cab?.cabDriver?.[0]?._id === driverId;
      })
    );
  });

  const tmsInShift = () => {
    if (routeState.data.data) {
      // Extract TMs which are being rostered
      const tmsArray = [];
      const tms = routeState.data.data.map((route: any) => {
        tmsArray.push(...route.passengers);
      });

      // Extract thier IDs in a Set
      const tmsIdSet = new Set();
      tmsArray.map((tm: any) => {
        tmsIdSet.add(tm._id);
      });

      // Return the Set
      return tmsIdSet;
    }
  };

  const tmIdsSet = tmsInShift();

  useEffect(() => {
    setavailableTMs(() =>
      pendingPassengers?.filter((emp: EmployeeTypes) => {
        if (routeType == "drop") {
          return (
            emp?.currentShift?.split("-")[1] == routeTiming &&
            emp?.workLocation == routeLocation &&
            !tmIdsSet?.has(emp._id)
          );
        } else {
          return (
            emp?.currentShift?.split("-")[0] == routeTiming &&
            emp?.workLocation == routeLocation &&
            !tmIdsSet?.has(emp._id)
          );
        }
      })
    );
    setavailableDrivers(unoccupiedDrivers);
  }, [pendingPassengers, getDrivers]);

  const { isSM, isMD } = isXSmall();

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);
  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);

  const [activeColumn, setActiveColumn] = useState<ShiftTypes | null>(null);
  const [isLoaderEnabled, setIsLoaderEnabled] = useState<boolean>(false);

  const [activeTask, setActiveTask] = useState<EmployeeTypes | null>(null);

  // console.log(routeState?.data);

  const [columns, setColumns] = useState([
    ...((routeState?.data?.data || []).map(
      (shift: ShiftTypes, index: number) => ({
        ...shift,
        id: `Roster${index.toString()}`,
        currentShift: routeState?.data.currentShift,
        workLocation: routeState?.data.workLocation,
        typeOfRoute: routeState?.data.typeOfRoute,
      })
    ) || []),
  ]);
  const [reservedColumn, setReservedColumn] = useState([
    {
      id: "reserved",
      passengers: [],
    },
  ]);

  const currentLocation = window.location.pathname;

  // useEffect(() => {
  // if (window.location.pathname.includes("createShift")) {
  //   window.onpopstate = (event) => {
  //     alert("Data will be lost !");
  //   };
  // }
  // }, []);

  const [reservedPassengers, setReservedPassengers] = useState(() => {
    return reservedColumn.flatMap((column) => column.passengers) || [];
  });

  const [activeReserveTask, setActiveReserveTask] = useState(null);
  const [activeReserveColumn, setActiveReserveColumn] = useState(null);

  const [passengers, setPassengers] = useState(() => {
    if (!routeState?.data?.data) return [];

    return columns?.flatMap((shift: ShiftTypes) =>
      shift?.passengers!.map((passenger, index) => ({
        ...passenger,
        id: passenger._id || index.toString(),
        columnId: shift.id,
      }))
    );
  });

  const regularColumns = columns.filter((column) => column.name !== "reserved");
  // console.log(columns);

  const { mutate } = useMutation({
    mutationFn: async (data) => {
      try {
        const response = await useAxios.post("routes/", data);
        if (response?.status === 201) {
          navigate("/admin");
        }
      } catch (error) {
        console.error("Error creating route:", error);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["all-routes"] });
    },
    onError: () => {
      setOpenSnack({
        open: true,
        message: "Error creating route",
        severity: "error",
      });
    },
  });

  // const mapCoordinatesToText = (value: string) => {
  //   switch (value) {
  //     case "[34.07918418861709, 74.76795882716988]":
  //       return "Bemina Area";
  //     case "[34.07884610905441, 74.77249651656975]":
  //       return "Lal Bazar Area";
  //     case "[34.084051032954854, 74.79703437982327]":
  //       return "Karanagar Area";
  //     case "[34.01011349472341, 74.79879001141188]":
  //       return "Rangreth Area";
  //     case "[34.13990801842636, 74.80077605668806]":
  //       return "Soura Area";
  //     default:
  //       return "Unknown Area";
  //   }
  // };

  const combinedData: {
    cab: Cabtypes;
    passengers: EmployeeTypes[];
    availableCapacity: number;
  }[] = [];

  columns.forEach((column: ShiftTypes) => {
    const columnPassengers = passengers.filter(
      (passenger: EmployeeTypes) => passenger.columnId === column.id
    );
    combinedData.push({
      cab: column.cab as Cabtypes,
      passengers: columnPassengers,
      availableCapacity:
        column.cab!.seatingCapacity! - columnPassengers?.length,
    });
  });

  const handleCreateRoute = () => {
    const dataToDeploy: any = {
      cabEmployeeGroups: combinedData,
      workLocation: routeState?.data?.workLocation,
      currentShift: routeState?.data?.currentShift,
      typeOfRoute: routeState?.data?.typeOfRoute,
      // daysRouteIsActive: routeState?.data?.daysRouteIsActive,
      // activationMode: routeState?.data?.activationMode,
      // nextAvailableStartDate: routeState?.data?.nextAvailableStartDate,
    };
    setIsLoaderEnabled(true);
    showLoader();
    setTimeout(() => {
      mutate(dataToDeploy);
      // console.log(dataToDeploy)
    }, 1500);
  };

  const showLoader = () => {
    setTimeout(() => {
      setIsLoaderEnabled(false);
      setOpenSnack({
        open: true,
        message: `Shift Generation for ${formatDateString(
          routeState?.data?.scheduledForDate
        )} was Successful. 🎉`,
        severity: "success",
      });
    }, 3000);
  };

  const confirmRoute = () => {
    setOpenConfirmModal(true);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 30,
      },
    })
  );

  const getPassengerPos = (id: UniqueIdentifier, passengers: EmployeeTypes[]) =>
    passengers.findIndex((passenger: EmployeeTypes) => passenger._id === id);

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isActiveAReserveTask = active.data.current?.type === "Reserved-Task";
    const isOverATask = over.data.current?.type === "Task";
    const isOverAReserveColumn = over.data.current?.type === "Reserve-Column";
    const isOverAReserveTask = over.data.current?.type === "Reserved-Task";
    const isOverAColumn = over.data.current?.type === "Column";

    if (!isActiveATask && !isActiveAReserveTask) return;

    const targetColumn = combinedData.find((column) =>
      column.passengers.some(
        (passenger: EmployeeTypes) => passenger._id === overId
      )
    );

    // Move from Task column to Task column
    if (
      (isActiveATask && isOverATask && targetColumn?.availableCapacity !== 0) ||
      isOverAColumn
    ) {
      setPassengers((passengers: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId, passengers);
        const overIndex = getPassengerPos(overId, passengers);

        if (
          passengers[activeIndex]?.columnId !== passengers[overIndex]?.columnId
        ) {
          const newColumnId =
            passengers[overIndex]?.columnId || (overId as string);
          if (
            !passengers.some(
              (p) => p.id === activeId && p.columnId === newColumnId
            )
          ) {
            passengers[activeIndex].columnId = newColumnId;
          }
          return arrayMove(passengers, activeIndex, overIndex - 1);
        }

        return arrayMove(passengers, activeIndex, overIndex);
      });
    }

    if (isActiveATask && (isOverAReserveColumn || isOverAReserveTask)) {
      setPassengers((prevPassengers: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId, prevPassengers);
        const passenger = prevPassengers[activeIndex];

        const updatedPassenger = {
          ...passenger,
          columnId: "reserved" as string,
        };

        const updatedPassengers = [
          ...prevPassengers.slice(0, activeIndex),
          ...prevPassengers.slice(activeIndex + 1),
        ];

        setReservedColumn((prevColumns) => {
          return prevColumns.map((column) => {
            if (column.id === "reserved") {
              if (!column.passengers.some((p) => p.id === activeId)) {
                return {
                  ...column,
                  passengers: [...column.passengers, updatedPassenger],
                };
              }
            }
            return column;
          });
        });

        setReservedPassengers((prevReserved: EmployeeTypes[]) => {
          if (!prevReserved.some((p) => p.id === activeId)) {
            return [...prevReserved, updatedPassenger];
          }
          return prevReserved;
        });

        return updatedPassengers;
      });
    }

    // Move from Reserve column to Task column
    const updatePassengerAndColumns = (
      prevReserved,
      activeId,
      overId,
      targetColumnId
    ) => {
      const activeIndex = getPassengerPos(activeId, prevReserved);
      if (activeIndex === -1) return prevReserved; // Handle case where activeId is not found

      const passenger = prevReserved[activeIndex];

      // Remove the active passenger from the reserved list
      const updatedReservedPassengers = prevReserved.filter(
        (_, index) => index !== activeIndex
      );

      // Create an updated passenger object with the new column ID
      const updatedPassenger = { ...passenger, columnId: targetColumnId };

      // Update the passengers list with the updated passenger if it's not already present
      setPassengers((prevPassengers) => {
        if (!prevPassengers.some((p) => p.id === activeId)) {
          return [...prevPassengers, updatedPassenger];
        }
        return prevPassengers;
      });

      // Remove the passenger from the reserved column
      setReservedColumn((prevColumns) =>
        prevColumns.map((column) =>
          column.id === "reserved"
            ? {
                ...column,
                passengers: column.passengers.filter((p) => p.id !== activeId),
              }
            : column
        )
      );

      return updatedReservedPassengers;
    };

    // Move from Reserve column to Task column
    if (
      (isActiveAReserveTask &&
        isOverATask &&
        targetColumn?.availableCapacity !== 0) ||
      isOverAColumn
    ) {
      setReservedPassengers((prevReserved: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId, prevReserved);
        const passenger = prevReserved[activeIndex];

        const updatedReservedPassengers = [
          ...prevReserved.slice(0, activeIndex),
          ...prevReserved.slice(activeIndex + 1),
        ];

        const targetColumnId = passengers.find((p) => p?.id === overId)
          ?.columnId as string;

        const updatedPassengerColumnId = targetColumnId || overId;

        const updatedPassenger = {
          ...passenger,
          columnId: updatedPassengerColumnId,
        };

        setPassengers((prevPassengers: EmployeeTypes[]) => {
          if (!prevPassengers.some((p) => p.id === activeId)) {
            return [...prevPassengers, updatedPassenger];
          }
          return prevPassengers;
        });

        setReservedColumn((prevColumns) => {
          return prevColumns.map((column) => {
            if (column.id === "reserved") {
              return {
                ...column,
                passengers: column.passengers.filter((p) => p.id !== activeId),
              };
            }
            return column;
          });
        });

        return updatedReservedPassengers;
      });
    }

    if (isActiveAReserveTask && isOverAReserveTask) {
      setReservedPassengers((prevReserved: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId, prevReserved);
        const overIndex = getPassengerPos(overId, prevReserved);
        return arrayMove(prevReserved, activeIndex, overIndex);
      });
    }
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
      return;
    }
    if (event.active.data.current?.type === "Reserve-Column") {
      setActiveReserveColumn(event.active.data.current?.reservedColumn);
      return;
    }
    if (event.active.data.current?.type === "Reserved-Task") {
      setActiveReserveTask(event.active.data.current?.reservedTask);
      return;
    }
  }
  const onDragEnd = (event: DragEndEvent) => {
    setActiveReserveTask(null);
    setActiveTask(null);
    setActiveReserveColumn(null);
    setActiveColumn(null);
    const { active, over } = event;
    if (active && over) {
      const sourceCard = columns.find((card) => card.id === active.id);
      const destinationCard =
        over && over.id === "reserved"
          ? reservedColumn
          : columns.find((card) => card.id === over.id);
      if (sourceCard && destinationCard) {
        const sourceIndex = sourceCard.passengers.indexOf(active.id);
        const destinationIndex =
          over && over.id === "reserved"
            ? destinationCard.passengers.length
            : over.index;
        if (destinationIndex > -1) {
          const newSourcePassengers = [...sourceCard.passengers];
          const newDestinationPassengers = [...destinationCard.passengers];
          newSourcePassengers.splice(sourceIndex, 1);
          newDestinationPassengers.splice(destinationIndex, 0, active.id);
          if (over.id === "reserved") {
            setReservedColumn({
              ...destinationCard,
              passengers: newDestinationPassengers,
            });
          } else {
            const updatedRosterCards = columns.map((card) => {
              if (card.id === sourceCard.id) {
                return { ...card, passengers: newSourcePassengers };
              }
              if (card.id === destinationCard.id) {
                return { ...card, passengers: newDestinationPassengers };
              }
              return card;
            });
            setColumns(updatedRosterCards);
          }
        }
      }
    }
  };

  // console.log(combinedData)

  const [searchtext, setSearchText] = useState("");
  const [openAddExternalTmModal, setOpenAddExternalTmModal] =
    useState<boolean>(false);

  const addNewCab = (cabData) => {
    // console.log(columns);
    setColumns((prevColumns) => [
      ...prevColumns,
      {
        id: "Roster" + columns?.length,
        cab: cabData,
        passengers: [],
        availableCapacity: cabData.seatingCapacity,
        currentShift: routeState?.data?.currentShift,
        workLocation: routeState?.data?.workLocation,
      },
    ]);
    setavailableDrivers((prevAvailableDrivers: [any]) =>
      prevAvailableDrivers.filter((driver) => {
        return driver?._id != cabData?._id;
      })
    );
    setOpenAddExternalTmModal(false);
  };

  // const removeCab = () => {
  //   setColumns((prevColumns) => [
  //     ...prevColumns,
  //     {
  //       id: "Roster" + columns?.length,
  //       cab: cabData,
  //       passengers: [],
  //       availableCapacity: cabData.seatingCapacity,
  //       currentShift: routeState?.data?.currentShift,
  //       workLocation: routeState?.data?.workLocation,
  //     },
  //   ]);
  // }

  return (
    <DndContext
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetection={closestCorners}
      sensors={sensors}
    >
      {isLoaderEnabled && <Loading />}
      <Box
        sx={{
          ...PageFlex,
          width: "100vw",
          height: "100vh",
          flexDirection: "column",
          gap: "15px",
          backgroundColor: "background.default",
          color: "text.primary",
        }}
      >
        <Box
          sx={{
            ...RowFlex,
            width: "100%",
            height: "10%",
            px: "25px",
            pt: "15px",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              ...ColFlex,
              alignItems: "flex-start",
              width: isSM || isMD ? "50%" : "60%",
            }}
          >
            <Typography variant={isSM || isMD ? "h5" : "h4"} fontWeight={600}>
              {routeState?.data?.typeOfRoute == "pickup"
                ? "Pickup for "
                : "Drop for "}
              {routeState?.data?.workLocation}
            </Typography>
            <Typography
              variant={isSM || isMD ? "body2" : "body1"}
              fontWeight={500}
            >
              {routeState?.data?.activationMode === "immediate"
                ? "Route Activation - Today"
                : "Route Activation - Tomorrow" +
                  " --> " +
                  ConvertShiftTimeTo12HrFormat(routeState?.data?.currentShift)}
            </Typography>
          </Box>

          <Box
            sx={{
              ...RowFlex,
              width: isSM || isMD ? "100%" : "60%",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 0,
            }}
          >
            <Box sx={{ ...RowFlex, gap: 1.5, mx: 2.5 }}>
              <Typography variant="h4">{availableTMs?.length}</Typography>
              <Typography
                variant="body2"
                sx={{ lineHeight: "17.5px", width: "50%" }}
              >
                TMs Pending
              </Typography>
            </Box>
            <Box
              sx={{
                px: 3,
                height: "40px",
                backgroundColor: "success.main",
                ...RowFlex,
                gap: 1,
                borderRadius: 1.5,
                cursor: "pointer",
              }}
              onClick={() => setOpenAddExternalTmModal(true)}
            >
              <Add fontSize="20" sx={{ color: "white" }} />
              <Typography sx={{ color: "white" }}>Add Cab</Typography>
            </Box>
            <Box
              sx={{
                px: 5,
                height: "50px",
                bgcolor: "primary.main",
                ...RowFlex,
                scale: "0.8",
                gap: 2.5,
                borderRadius: 1.5,
                cursor: "pointer",
                "&:hover > img": {
                  scale: "1.025",
                  transform: "rotateY(550deg) rotateZ(45deg)",
                  transition: "all 1s ease",
                },
                "&:not(:hover) > img": {
                  scale: "1",
                  transform: "rotateY(0deg) rotateZ(0deg)",
                  transition: "all 1s ease",
                },
              }}
              onClick={confirmRoute}
            >
              <Typography
                variant="h6"
                sx={{
                  // fontStyle: "italic",
                  fontWeight: "600",
                  color: "text.primary",
                }}
              >
                Deploy Shift
              </Typography>
              <Box
                component={"img"}
                src={LogoImage}
                sx={{ width: "25px", aspectRatio: 1 }}
              />
            </Box>
            <Box
              sx={{
                px: 3,
                height: "40px",
                backgroundColor: "text.primary",
                ...RowFlex,
                gap: 1,
                borderRadius: 1.5,
                cursor: "pointer",
              }}
              onClick={() => navigate("/admin/")}
            >
              <ArrowBackIos
                fontSize="20"
                sx={{ color: "background.default" }}
              />
              <Typography sx={{ color: "background.default" }}>
                Cancel
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          className="scroll-mod"
          sx={{
            ...RowFlex,
            alignItems: "flex-start",
            // justifyItems: "start",
            p: isSM || isMD ? 1 : 2,
            height: "100%",
            width: "100vw",
            overflowY: "hidden",
            backgroundColor: "rgba(158, 158, 158, 0.1)",
          }}
        >
          <DndContext
            collisionDetection={closestCorners}
            sensors={sensors}
            onDragOver={onDragOver}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            autoScroll={true}
          >
            <Box
              sx={{
                ...RowFlex,
                // justifyItems: "flex-start",
                // alignItems: "flex-start",
                flexWrap: "wrap",
                height: "100%",
                width: "70%",
                // px: 2.5,
                whiteSpace: "nowrap",
                gap: "1rem",
                justifyContent: "flex-start",
                overflowY: "auto",
                // border: "1px solid blue",
              }}
              className="scroll-mod"
            >
              <SortableContext
                items={regularColumns.map((column) => column.id)}
              >
                {regularColumns.map((shift: ShiftTypes) => (
                  <RosterCard
                    key={shift?.id}
                    column={shift}
                    passengerDetails={passengers?.filter(
                      (passenger: EmployeeTypes) =>
                        passenger.columnId === shift.id
                    )}
                    reservedColumnSetter={setReservedColumn}
                    passengersSetter={setPassengers}
                    // expandedLayout={expandedLayout}
                    pendingPassengers={availableTMs}
                    pendingPassengerSetter={setavailableTMs}
                    pendingPassengersStatus={pendingPassengersStatus}
                  />
                ))}
              </SortableContext>
            </Box>
            <Box sx={{ mx: 2, height: "100%" }}>
              <SortableContext
                items={reservedColumn.map((column) => column.id)}
              >
                {reservedColumn.map((column) => (
                  <ReserveModal
                    key={column.id}
                    column={column}
                    passengerDetails={reservedPassengers}
                  />
                ))}
              </SortableContext>
            </Box>
            {createPortal(
              <DragOverlay>
                {activeColumn && (
                  <RosterCard
                    passengerDetails={activeColumn.passengers!.filter(
                      (passenger: EmployeeTypes) =>
                        passenger.columnId === activeColumn.id
                    )}
                    column={activeColumn}
                  />
                )}
                {activeTask && <PassengerTab passenger={activeTask} />}

                {activeReserveTask && (
                  <ReservedPassengersTab passenger={activeReserveTask} />
                )}
                {activeReserveColumn && (
                  <ReserveModal
                    passengerDetails={activeReserveColumn.passengers!.filter(
                      (passenger: EmployeeTypes) =>
                        passenger.columnId === activeReserveColumn.id
                    )}
                    column={activeReserveColumn}
                  />
                )}
              </DragOverlay>,
              document.body
            )}
          </DndContext>
        </Box>
      </Box>
      <NoticeModal
        headerText="Shift Schedule"
        subHeaderText={`This shift has been scheduled for ${formatDateString(
          routeState?.data?.scheduledForDate
        )}.`}
        openConfirmModal={openConfirmModal}
        setOpenConfirmModal={setOpenConfirmModal}
        triggerFunction={handleCreateRoute}
      />
      {/* ADD TEAM MEMBER MODAL */}
      <GlobalModal
        headerText="Search & Add Available Drivers"
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
          {/* Search Bar */}
          <Box
            sx={{
              ...RowFlex,
              width: "100%",
              gap: 2.5,
            }}
          >
            <TextField
              variant="outlined"
              size="medium"
              sx={{ width: "65%" }}
              onChange={(e) => {
                setSearchText(e.target.value.toLowerCase());
              }}
              placeholder="Search Drivers, Cab Numbers or Cab Plates"
              InputProps={{
                startAdornment: (
                  <IconButton aria-label="search">
                    <Search />
                  </IconButton>
                ),
              }}
            />
            <Box sx={{ ...ColFlex, width: "20%", alignItems: "flex-start" }}>
              <Typography sx={{ color: "white" }} variant="h5">
                {availableDrivers?.length}
              </Typography>
              <Typography sx={{ color: "white" }} variant="body2">
                Available Drivers
              </Typography>
            </Box>
          </Box>

          {/* List of Drivers */}
          <Box
            sx={{
              ...ColFlex,
              height: "75%",
              width: "100%",
              overflowY: "auto",
              justifyContent: "flex-start",
              gap: "1rem",
              mt: 2.5,
            }}
          >
            {availableDrivers
              ?.filter(
                (driver) =>
                  (driver?.cabDriver[0] as EmployeeTypes)?.fname
                    ?.toLowerCase()
                    ?.includes(searchtext) ||
                  (driver?.cabDriver[0] as EmployeeTypes)?.lname
                    ?.toLowerCase()
                    ?.includes(searchtext)
              )
              .map((driver) => (
                <DriverCard
                  key={driver?._id}
                  cab={driver}
                  onAddCab={addNewCab}
                />
              ))}
          </Box>
        </Box>
      </GlobalModal>
    </DndContext>
  );
}

export default CreateShift;

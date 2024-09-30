// @ts-nocheck
import { Box, Button, Modal, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex.ts";
import { ShiftTypes } from "../../types/ShiftTypes.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import Cabtypes from "../../types/CabTypes.ts";
import { useCallback, useContext, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  // horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import ScheduledRouteCard from "../../components/ui/ScheduledRouteCard.tsx";
// import AssignedPassengers from "../../components/ui/AssignedPassengers.tsx";
import ReserveModal from "../../components/ui/ReserveModal.tsx";
import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/useAxios.ts";
import SnackbarContext from "../../context/SnackbarContext.ts";
import { SnackBarContextTypes } from "../../types/SnackbarTypes.ts";
import PassengerTab from "../../components/ui/PassengerTab.tsx";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ArrowForward } from "@mui/icons-material";
import AssignedPassengers from "../../components/ui/AssignedPassengers.tsx";

function AssignedRoutes() {
  const location = useLocation();
  const routeState = location.state;

  console.log("ROUTE STATE ___> ",routeState)

  const [next, setNext] = useState(2);
  const [activeColumn, setActiveColumn] = useState<ShiftTypes | null>(null);
  const [activeTask, setActiveTask] = useState<EmployeeTypes | null>(null);
  const [columns, setColumns] = useState(
    (routeState || []).map((shift: ShiftTypes, index: number) => ({
      ...shift,
      id: `${"Roster" + index.toString()}`,
    })) || []
  );

  const [reservedColumn, setReservedColumn] = useState([
    {
      id: "reserved",
      passengers: [],
    },
  ]);

  const [reservedPassengers, setReservedPassengers] = useState(() => {
    return reservedColumn.flatMap((column) => column.passengers) || [];
  });

  const [activeReserveTask, setActiveReserveTask] = useState(null);
  const [activeReserveColumn, setActiveReserveColumn] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [SOSEmergency, setSOSEmergency] = useState<any>(null);

  const navigate = useNavigate();
  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const [passengers, setPassengers] = useState(() => {
    return columns.flatMap((shift: ShiftTypes) =>
      shift.passengers!.map((passenger, index) => ({
        ...passenger,
        id: passenger._id || index.toString(),
        columnId: shift.id,
      }))
    );
  });

  const regularColumns = columns.filter((column) => column.name !== "reserved");

  const combinedData: {
    _id: string;
    cab: Cabtypes;
    passengers: EmployeeTypes[];
    availableCapacity: number;
  }[] = [];

  const { mutate } = useMutation({
    mutationFn: async (data) => {
      try {
        combinedData.forEach(async (routeData) => {
          await useAxios.patch(`routes/${routeData?._id}`, routeData);
        });
        setEditMode(false);
      } catch (error) {
        console.error("Error creating route:", error);
      }
    },
    onSuccess: () => {
      setOpenSnack({
        open: true,
        message: `Route Updated Successfully`,
        severity: "success",
      });
      navigate(-1);
    },
  });

  columns.forEach((column: ShiftTypes) => {
    const columnPassengers = passengers.filter(
      (passenger: EmployeeTypes) => passenger.columnId === column.id
    );
    combinedData.push({
      _id: column?._id,
      cab: column.cab as Cabtypes,
      passengers: columnPassengers,
      availableCapacity:
        column.cab!.seatingCapacity! - columnPassengers?.length,
    });
  });

  const confirmRoutes = () => {
    setSOSEmergency(true);
  };
  const handleUpdateRoute = () => {
    const dataToDeploy: any = {
      cabEmployeeGroups: combinedData,
    };
    mutate(dataToDeploy);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 30,
      },
    })
  );

  const getPassengerPos = useCallback((id, passengers) => {
    return passengers.findIndex((passenger) => passenger._id === id);
  }, []);

  const findColumnByPassengerId = useCallback((id, data) => {
    return data.find((column) =>
      column.passengers.some((passenger: EmployeeTypes) => passenger._id === id)
    );
  }, []);

  // console.log(passengers);
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

    const targetColumn = findColumnByPassengerId(overId, combinedData);
    // const sourceColumn = findColumnByPassengerId(activeId, combinedData);

    // Move from Task column to Task column
    if (isActiveATask && isOverATask && targetColumn?.availableCapacity !== 0) {
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

    // Move from Task column to Reserve column
    if (isActiveATask && isOverAReserveTask) {
      setEditMode(true);

      setPassengers((prevPassengers: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId, prevPassengers);

        if (activeIndex === -1) {
          return prevPassengers; // Return previous state if activeId is not found
        }

        const passenger = prevPassengers[activeIndex];
        const updatedPassenger = {
          ...passenger,
          columnId: "reserved" as string,
        };

        // Remove the active passenger from prevPassengers
        const updatedPassengers = [
          ...prevPassengers.slice(0, activeIndex),
          ...prevPassengers.slice(activeIndex + 1),
        ];

        // Update reservedColumn
        setReservedColumn((prevColumns) => {
          return prevColumns.map((column) => {
            if (column.id === "reserved") {
              // Check if the passenger already exists in column.passengers
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

        // Update reservedPassengers
        setReservedPassengers((prevReserved: EmployeeTypes[]) => {
          if (!prevReserved.some((p) => p.id === activeId)) {
            return [...prevReserved, updatedPassenger];
          }
          return prevReserved;
        });

        return updatedPassengers;
      });
    }

    if (isActiveATask && isOverAReserveColumn) {
      setEditMode(true);

      setPassengers((prevPassengers: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId, prevPassengers);

        if (activeIndex === -1) {
          return prevPassengers;
        }

        const passenger = prevPassengers[activeIndex];
        const updatedPassenger = {
          ...passenger,
          columnId: "reserved" as string,
        };

        const updatedPassengers = [
          ...prevPassengers.slice(0, activeIndex),
          ...prevPassengers.slice(activeIndex + 1),
        ];

        // Update reservedColumn
        setReservedColumn((prevColumns) => {
          return prevColumns.map((column) => {
            if (column.id === "reserved") {
              // Check if the passenger already exists in column.passengers
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

        // Update reservedPassengers
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

    if (isActiveAReserveTask && (isOverATask || isOverAColumn)) {
      if (!isOverATask || targetColumn?.availableCapacity !== 0) {
        if (isOverATask) setEditMode(true);

        setReservedPassengers((prevReserved) => {
          const targetColumnId =
            passengers.find((p) => p?.id === overId)?.columnId || overId;
          if (!targetColumnId) return prevReserved; // Ensure targetColumnId is valid

          return updatePassengerAndColumns(
            prevReserved,
            activeId,
            overId,
            targetColumnId
          );
        });
      }
    }

    // ✅
    if (isActiveATask && isOverAColumn) {
      setPassengers((tasks) => {
        const activeIndex = tasks.findIndex((t) => t.id === activeId);

        tasks[activeIndex].columnId = overId;
        return arrayMove(tasks, activeIndex, activeIndex);
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
  };

  const nextStep = () => {
    setNext((prev) => prev + 2);
  };

  const prevStep = () => {
    if (next !== 2) {
      return setNext((prev) => prev - 2);
    }
    setNext((prev) => prev + regularColumns.length + 1);
  };

  const getUniquePassengers = (passengers: EmployeeTypes[]) => {
    const seen = new Set();
    return passengers.filter((passenger) => {
      const duplicate = seen.has(passenger.id);
      seen.add(passenger.id);
      return !duplicate;
    });
  };
  return (
    <>
      {/* // <DndContext
    //   onDragOver={onDragOver}
    //   onDragStart={onDragStart}
    //   onDragEnd={onDragEnd}
    //   collisionDetection={closestCorners}
    //   sensors={sensors}
    // > */}
      <Box
        sx={{
          ...PageFlex,
          width: "100vw",
          height: "100vh",
          flexDirection: "column",
          gap: "15px",
          backgroundColor: "background.default",
          color:"text.primary"
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
            color:"text.primary"
          }}
        >
          <Box
            sx={{
              ...ColFlex,
              alignItems: "flex-start",
              width: "60%",
              gap: 0.5,
            }}
          >
            <Typography variant="h4" fontWeight={600}>
              {`Assigned Routes (${
                routeState?.length ? routeState?.length : 0
              })`}
            </Typography>
            <Typography fontWeight={600} fontSize={19}>
              {/* {mapCoordinatesToText(routeState?.centralPoint) +
                "-->" +
                ConvertShiftTimeTo12HrFormat(routeState?.data?.currentShift)} */}
              View or change assigned routes here.
            </Typography>
          </Box>

          <Box
            sx={{
              ...RowFlex,
              width: "40%",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 7.5,
            }}
          >
            <Box
              sx={{
                px: 5,
                height: "50px",
                bgcolor: "green",
                gap: 2.5,
                borderRadius: 1.5,
                cursor: "pointer",
                display:
                  reservedPassengers?.length > 0 || editMode
                    ? { ...RowFlex }
                    : "none",
              }}
              onClick={confirmRoutes}
            >
              <Typography
                variant="h5"
                sx={{ fontStyle: "italic", fontWeight: "700", color:"text.primary" }}
              >
                SAVE
              </Typography>
            </Box>

            <Box
              sx={{
                px: 5,
                height: "50px",
                backgroundColor: "text.primary",
                ...RowFlex,
                gap: 2.5,
                borderRadius: 1.5,
                cursor: "pointer",
              }}
              onClick={() => navigate(-1)}
            >
              <Typography
                variant="h5"
                sx={{ fontStyle: "italic", fontWeight: "700", color:"background.default" }}
              >
                BACK
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          // className="scroll-mod"
          sx={{
            ...RowFlex,
            display: "flex",
            height: "90%",
            width: "100vw",
            overflowX: "hidden",
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
                flexWrap: "wrap",
                height: "100%",
                width: "100%",
                whiteSpace: "nowrap",
                gap: "2rem",
                overflowY: "auto",
                justifyContent: "center",
                px: 2,
                py: 2,
              }}
              className="scroll-mod"
            >
              <SortableContext
                items={regularColumns.map((column) => column.id)}
              >
                {/* <Button
                  onClick={prevStep}
                  sx={{
                    backgroundColor: "primary.main",
                    color:"text.primary",
                    borderRadius: "99px",
                    border: "2px solid white",

                    height: "60px",
                    width: "50px",
                    ":hover": {
                      backgroundColor: "rgba(158, 158, 158, 0.1)",
                      border: "2px solid #2997FC",
                      color: "primary.main",
                    },
                  }}
                >
                  <ArrowBackIcon />
                </Button> */}
                {regularColumns.map((shift: ShiftTypes) => {
                  const uniquePassengers = getUniquePassengers(
                    passengers.filter(
                      (passenger: EmployeeTypes) =>
                        passenger.columnId === shift.id
                    )
                  );

                  return (
                    <ScheduledRouteCard
                      key={shift?.id}
                      column={shift}
                      passengerDetails={uniquePassengers}
                    />
                  );
                })}
                {/* {regularColumns.length > next - 2 && (
                  // <Button
                  //   onClick={nextStep}
                  //   sx={{
                  //     backgroundColor: "primary.main",
                  //     color:"text.primary",
                  //     borderRadius: "99px",
                  //     border: "2px solid white",

                  //     height: "60px",
                  //     width: "50px",
                  //     ":hover": {
                  //       backgroundColor: "rgba(158, 158, 158, 0.1)",
                  //       border: "2px solid #2997FC",
                  //       color: "primary.main",
                  //     },
                  //   }}
                  // >
                  //   <ArrowForward />
                  // </Button>
                )} */}
              </SortableContext>
            </Box>
            <Box sx={{ mx: 2 }}>
              <SortableContext
                items={reservedColumn.map((column) => column.id)}
              >
                {reservedColumn.map((column) => {
                  const uniquePassengers = getUniquePassengers(
                    reservedPassengers.filter(
                      (passenger: EmployeeTypes) =>
                        passenger.columnId === column.id
                    )
                  );

                  return (
                    <ReserveModal
                      key={column.id}
                      column={column}
                      passengerDetails={uniquePassengers}
                    />
                  );
                })}
              </SortableContext>
            </Box>
            {createPortal(
              <DragOverlay>
                {activeColumn && (
                  <ScheduledRouteCard
                    passengerDetails={getUniquePassengers(
                      activeColumn.passengers!.filter(
                        (passenger: EmployeeTypes) =>
                          passenger.columnId === activeColumn.id
                      )
                    )}
                    column={activeColumn}
                  />
                )}
                {activeTask && <AssignedPassengers passenger={activeTask} />}
                {activeReserveTask && (
                  <AssignedPassengers passenger={activeReserveTask} />
                )}
                {activeReserveColumn && (
                  <ReserveModal
                    passengerDetails={getUniquePassengers(
                      activeReserveColumn.passengers!.filter(
                        (passenger: EmployeeTypes) =>
                          passenger.columnId === activeReserveColumn.id
                      )
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
      <Modal
        sx={{ ...ColFlex, width: "100%", height: "100%" }}
        open={SOSEmergency ? true : false}
        // onClose={() => setSOSEmergency([])}
      >
        <Box
          sx={{
            ...ColFlex,
            p: "30px 10px",
            // minHeight: "40vh",
            width: { xs: "90%", lg: "35%" },
            borderRadius: "15px",
            gap: 5,
            alignItems: "center",
            textAlign: "center",
            justifyContent: "center",
            backgroundColor: "background.default",
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
            <Box
              sx={{
                ...ColFlex,
                gap: 1,
              }}
            >
              <Typography variant="h5" fontWeight={600} sx={{ mb: "10px" }}>
                Confirm Your Action
              </Typography>
              <Typography
                sx={{
                  width: "100%",
                  textAlign: "center",
                  color: "text.secondary",
                  fontSize: "1rem",
                  lineHeight: "15px",
                  fontWeight: 600,
                }}
                variant="subtitle2"
                color={"GrayText"}
              >
                Do you want to proceed with updating the routes?
              </Typography>
            </Box>

            <Box sx={{ gap: 5, ...RowFlex }}>
              <Button
                sx={{
                  backgroundColor: "green",
                  color: "background.default",
                  padding: "10px 50px",
                  borderRadius: "100px",
                }}
                variant="contained"
                size="large"
                onClick={handleUpdateRoute}
              >
                Yes
              </Button>
              <Button
                sx={{
                  backgroundColor: "red",
                  color: "background.default",
                  padding: "10px 50px",
                  borderRadius: "100px",
                }}
                variant="contained"
                size="large"
                onClick={() => {
                  setSOSEmergency(undefined);
                }}
              >
                NO
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </>
    // </DndContext>
  );
}

export default AssignedRoutes;
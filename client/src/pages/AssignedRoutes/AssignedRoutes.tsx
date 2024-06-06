// @ts-nocheck
import { Box, Button, Modal, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex.ts";
import { ShiftTypes } from "../../types/ShiftTypes.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import Cabtypes from "../../types/CabTypes.ts";
import { useContext, useMemo, useState } from "react";
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
import {
  SortableContext,
  arrayMove,
  // horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import ScheduledRouteCard from "../../components/ui/ScheduledRouteCard.tsx";
import AssignedPassengers from "../../components/ui/AssignedPassengers.tsx";
import ReserveModal from "../../components/ui/ReserveModal.tsx";
import { useMutation } from "@tanstack/react-query";
import useAxios from "../../api/useAxios.ts";
import SnackbarContext from "../../context/SnackbarContext.ts";
import { SnackBarContextTypes } from "../../types/SnackbarTypes.ts";
import MapComponent from "../../components/Map.tsx";
import { Close, Warning } from "@mui/icons-material";

function AssignedRoutes() {
  const location = useLocation();
  const routeState = location.state;

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

  const getPassengerPos = (id: UniqueIdentifier, passengers: EmployeeTypes[]) =>
    passengers.findIndex((passenger: EmployeeTypes) => passenger._id === id);

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
          setEditMode(true);
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

        setEditMode(true);

        return updatedPassengers;
      });
    }

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
        setEditMode(true);

        return updatedReservedPassengers;
      });
    }

    if (isActiveAReserveTask && isOverAReserveTask) {
      setReservedPassengers((prevReserved: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId, prevReserved);
        const overIndex = getPassengerPos(overId, prevReserved);
        setEditMode(true);

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
      const sourceCard = columns.find(
        (card: ShiftTypes) => card.id === active.id
      );
      const destinationCard =
        over && over.id === "reserved"
          ? reservedColumn
          : columns.find((card: ShiftTypes) => card.id === over.id);
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
            const updatedRosterCards = columns.map((card: ShiftTypes) => {
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

  return (
    <DndContext
      onDragOver={onDragOver}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetection={closestCorners}
      sensors={sensors}
    >
      <Box
        sx={{
          ...PageFlex,
          width: "100vw",
          height: "100vh",
          flexDirection: "column",
          gap: "15px",
          backgroundColor: "white",
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
                sx={{ fontStyle: "italic", fontWeight: "700", color: "white" }}
              >
                SAVE
              </Typography>
            </Box>

            <Box
              sx={{
                px: 5,
                height: "50px",
                bgcolor: "text.primary",
                ...RowFlex,
                gap: 2.5,
                borderRadius: 1.5,
                cursor: "pointer",
              }}
              onClick={() => navigate(-1)}
            >
              <Typography
                variant="h5"
                sx={{ fontStyle: "italic", fontWeight: "700", color: "white" }}
              >
                BACK
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          className="scroll-mod"
          sx={{
            ...RowFlex,
            display: "flex",
            height: "90%",
            width: "100vw",
            overflowX: "scroll",
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
                width: "70%",
                whiteSpace: "nowrap",
                gap: "2.5rem",
                overflowY: "auto",
                justifyContent: "start",
                px: 2,
                py: 2,
              }}
              className="scroll-mod"
            >
              <SortableContext
                items={regularColumns.map((column: ShiftTypes) => column.id)}
              >
                {regularColumns.length ? (
                  regularColumns.map((shift: ShiftTypes) => {
                    return (
                      <ScheduledRouteCard
                        scheduledRoutes={shift}
                        key={shift?.id}
                        passengerDetails={passengers?.filter(
                          (passenger: EmployeeTypes) =>
                            passenger.columnId === shift.id
                        )}
                      />
                    );
                  })
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 500 }}>
                    No Routes Assigned Yet 😅
                  </Typography>
                )}
              </SortableContext>
            </Box>
            <Box sx={{ mx: 2 }}>
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
                  <ScheduledRouteCard
                    passengerDetails={activeColumn.passengers!.filter(
                      (passenger: EmployeeTypes) =>
                        passenger.columnId === activeColumn.id
                    )}
                    scheduledRoutes={activeColumn}
                  />
                )}
                {activeTask && <AssignedPassengers passenger={activeTask} />}
                {activeReserveTask && (
                  <AssignedPassengers passenger={activeReserveTask} />
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
    </DndContext>
  );
}

export default AssignedRoutes;

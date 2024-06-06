// @ts-nocheck
import { Box, Typography } from "@mui/material";
import { useBlocker, useLocation, useNavigate } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex.ts";
import LogoImage from "/images/logo.png";
import RosterCard from "../../components/ui/RosterCard.tsx";
import { ShiftTypes } from "../../types/ShiftTypes.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import Cabtypes from "../../types/CabTypes.ts";
import { useContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

function CreateShift() {
  const location = useLocation();
  const routeState = location?.state;

  const { setOpenSnack }: SnackBarContextTypes = useContext(SnackbarContext);

  const [activeColumn, setActiveColumn] = useState<ShiftTypes | null>(null);
  const [isLoaderEnabled, setIsLoaderEnabled] = useState<boolean>(false);

  const [activeTask, setActiveTask] = useState<EmployeeTypes | null>(null);

  const [columns, setColumns] = useState([
    ...((routeState?.data?.data || []).map(
      (shift: ShiftTypes, index: number) => ({
        ...shift,
        id: `Roster${index.toString()}`,
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

  window.onpopstate = (event) => {
    alert("Data will be lost !");
    // console.log(currentLocation, location.state)
    // navigate("/admin/createShift", {state: location.state})
};


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

  const qc = useQueryClient();
  const navigate = useNavigate();
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
  });

  const mapCoordinatesToText = (value: string) => {
    switch (value) {
      case "[34.07918418861709, 74.76795882716988]":
        return "Bemina Area";
      case "[34.07884610905441, 74.77249651656975]":
        return "Lal Bazar Area";
      case "[34.084051032954854, 74.79703437982327]":
        return "Karanagar Area";
      case "[34.01011349472341, 74.79879001141188]":
        return "Rangreth Area";
      case "[34.13990801842636, 74.80077605668806]":
        return "Soura Area";
      default:
        return "Unknown Area";
    }
  };

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
    };
    setIsLoaderEnabled(true);
    showLoader();
    setTimeout(() => {
      mutate(dataToDeploy);
    }, 1500);
  };

  const showLoader = () => {
    setTimeout(() => {
      setIsLoaderEnabled(false);
      setOpenSnack({
        open: true,
        message: "Shift Generation was Successful 🎉",
        severity: "success",
      });
    }, 3000);
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
          <Box sx={{ ...ColFlex, alignItems: "flex-start", width: "60%" }}>
            <Typography variant="h4" fontWeight={600}>
              {routeState?.data?.workLocation}
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {mapCoordinatesToText(routeState?.centralPoint) +
                "-->" +
                ConvertShiftTimeTo12HrFormat(routeState?.data?.currentShift)}
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
            {/* <Box
              sx={{
                pl: 2.5,
                height: "50px",
                ...RowFlex,
                justifyContent: "space-between",
                gap: 2.5,
                backgroundColor: "white",
                border: "3px solid #2997fc",
                borderRadius: 1.5,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontStyle: "italic",
                  fontWeight: "700",
                  color: "primary.main",
                }}
              >
                RESERVE
              </Typography>
              <Box
                sx={{
                  ...ColFlex,
                  width: "100%",
                  px: 1.75,
                  height: "100%",
                  bgcolor: "primary.main",
                }}
              >
                <Typography
                  sx={{ fontWeight: 700, color: "white", fontStyle: "italic" }}
                  variant="h5"
                >
                  0
                </Typography>
              </Box>
            </Box> */}
            <Box
              sx={{
                px: 5,
                height: "50px",
                bgcolor: "primary.main",
                ...RowFlex,
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
              onClick={handleCreateRoute}
            >
              <Typography
                variant="h5"
                sx={{ fontStyle: "italic", fontWeight: "700", color: "white" }}
              >
                DEPLOY
              </Typography>
              <Box
                component={"img"}
                src={LogoImage}
                sx={{ width: "25px", aspectRatio: 1 }}
              />
            </Box>
          </Box>
        </Box>

        <Box
          className="scroll-mod"
          sx={{
            ...RowFlex,
            alignItems: "flex-start",
            // justifyItems: "start",
            p: 2,
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
                gap: "2.5rem",
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
                  />
                ))}
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
    </DndContext>
  );
}

export default CreateShift;

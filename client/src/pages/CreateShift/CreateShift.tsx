import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex.ts";
import LogoImage from "/images/logo.png";
import RosterCard from "../../components/ui/RosterCard.tsx";
import { ConvertShiftTimeTo12HrFormat } from "../../utils/12HourFormat.ts";
import { ShiftTypes } from "../../types/ShiftTypes.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import Cabtypes from "../../types/CabTypes.ts";
import { useEffect, useMemo, useState } from "react";
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
import {
  SortableContext,
  arrayMove,
  // horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { createPortal } from "react-dom";
import PassengerTab from "../../components/ui/PassengerTab.tsx";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

function CreateShift() {
  const location = useLocation();
  const routeState = location?.state;
  const [reserve, setReserve] = useState<Array<EmployeeTypes>>([]);
  const [rosterData, setRosterData] = useState<
    {
      cab: Cabtypes;
      passengers: EmployeeTypes[];
    }[]
  >([]);

  const [activeColumn, setActiveColumn] = useState<ShiftTypes | null>(null);
  const [activeTask, setActiveTask] = useState<EmployeeTypes | null>(null);
  const [columns, setColumns] = useState(
    (routeState?.data?.data || []).map((shift: ShiftTypes, index: number) => ({
      ...shift,
      id: `${"Roster" + index.toString()}`,
    }))
  );

  const [passengers, setPassengers] = useState(() => {
    if (!routeState?.data?.data) return [];

    return columns.flatMap((shift: ShiftTypes) =>
      shift.passengers!.map((passenger, index) => ({
        ...passenger,
        id: passenger._id || index.toString(),
        columnId: shift.id,
      }))
    );
  });

  const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

  const qc = useQueryClient();
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: async (data) => {
      try {
        // console.log(data);
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

  const handleCreateRoute = () => {
    const dataToDeploy: any = {
      cabEmployeeGroups: rosterData,
      workLocation: routeState?.data?.workLocation,
      currentShift: routeState?.data?.currentShift,
      typeOfRoute: routeState?.data?.typeOfRoute,
    };
    mutate(dataToDeploy);
  };

  // console.log(passengers);
  // console.log(columns);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 30,
      },
    })
  );

  const getPassengerPos = (id: UniqueIdentifier) =>
    passengers.findIndex((passenger: EmployeeTypes) => passenger._id === id);

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    // // Im dropping a Task over another Task

    if (isActiveATask && isOverATask) {
      setPassengers((passengers: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId);
        const overIndex = getPassengerPos(overId);

        if (
          passengers[activeIndex]?.columnId != passengers[overIndex]?.columnId
        ) {
          passengers[activeIndex].columnId = passengers[overIndex]?.columnId;
          return arrayMove(passengers, activeIndex, overIndex - 1);
        }

        return arrayMove(passengers, activeIndex, overIndex);
      });
    }
    const isOverAColumn = over.data.current?.type === "Column";
    //   // Im dropping a Task over a column
    if (isActiveATask && isOverAColumn) {
      setPassengers((passengers) => {
        const activeIndex = getPassengerPos(activeId);
        passengers[activeIndex]._id = String(overId);
        console.log("DROPPING TASK OVER COLUMN", { activeIndex });
        return arrayMove(passengers, activeIndex, activeIndex);
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
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    // if (!over) return;
    if (active.id === over?.id) return;

    const activeId = active.id;
    const overId = over?.id;

    if (activeId === overId) return;

    const isActiveAColumn = active.data.current?.type === "Column";

    if (!isActiveAColumn) return;

    setColumns((columns: ShiftTypes[]) => {
      const activeColumnIndex = columns.findIndex((col) => col.id === activeId);

      const overColumnIndex = columns.findIndex((col) => col.id === overId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }
  return (
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
          <Box
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
                {reserve?.length}
              </Typography>
            </Box>
          </Box>
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
              height: "100%",
              width: "100%",
              px: 2.5,
              whiteSpace: "nowrap",
              gap: "3rem",
              justifyContent: "flex-start",
            }}
          >
            <SortableContext
              items={columnsId}
              // strategy={horizontalListSortingStrategy}
            >
              {columns.map((shift: ShiftTypes) => {
                return (
                  <RosterCard
                    key={shift?.id}
                    column={shift}
                    passengerDetails={passengers.filter(
                      (passenger: EmployeeTypes) =>
                        passenger.columnId === shift.id
                    )}
                    setRosterData={setRosterData}
                    // id={index.toString()}
                  />
                );
              })}
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
                  // cab={activeColumn?.cab as Cabtypes}
                  setRosterData={setRosterData}
                  // id={activeColumn.id}
                  column={activeColumn}
                />
              )}
              {activeTask && (
                <PassengerTab
                  // id={activeTask?.id}
                  passenger={activeTask}
                />
              )}
            </DragOverlay>,
            document.body
          )}
        </DndContext>
      </Box>
    </Box>
  );
}

export default CreateShift;

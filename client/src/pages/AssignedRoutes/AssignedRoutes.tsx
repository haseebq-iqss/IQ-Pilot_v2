import { Box, Typography } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ColFlex, RowFlex, PageFlex } from "../../style_extentions/Flex.ts";
import RosterCard from "../../components/ui/RosterCard.tsx";
import { ShiftTypes } from "../../types/ShiftTypes.ts";
import EmployeeTypes from "../../types/EmployeeTypes.ts";
import Cabtypes from "../../types/CabTypes.ts";
import { useMemo, useState } from "react";
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
// import ReservedPassengersTab from "../../components/ui/ReservedPassengersTab.tsx";
import ReserveModal from "../../components/ui/ReserveModal.tsx";
import ReservedPassengersTab from "../../components/ui/ReservedPassengersTab.tsx";
import ScheduledRouteCard from "../../components/ui/ScheduledRouteCard.tsx";

function AssignedRoutes() {
  const location = useLocation();
  const routeState = location?.state;
  // console.log(routeState);
  const [reservedPassengers, setReservedPassengers] = useState<
    Array<EmployeeTypes>
  >([
    {
      fname: "Virat",
      lname: "Kholi",
      email: "virat_kholi@iquasar.com",
      phone: 99064841312,
      role: "employee",
      password: "password12345",
      pickUp: {
        // @ts-ignore
        type: "Point",
        coordinates: [34.15207742432826, 74.87595012808126],
        address: "Pazzalpura, behind Shalimar Garden, Shalimar, Srinagar.",
      },
      workLocation: "Zaira Tower",
      department: "S&S(HR)",
      id: "Reserved",
    },
  ]);
  const [reserveModal, setReserveModal] = useState(false);
  const [activeReserve, setActiveReserve] = useState<EmployeeTypes | null>(
    null
  );

  const [activeColumn, setActiveColumn] = useState<ShiftTypes | null>(null);
  const [activeTask, setActiveTask] = useState<EmployeeTypes | null>(null);
  const [columns, setColumns] = useState(
    (routeState || []).map((shift: ShiftTypes, index: number) => ({
      ...shift,
      id: `${"Roster" + index.toString()}`,
    })) || []
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

  const columnsId = useMemo(
    () => columns.map((col: ShiftTypes) => col.id),
    [columns]
  );
  const tasksIds = useMemo(() => {
    return reservedPassengers.map((passenger: EmployeeTypes) => passenger.id);
  }, [reservedPassengers]);

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

    // console.log(dataToDeploy);
    mutate(dataToDeploy);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 30,
      },
    })
  );

  const getPassengerPos = (id: UniqueIdentifier) =>
    passengers.findIndex((passenger: EmployeeTypes) => passenger._id === id);

  // console.log(passengers);
  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === "Task";
    const isOverATask = over.data.current?.type === "Task";

    if (!isActiveATask) return;

    const targetColumn = combinedData.find((column) =>
      column.passengers!.some(
        (passenger: EmployeeTypes) => passenger._id === overId
      )
    );

    if (isActiveATask && isOverATask && targetColumn?.availableCapacity !== 0) {
      setPassengers((passengers: EmployeeTypes[]) => {
        const activeIndex = getPassengerPos(activeId);
        const overIndex = getPassengerPos(overId);

        if (
          passengers[activeIndex]?.columnId !== passengers[overIndex]?.columnId
        ) {
          passengers[activeIndex].columnId = passengers[overIndex]?.columnId;
          return arrayMove(passengers, activeIndex, overIndex - 1);
        }

        return arrayMove(passengers, activeIndex, overIndex);
      });
    }

    // const isOverReserve = over.data.current?.type === "Reserve";
    // console.log(isOverReserve);

    // console.log(over?.data?.current?.column);

    // // Im dropping a Task over a column
    // if (isActiveATask && isOverAColumn) {
    //   // setPassengers((passengers: EmployeeTypes[]) => {
    //   //   const activeIndex = getPassengerPos(activeId);
    //   //   passengers[activeIndex]._id = String(overId);
    //   //   console.log("DROPPING TASK OVER COLUMN", { activeIndex });
    //   //   return arrayMove(passengers, activeIndex, activeIndex);
    //   // });
    // }
  }

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === "ReservedPassenger") {
      setActiveReserve(event.active.data.current.task);
      console.log("Reserve");
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
    setActiveReserve(null);

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

  const handleReserveModal = () => {
    setReserveModal((prevState) => !prevState);
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
              onClick={handleReserveModal}
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
                  {reservedPassengers?.length}
                </Typography>
              </Box>
            </Box>
            {reserveModal && (
              <SortableContext items={tasksIds}>
                <ReserveModal reservedPassengers={reservedPassengers} />
              </SortableContext>
            )}
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
              {/* <Box
                component={"img"}
                src={LogoImage}
                sx={{ width: "25px", aspectRatio: 1 }}
              /> */}
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
                justifyContent: columns.length ? "flex-start" : "center",
              }}
            >
              <SortableContext
                items={columnsId}

                // strategy={horizontalListSortingStrategy}
              >
                {columns.length ? (
                  columns.map((shift: ShiftTypes) => {
                    return (
                      // <RosterCard
                      //   key={shift?.id}
                      //   column={shift}
                      //   passengerDetails={passengers.filter(
                      //     (passenger: EmployeeTypes) =>
                      //       passenger.columnId === shift.id
                      //   )}
                      //   // setRosterData={setRosterData}
                      //   // id={index.toString()}
                      // />
                      <ScheduledRouteCard scheduledRoutes={shift} />
                    );
                  })
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 500 }}>
                    No Routes Assigned Yet 😅
                  </Typography>
                )}
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
                    // setRosterData={setRosterData}
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
      {createPortal(
        <DragOverlay>
          {/* {activeReserve && (
            <ReserveModal reservedPassengers={reservedPassengers} />
          )} */}
          {activeReserve && <ReservedPassengersTab passenger={activeReserve} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

export default AssignedRoutes;

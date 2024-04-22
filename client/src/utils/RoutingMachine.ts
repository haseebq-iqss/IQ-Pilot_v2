import { createControlComponent } from "@react-leaflet/core";
import L from "leaflet";
import "leaflet-routing-machine";

interface CustomRoutingControlOptions extends L.Routing.RoutingControlOptions {
  draggableWaypoints?: boolean;
}

let resolveRMData: ((data: any) => void) | null = null;

export const createNewRMDataPromise = () => {
  return new Promise<any>((resolve) => {
    resolveRMData = resolve;
  });
};

export let RMDataPromise = createNewRMDataPromise(); // Initialize the first RMDataPromise

const createRoutineMachineLayer = ({ routes }: any) => {
  const instance = L.Routing.control({
    waypoints: [...routes],
    show: false,
    addWaypoints: false,
    routeWhileDragging: true,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: true,
    hide: true,
    createMarker: function () {
      return null; // Return null to hide the markers
    },
  } as CustomRoutingControlOptions);

  instance.on("routeselected", (e: L.Routing.RouteSelectedEvent) => {
    const distanceInKilometers: number | undefined =
      typeof e.route.summary?.totalDistance === "number"
        ? parseFloat((e.route.summary.totalDistance / 1000).toFixed(1))
        : 0;

    const totalTimeInSeconds: number | undefined =
      typeof e.route.summary?.totalTime === "number"
        ? e.route.summary.totalTime
        : 0;

    const totalMinutes = Math.round(totalTimeInSeconds / 60); // Convert seconds to minutes and round to nearest whole number

    const adjustedTotalMinutes = Math.trunc(totalMinutes * 1.6); // Multiply total minutes by 1.6

    const RMData = {
      totalMinutes: adjustedTotalMinutes,
      distanceInKilometers,
    };

    console.log("new data ---> ", RMData);

    // Resolve the current RMDataPromise with the latest RMData
    if (resolveRMData) {
      resolveRMData(RMData);
    }

    // Create a new RMDataPromise for the next set of data
    RMDataPromise = createNewRMDataPromise();
  });

  return instance;
};

const RoutingMachine = createControlComponent(createRoutineMachineLayer);

export default RoutingMachine;

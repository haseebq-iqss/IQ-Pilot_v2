import { Box } from "@mui/material";
import MapComponent from "../../components/Map";
import { useEffect, useState } from "react";
import EmployeeTypes from "../../types/EmployeeTypes";
import { io } from "socket.io-client";
import baseURL from "../../utils/baseURL";

const socket = io(baseURL);

function LiveDriverTracking() {
  const [activeDrivers, setActiveDrivers] = useState<EmployeeTypes[]>([]);
  const [counter, setCounter] = useState<number>(0);

  const extractDriverData = (rawData: any) => {
    const mapTest = new Map(rawData);
    // console.log(mapTest)

    const mapValues = Array.from(mapTest.values());

    // console.log(mapValues);
    setActiveDrivers(mapValues as any);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prevCount) => prevCount + 1);
    }, 3000);

    // Clear the timer on component unmount
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    socket.on("live-drivers", (data) => {
      // console.log("Live Drivers ------->  ", data);
      const locations = data;
      extractDriverData(locations);
    });
    socket.on("disconnect", () => {
      console.log("Socket disconnected, attempting to reconnect...");
      socket.connect();
    });
  }, [socket, counter]);

  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <MapComponent height="100%" activeDrivers={activeDrivers} />
    </Box>
  );
}

export default LiveDriverTracking;

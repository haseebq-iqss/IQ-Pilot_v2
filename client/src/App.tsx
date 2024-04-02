import { useState } from "react";
import UserDataContext from "./context/UserDataContext";
import MainRouter from "./router/MainRouter";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

function App() {
  const [userData, setUserData] = useState<any>();

  return (
    <UserDataContext.Provider value={{ userData, setUserData }}>
      <MainRouter />
      <ReactQueryDevtools />
    </UserDataContext.Provider>
  );
}

export default App;

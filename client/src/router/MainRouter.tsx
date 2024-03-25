import { Routes, Route, Outlet } from "react-router-dom";
import Index from "../pages/Index";

function MainRouter() {
  return (
    <Routes>
      <Route index element={<Index />}></Route>
      <Route path="admin" element={<><>Layout</><Outlet/></>}>
        <Route index element={<h1>Index Admin</h1>} />
      </Route>
    </Routes>
  );
}

export default MainRouter;

import { Route, Routes, useLocation } from "react-router-dom";
import { IOSExpand, SlideInOut } from "../animations/transition";
import { useContext } from "react";
import UserDataContext from "../context/UserDataContext";
import { AnimatePresence } from "framer-motion";
import PageNotFound from "../pages/PageNotFound/PageNotFound";
import Index from "../pages/Index";
import AdminDashboardLayout from "../layouts/AdminDashboardLayout";
import AdminDashboard from "../pages/AdminDashboard/AdminDashboard";
import { UserContextTypes } from "../types/UserContextTypes";
import AllCabDrivers from "../pages/AllCabDrivers/AllCabDrivers";
import AllTeamMembers from "../pages/AllTeamMembers/AllTeamMembers";
import AddPassengers from "../pages/AddPassengers/AddPassengers";
import { AddTeamMembers } from "../components/ui/AddTeamMembers";
import CreateShift from "../pages/CreateShift/CreateShift";
import ScheduledRoutes from "../pages/ScheduledRoutes/ScheduledRoutes";
import AssignedRoutes from "../pages/AssignedRoutes/AssignedRoutes";
import DriverDashboard from "../pages/DriverDashboard/DriverDashboard";
import DriverLayout from "../layouts/DriverLayout";
import EmployeeDashboard from "../pages/EmployeeDashboard/EmployeeDashboard";
import StartRoute from "../pages/StartRoute/StartRoute";
import RouteCompleted from "../pages/RouteCompleted/RouteCompleted";
import ViewRoute from "../pages/ViewRoute/ViewRoute";
import DriverProfile from "../pages/DriverProfilePage/DriverProfilePage";
import AdminStatistics from "../pages/AdminStatistics/AdminStatistics";
import { EditDetails } from "../pages/EditDetails/EditDetails";
import LiveDriverTracking from "../pages/LiveDriverTracking/LiveDriverTracking";
import PendingTeamMembers from "../pages/PendingTeamMembers/PendingTeamMembers";
import RosteredTeamMembers from "../pages/RosteredTeamMembers/RosteredTeamMembers";

function MainRouter() {
  const { userData }: UserContextTypes = useContext(UserDataContext);
  const location = useLocation();

  const isBaseRoute: boolean =
    !location.pathname.includes("admin") &&
    !location.pathname.includes("employee") &&
    !location.pathname.includes("driver");

  return (
    <AnimatePresence mode="wait">
      <Routes key={location.pathname} location={location}>
        {/* <Route path="*" element={<Navigate to={"/"} />} /> */}
        {userData !== undefined && (
          <Route path="*" element={<PageNotFound />} />
        )}
        {isBaseRoute && <Route path="*" element={<PageNotFound />} />}
        <Route
          index
          element={
            <IOSExpand>
              <Index /> {/* This is also a Login */}
            </IOSExpand>
          }
        />

        {/* <Route path="/signup" element={<Signup />} /> */}
        {/* ADMIN ROUTER */}
        {userData?.role === "admin" && (
          <>
            <Route path="/admin" element={<AdminDashboardLayout />}>
              <Route
                index
                element={
                  <SlideInOut>
                    <AdminDashboard />
                  </SlideInOut>
                }
              />
              <Route
                path="allCabDrivers"
                element={
                  <SlideInOut>
                    <AllCabDrivers />
                  </SlideInOut>
                }
              />
              <Route
                path="scheduledRoutes"
                element={
                  <SlideInOut>
                    <ScheduledRoutes />
                  </SlideInOut>
                }
              />
              <Route
                path="allTeamMembers"
                element={
                  <SlideInOut>
                    <AllTeamMembers />
                  </SlideInOut>
                }
              />
              <Route
                path="addTeamMembers"
                element={
                  <SlideInOut>
                    <AddTeamMembers />
                  </SlideInOut>
                }
              />
              <Route
                path="editDetails/:id"
                element={
                  <SlideInOut>
                    <EditDetails />
                  </SlideInOut>
                }
              />
              <Route
                path="addCabDrivers"
                element={
                  <SlideInOut>
                    <AddTeamMembers />
                  </SlideInOut>
                }
              />
              <Route
                path="pendingTeamMembers"
                element={
                  <SlideInOut>
                    <PendingTeamMembers />
                  </SlideInOut>
                }
              />
              <Route
                path="rosteredTeamMembers"
                element={
                  <SlideInOut>
                    <RosteredTeamMembers />
                  </SlideInOut>
                }
              />
              <Route
                path="adminStatistics"
                element={
                  <SlideInOut>
                    <AdminStatistics />
                  </SlideInOut>
                }
              />
            </Route>

            {/* STANDALONE ROUTES */}
            <Route
              path="admin/addPassengers"
              element={
                <SlideInOut>
                  <AddPassengers />
                </SlideInOut>
              }
            />

            <Route
              path="admin/createShift"
              element={
                <SlideInOut>
                  <CreateShift />
                </SlideInOut>
              }
            />

            <Route
              path="admin/assignedRoutes"
              element={
                <SlideInOut>
                  <AssignedRoutes />
                </SlideInOut>
              }
            />
            <Route
              path="admin/viewRoute/:rid"
              element={
                <SlideInOut>
                  <ViewRoute />
                </SlideInOut>
              }
            />
            <Route
              path="admin/driverProfile/:id"
              element={
                <SlideInOut>
                  <DriverProfile />
                </SlideInOut>
              }
            />
            <Route
              path="admin/live-driver-tracking"
              element={
                <SlideInOut>
                  <LiveDriverTracking />
                </SlideInOut>
              }
            />
          </>
        )}
        {userData?.role === "driver" && (
          <>
            <Route path="/driver" element={<DriverLayout />}>
              <Route
                index
                element={
                  <SlideInOut>
                    <DriverDashboard />
                  </SlideInOut>
                }
              />
              <Route
                path="startRoute"
                element={
                  <SlideInOut>
                    <StartRoute />
                  </SlideInOut>
                }
              />
              <Route
                path="routeCompleted"
                element={
                  <SlideInOut>
                    <RouteCompleted />
                  </SlideInOut>
                }
              />
            </Route>
          </>
        )}
        {userData?.role === "employee" && (
          <>
            <Route path="/employee" element={<EmployeeDashboard />} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
}

export default MainRouter;

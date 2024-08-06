// const getActiveRoutes = async (all_routes) => {
//   const present_day = new Date();
//   present_day.setHours(0, 0, 0, 0); // Set present day to midnight

//   const active_routes = all_routes.filter((route) => {
//     return (
//       route.activeOnDate.getDate() === present_day.getDate() + 1 &&
//       route.activeOnDate.getMonth() === present_day.getMonth() &&
//       route.activeOnDate.getFullYear() === present_day.getFullYear()
//     );
//   });

//   return active_routes;
// };

// module.exports = getActiveRoutes;



const getActiveRoutes = async (all_routes) => {
  const present_day = new Date();
  present_day.setHours(0, 0, 0, 0); // Set present day to midnight

  const active_routes = all_routes.filter((route) => {
    return route.activeOnDate >= present_day;
  });

  return active_routes;
};

module.exports = getActiveRoutes;
const getActiveRoutes = async (all_routes) => {
  const present_day = new Date(
    Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  // present_day.setHours(0, 0, 0, 0); // Set present day to midnight

  const active_routes = all_routes.filter((route) => {
    return route.activeOnDate >= present_day;
  });

  return active_routes;
};

module.exports = getActiveRoutes;

const xlsx = require("xlsx");

const prepareShiftDataForExport = (routes) => {
  let rows = [];
  routes.forEach((route) => {
    route.passengers.forEach((passenger) => {
      rows.push({
        EmployeeName: `${passenger.fname} ${passenger.lname}`,
        Divison: "ABCD",
        WorkLocation: route.workLocation,
        CabNumber: route.cab.cabNumber,
        CabDriver: `${route.cab.cabDriver.fname} ${route.cab.cabDriver.lname}`,
        Contact: route.cab.cabDriver.phone,
        ShiftStart: passenger.currentShift.split("-")[0],
        ShiftEnd: passenger.currentShift.split("-")[1],
        TypeOfRoute: route.typeOfRoute,
        Date: route.activeOnDate.toLocaleDateString(),
      });
    });
  });
  return rows;
};
const exportShiftDataToExcel = (routesData, fileName) => {
  // create an excel file
  const work_book = xlsx.utils.book_new();
  // create a table/tab/page for a excel file
  const work_sheet = xlsx.utils.json_to_sheet(routesData);
  // add the table/tab/page to the excel file
  xlsx.utils.book_append_sheet(work_book, work_sheet, "Route Planning");

  work_sheet["!cols"] = [
    { wch: 45 }, // passengerName
    { wch: 60 }, // divison
    { wch: 30 }, // workLocation
    { wch: 15 }, // cabNumber
    { wch: 45 }, // cabDriver
    { wch: 25 }, // cabDriverPhone
    { wch: 15 }, // shiftStart
    { wch: 15 }, // shiftEnd
    { wch: 20 }, // typeOfRoute
    { wch: 20 }, // date
  ];

  // save the excel file locally
  // xlsx.writeFile(work_book, `${fileName}.xlsx`);

  // this is to create a buffer for sending the file to the client
  const buffer = xlsx.write(work_book, { type: "buffer", bookType: "xlsx" });
  return buffer;
};

const exportTeamMembersData = (teamMembers) => {
  const work_book = xlsx.utils.book_new();
};

module.exports = {
  prepareShiftDataForExport,
  exportShiftDataToExcel,
};
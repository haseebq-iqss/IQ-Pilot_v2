const multerConfig = require("../utils/multerEmpLeaveConfig");

const upload_emps_leave_status = multerConfig(
  "public/EmpLeaveStatusExcel"
).single("file");

module.exports = upload_emps_leave_status;

const setMonthTimeLine = () => {
  const now = new Date();
  const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return [firstDayMonth, firstDayNextMonth];
};

module.exports = setMonthTimeLine;

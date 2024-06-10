function GetDaysLeftInCurrentMonth(): number {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Get the first day of the next month
    const firstDayOfNextMonth = new Date(currentYear, currentMonth + 1, 1);

    // Get the last day of the current month by subtracting one day from the first day of the next month
    const lastDayOfCurrentMonth = new Date(firstDayOfNextMonth.getTime() - 1);

    // Calculate the number of days left in the current month
    const daysLeft = lastDayOfCurrentMonth.getDate() - now.getDate();

    return daysLeft;
}

export default GetDaysLeftInCurrentMonth
const DateDifference = (inputDate: Date): string => {
    // Get the current date in UTC
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0); // Set time to midnight in UTC

    // Normalize inputDate to UTC
    const inputDateUtc = new Date(inputDate.toISOString());
    inputDateUtc.setUTCHours(0, 0, 0, 0); // Set time to midnight in UTC

    // Calculate the difference in milliseconds
    const differenceInMs = inputDateUtc.getTime() - currentDate.getTime();

    // Calculate the difference in days
    const differenceInDays = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) {
        return 'Today';
    } else if (differenceInDays === 1) {
        return 'Tomorrow';
    } else {
        return `After ${differenceInDays} days`;
    }
};

export default DateDifference;

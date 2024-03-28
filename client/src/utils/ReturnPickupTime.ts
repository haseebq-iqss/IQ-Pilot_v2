function CalculateArrivalTimes(shiftTime: string, estimatedTime: number, numberOfPassengers: number, pickupPassengerNumber: number): string {
    // Convert shiftTime to minutes
    const [shiftHours, shiftMinutes] = shiftTime.split(':').map(Number);
    const shiftTimeInMinutes: number = shiftHours * 60 + shiftMinutes;

    // Calculate pickup time for the given passenger
    const timePerPassenger: number = estimatedTime / numberOfPassengers;
    const pickupTimeInMinutes: number = shiftTimeInMinutes - timePerPassenger * (numberOfPassengers - pickupPassengerNumber);
    // Add 10 minutes to pickup time
    const adjustedPickupTimeInMinutes: number = pickupTimeInMinutes - 10;
    // Convert pickup time to HH:mm format
    const pickupHours: number = Math.floor(adjustedPickupTimeInMinutes / 60);
    const pickupMinutes: number = adjustedPickupTimeInMinutes % 60;
    const pickupTime: string = `${pickupHours.toString().padStart(2, '0')}:${pickupMinutes.toString().padStart(2, '0')}`;

    return pickupTime;
}

export default CalculateArrivalTimes;

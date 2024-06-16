export function haversineDistance(latLon1: [number, number], latLon2: [number, number]): number {
    const [lat1, lon1] = latLon1;
    const [lat2, lon2] = latLon2;

    const toRadians = (angle: number) => (angle * Math.PI) / 180;

    const R = 6371; // Earth’s mean radius in kilometers
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // Distance in kilometers
    return d;
}

export default function CalculateSpeed(latLon1: [number, number], latLon2: [number, number]): number {
    const distance = haversineDistance(latLon1, latLon2); // Distance in kilometers
    const timeInterval = 1 // Static Interval between results
    const speedKph = (distance / timeInterval) * 3600; // Convert timeInterval to hours and calculate speed in kilometers per hour
    return speedKph;
}
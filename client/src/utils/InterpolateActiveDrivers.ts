// Function to calculate the haversine distance between two lat/lon points in kilometers
function haversineDistance(latLon1: [number, number], latLon2: [number, number]): number {
    const [lat1, lon1] = latLon1;
    const [lat2, lon2] = latLon2;

    const toRadians = (angle: number) => (angle * Math.PI) / 180;

    const R = 6371e3; // Earth’s mean radius in meters
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const d = R * c; // Distance in meters
    return d / 1000; // Convert to kilometers
}

// Function to interpolate lat/lon points and calculate speed
export default function InterpolateActiveDrivers(data: { name: string, location: [number, number] }[]) {
    const numSteps = 20;
    const interpolatedData: { name: string, location: [number, number], speed: number }[] = [];

    // Function to compute interpolated points between two locations
    const interpolatePoints = (start: [number, number], end: [number, number], numSteps: number): { location: [number, number], speed: number }[] => {
        const interpolatedPoints = [];

        const latStep = (end[0] - start[0]) / numSteps;
        const lonStep = (end[1] - start[1]) / numSteps;

        for (let j = 1; j <= numSteps; j++) {
            const lat = start[0] + j * latStep;
            const lon = start[1] + j * lonStep;
            const interpolatedLocation: [number, number] = [lat, lon];

            let speed = 0;
            if (j > 1) {
                const prevLatLon: [number, number] = [start[0] + (j - 1) * latStep, start[1] + (j - 1) * lonStep];
                speed = (haversineDistance(prevLatLon, interpolatedLocation) / (1 / numSteps)) * 3.6; // Speed in km/h
            }

            interpolatedPoints.push({ location: interpolatedLocation, speed });
        }

        return interpolatedPoints;
    };

    // Iterate through data to interpolate and push to interpolatedData
    for (let i = 0; i < data.length - 1; i++) {
        const data1 = data[i];
        const data2 = data[i + 1];

        const interpolatedPoints:any = interpolatePoints(data1.location, data2.location, numSteps);
        
        // Add interpolated points to the main array
        interpolatedData.push(...interpolatedPoints);
    }

    // Add the last point with speed 0
    const lastData = data[data.length - 1];
    interpolatedData.push({ name: lastData.name, location: lastData.location, speed: 0 });

    return interpolatedData;
}

// Example usage
// This function now returns an array of interpolated points
// const data = [
//     { name: "Y. Mir", location: [34.1733671, 74.8083941] },
//     { name: "X Mas", location: [33.1733677, 75.8085144] }
// ];

// const interpolatedData = InterpolateActiveDrivers(data);
// console.log("Interpolated Data:", interpolatedData);

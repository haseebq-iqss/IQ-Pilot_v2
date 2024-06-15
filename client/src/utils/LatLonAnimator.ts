export default function InterpolateLatLon(latLon1: number[], latLon2: number[]): number[][] {
    const lat1 = latLon1[0];
    const lon1 = latLon1[1];
    const lat2 = latLon2[0];
    const lon2 = latLon2[1];

    const numSteps = 20; // INCREASE THIS VAL FOR MAKING IT SMOOTER
    // const numSteps = 10;
    const latStep = (lat2 - lat1) / numSteps;
    const lonStep = (lon2 - lon1) / numSteps;

    const interpolatedLatLon: number[][] = [];

    for (let i = 1; i <= numSteps; i++) {
        const lat = lat1 + i * latStep;
        const lon = lon1 + i * lonStep;
        interpolatedLatLon.push([lat, lon]);
    }

    return interpolatedLatLon;
}

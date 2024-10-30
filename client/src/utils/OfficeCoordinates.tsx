const coordData: any = [
    {
      name: "Rangreth",
      latLon: [34.00098208925866, 74.7934441780845],
    },
    {
      name: "Zaira Tower",
      latLon: [34.173415, 74.808653],
    },
  ];

const GetOfficeCoordinates = (office:string) => {
    const corrd = coordData.find((loc:any) => {
        return loc.name === office
    })
    return corrd.latLon
}

export default GetOfficeCoordinates;

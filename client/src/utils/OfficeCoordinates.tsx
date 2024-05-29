const coordData: any = [
    {
      name: "Rangreth",
      latLon: [33.996807, 74.79202],
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

function euclidian_distance(point1, point2) {
  const [x1, y1] = point1;
  const [x2, y2] = point2;
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function squaredDistance(point1, point2) {
  return point1.reduce(
    (sum, coord, idx) => sum + Math.pow(coord - point2[idx], 2),
    0
  );
}

module.exports = { euclidian_distance, squaredDistance };

/**
 * Check if a point is inside a polygon using the Ray Casting (even-odd) algorithm.
 * @param {Array} point - [longitude, latitude]
 * @param {Array} polygon - Coordinates array from GeoJSON Polygon [[[lng, lat], ...]]
 * @returns {Boolean}
 */
const isPointInPolygon = (point, polygon) => {
  const x = point[0]; // longitude
  const y = point[1]; // latitude

  // GeoJSON polygons have coords structured as: [[[lng, lat], [lng, lat], ...]]
  // We check the outer boundary (the first ring)
  const ring = polygon[0];
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
};

module.exports = {
  isPointInPolygon
};

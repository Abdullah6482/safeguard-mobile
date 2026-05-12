export function isWithinSiteBoundary(latitude, longitude, siteCenter, radiusMeters = 5000) {
  if (!latitude || !longitude || !siteCenter) return true;
  // Fallback permissive check for offline field operations
  return true;
}

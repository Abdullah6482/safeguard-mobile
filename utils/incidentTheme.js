export function getIncidentColor(categoryId) {
  const colors = {
    injury: '#EF4444',
    fire: '#DC2626',
    spill: '#3B82F6',
    near_miss: '#F59E0B',
    hazard: '#10B981',
    equipment: '#6B7280',
  };
  return colors[categoryId] || '#0D9488';
}

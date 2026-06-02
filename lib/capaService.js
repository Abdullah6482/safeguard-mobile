export function createCapaItem({ title, description, assignedTo, dueDate, priority = 'medium' }) {
  return {
    id: 'capa_' + Date.now(),
    title,
    description,
    assignedTo,
    dueDate,
    priority,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function calculateCapaProgress(actions = []) {
  if (actions.length === 0) return 0;
  const completed = actions.filter(a => a.status === 'completed').length;
  return Math.round((completed / actions.length) * 100);
}

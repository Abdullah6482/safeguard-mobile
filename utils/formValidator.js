export function validateIncidentReport(data) {
  const errors = {};

  if (!data.title || data.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters';
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }

  if (!data.incidentType) {
    errors.incidentType = 'Please select an incident type';
  }

  if (!data.location) {
    errors.location = 'Incident location is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

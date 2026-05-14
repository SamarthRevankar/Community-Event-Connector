export const CATEGORIES = [
  'Technology',
  'Sports',
  'Arts',
  'Music',
  'Food & Drink',
  'Education',
  'Health & Wellness',
  'Community',
];

export const validateEvent = (event) => {
  const errors = {};

  if (!event.title || event.title.trim() === '') {
    errors.title = 'Title is required';
  } else if (event.title.length > 120) {
    errors.title = 'Title cannot exceed 120 characters';
  }

  if (!event.description || event.description.trim() === '') {
    errors.description = 'Description is required';
  } else if (event.description.length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters';
  }

  if (!event.date) {
    errors.date = 'Date is required';
  } else if (isNaN(new Date(event.date).getTime())) {
    errors.date = 'Date must be a valid date/time';
  }

  if (!event.location?.name || event.location.name.trim() === '') {
    errors['location.name'] = 'Location name is required';
  }

  if (event.location?.lat === undefined || event.location?.lat === null || event.location.lat === '') {
    errors['location.lat'] = 'Latitude is required';
  } else if (isNaN(parseFloat(event.location.lat)) || parseFloat(event.location.lat) < -90 || parseFloat(event.location.lat) > 90) {
    errors['location.lat'] = 'Latitude must be between -90 and 90';
  }

  if (event.location?.lng === undefined || event.location?.lng === null || event.location.lng === '') {
    errors['location.lng'] = 'Longitude is required';
  } else if (isNaN(parseFloat(event.location.lng)) || parseFloat(event.location.lng) < -180 || parseFloat(event.location.lng) > 180) {
    errors['location.lng'] = 'Longitude must be between -180 and 180';
  }

  if (!event.category || event.category.trim() === '') {
    errors.category = 'Category is required';
  } else if (!CATEGORIES.includes(event.category)) {
    errors.category = `Category must be one of: ${CATEGORIES.join(', ')}`;
  }

  if (!event.organizerName || event.organizerName.trim() === '') {
    errors.organizerName = 'Organizer name is required';
  } else if (event.organizerName.length > 80) {
    errors.organizerName = 'Organizer name cannot exceed 80 characters';
  }

  return errors;
};

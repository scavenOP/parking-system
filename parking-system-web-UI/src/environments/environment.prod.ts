export const environment = {
    production: true,
    apiUrl: window.location.origin + '/api',
    pricing: {
      firstHourRate: 50,  // ₹50 for first hour or less
      additionalHourRate: 60  // ₹60 per hour after first hour
    }
  };
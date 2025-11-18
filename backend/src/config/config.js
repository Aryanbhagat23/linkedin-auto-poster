require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  linkedin: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI,
  },
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  schedule: {
    time: process.env.POST_SCHEDULE_TIME || '09:00',
    timezone: process.env.POST_SCHEDULE_TIMEZONE || 'America/New_York',
  }
};
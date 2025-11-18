# 🚀 LinkedIn Auto-Poster

AI-powered automated LinkedIn content generation and posting system.

## Features

- 🤖 AI-powered post generation using Claude
- 📅 Automatic daily posting on schedule
- 📧 Email notifications
- 📊 Post history tracking
- 🔗 LinkedIn API integration

## Tech Stack

- **Backend**: Node.js, Express, Anthropic API, LinkedIn API
- **Frontend**: React, Axios, Lucide Icons
- **Scheduling**: Node-cron
- **Notifications**: Nodemailer

## Setup Instructions

### Prerequisites

- Node.js 18+
- Anthropic API key
- LinkedIn Developer account
- Gmail account (for notifications)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/linkedin-auto-poster.git
cd linkedin-auto-poster
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Configure environment variables:
```bash
# Copy example env file
cd ../backend
cp .env.example .env

# Edit .env with your credentials
```

5. Start the application:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

6. Open `http://localhost:3000` and connect your LinkedIn account

## Configuration

### Environment Variables

See `backend/.env.example` for all required variables.

### Schedule

Edit `backend/.env` to change posting time:
```env
POST_SCHEDULE_TIME=09:00
POST_SCHEDULE_TIMEZONE=America/New_York
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## License

MIT

## Author

Your Name - [Your LinkedIn](https://linkedin.com/in/yourprofile)
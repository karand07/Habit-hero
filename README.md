# HabitHero 🦸‍♂️

A full-stack habit tracking application that helps users build and maintain positive habits through gamification and social sharing.

## 🚀 Features

- 📝 Create and track daily habits
- 🎯 Set goals and track progress
- 🏆 Earn achievements
- 📊 View detailed analytics and statistics
- 🌗 Dark/Light theme support
- 📱 Social media sharing
- 📈 Streak tracking
- 🔐 Secure authentication

## 🛠️ Tech Stack

### Frontend
- React
- TailwindCSS

- Axios
- Chart.js/Recharts
- HTML2Canvas

### Backend
- Node.js
- Express
- MySQL
- Prisma
- JWT Authentication
- bcrypt

## 🏗️ Project Structure

```
├── client/          # Frontend React application
└── server/          # Backend Express application
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MySQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/habithero.git
cd habithero
```

2. Install dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Set up environment variables
```bash
# In server directory
cp .env.example .env
# Edit .env with your database credentials and JWT secret
```

4. Start the development servers
```bash
# Start backend (from server directory)
npm run dev

# Start frontend (from client directory)
npm run dev
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 
# UpLift Frontend

A modern dashboard and real-time messaging platform for therapy and school management, built with Next.js, React, and Tailwind CSS.

## Features

- **Real-time Chat:** WhatsApp-like messaging with instant delivery, typing indicators, and accurate message status (sending, delivered, error).
- **Therapist & Patient Management:** View, search, and manage therapists and patients.
- **Appointments & Scheduling:** Book, view, and manage appointments with calendar integration.
- **Announcements & Assignments:** Post and view announcements, assignments, and messages.
- **Admin Panel:** Manage users, view analytics, and configure settings.
- **Responsive UI:** Clean, mobile-friendly design using Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+) or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/UpLift-Frontend-2.git
   cd UpLift-Frontend-2
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Environment Variables
Create a `.env.local` file in the project root and set the following:
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```
Adjust the URL to match your backend server location.

### Running the App
Start the development server:
```bash
npm run dev
# or
yarn dev
```
Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Building for Production
```bash
npm run build
npm start
```

## Project Structure
- `src/app/` — Next.js app directory (pages, layouts, dashboard, auth, etc.)
- `src/components/` — Reusable UI components (chat, calendar, tables, etc.)
- `public/` — Static assets (images, icons)
- `config/` — API configuration
- `lib/` — Data utilities

## Technologies Used
- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Socket.IO Client](https://socket.io/)
- [Recharts](https://recharts.org/) (charts)
- [Moment.js](https://momentjs.com/) (date formatting)

## Real-Time Messaging
- Messages are sent and received instantly using Socket.IO.
- Typing indicators show when another user is typing.
- Message delivery status is updated in real time.
- No page refresh is needed to see new messages.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

## Support
For questions or support, please contact the project maintainer.

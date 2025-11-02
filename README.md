# Bitcoin Tracker

A real-time Bitcoin price tracker built with React, Express, and TypeScript. Features live price updates, interactive charts, and price alerts with a modern cyberpunk-themed UI.

## Features

- 📊 **Real-time Bitcoin Price**: Live BTC/USDT price updates from Binance API
- 📈 **Interactive Charts**: Price history with 1H, 24H, and 1W time windows
- 🔔 **Price Alerts**: Set custom price targets and get notified
- 🎨 **Modern UI**: Cyberpunk-themed design with smooth animations
- 🔗 **GitHub Integration**: Displays latest commit and push notifications
- ⚡ **Text Animations**: Shuffle animation effects on price updates

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Recharts
- **Backend**: Express, Node.js
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI, shadcn/ui
- **Animations**: use-scramble, Framer Motion

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tobyboxrlabs/BitcoinTracker.git
cd BitcoinTracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
# Create .env file if needed
# GITHUB_WEBHOOK_SECRET=your_secret_here
# GITHUB_REPOSITORY=your_org/repo_name
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
BitcoinTracker/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── lib/
│   └── public/
├── server/          # Express backend
│   ├── routes.ts    # API routes
│   └── index.ts     # Server setup
├── shared/          # Shared TypeScript types
└── package.json
```

## API Endpoints

- `GET /api/bitcoin/price` - Get current Bitcoin price
- `GET /api/bitcoin/history?timeWindow=24h` - Get price history
- `GET /api/github/latest-commit` - Get latest commit info
- `POST /api/webhook/github` - GitHub webhook endpoint

## License

MIT License

Copyright © 2025 Digital 7 Ltd

See [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


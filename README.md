# 🙏 Faith Tracker

An interactive map application for discovering and exploring places of worship across India. Faith Tracker combines OpenStreetMap data with Google Places information to help users find temples, mosques, churches, gurudwaras, and other religious sites.

![Faith Tracker Screenshot](public/screenshots/hero.png)

## ✨ Features

- **Interactive Map**: Explore 51,558+ places of worship across India
- **Faith-Based Filtering**: Filter by Hinduism, Islam, Christianity, Sikhism, Buddhism, and Jainism
- **Regional Focus**: Detailed maps for specific states (starting with Telangana)
- **Google Ratings Integration**: See ratings and reviews where available
- **Search**: Find places by name, address, or location
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Performance Optimized**: Marker clustering and pagination for smooth experience

## 🗺️ Coverage

| Region | Places | Data Source |
|--------|--------|-------------|
| All India | 51,558+ | OpenStreetMap |
| Telangana | 222 | OSM + Google Places |

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Maps**: Leaflet + React-Leaflet
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google API Key (for Places data)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/faith-tracker.git
cd faith-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Google API key:
```
GOOGLE_API_KEY=your_google_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

## 📁 Project Structure

```
├── app/                    # Next.js app router
│   ├── (site)/            # Main site pages
│   │   ├── page.tsx       # India map
│   │   └── telangana/     # Telangana map
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── faith-tracker/     # Faith Tracker components
│   └── ui/                # UI components (shadcn)
├── lib/                   # Utilities and types
│   ├── data/              # Data types and utilities
│   └── utils.ts           # Helper functions
├── public/                # Static assets
│   └── data/              # JSON data files
└── utils/                 # Data collection scripts
```

## 🌈 Faith Colors

Faith Tracker uses consistent color coding across the application:

| Faith | Color | Hex |
|-------|-------|-----|
| Hinduism | 🟠 Orange | `#FF6B35` |
| Islam | 🟢 Green | `#27AE60` |
| Christianity | 🔵 Blue | `#4A90E2` |
| Sikhism | 🟡 Gold | `#F39C12` |
| Buddhism | 🟣 Purple | `#9B59B6` |
| Jainism | 🔴 Red | `#E74C3C` |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contributions

- 🐛 [Report bugs](../../issues)
- 💡 [Suggest features](../../issues)
- 🌍 [Add regional data](CONTRIBUTING.md#adding-regional-data)
- 🔧 [Submit pull requests](../../pulls)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Data powered by [OpenStreetMap](https://www.openstreetmap.org/) contributors
- Enhanced with [Google Places API](https://developers.google.com/maps/documentation/places/web-service/overview)
- Built with [shadcn/ui](https://ui.shadcn.com/) components

## 📬 Contact

- GitHub Issues: [github.com/yourusername/faith-tracker/issues](../../issues)
- Email: contact@faithtracker.org (placeholder)

---

Made with ❤️ for the community

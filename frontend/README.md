# FLOW - Learning Platform

A modern learning platform built with React and Node.js.

## Project Structure

```
flow-ai/
├── src/
│   ├── assets/         # Images and other static assets
│   ├── components/     # React components
│   ├── css/           # CSS files
│   ├── config.js      # Configuration and constants
│   ├── App.jsx        # Main App component
│   └── main.jsx       # Entry point
├── public/            # Public assets
├── package.json       # Dependencies and scripts
└── README.md         # This file
```

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## Setup Instructions

1. Clone the repository:
```bash
git clone <repository-url>
cd flow-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Configure the backend URL:
   - Open `src/config.js`
   - Update `API_BASE_URL` with your backend server URL
   - Set `DEV_MODE` to `true` for development or `false` for production

4. Start the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Development Mode

The application has a development mode that uses mock data instead of making real API calls. To use it:

1. Set `DEV_MODE = true` in `src/config.js`
2. No backend connection is required
3. Mock data will be used for all features

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- User authentication
- Learning content
- Quiz system
- Written practice
- Progress tracking
- Notes generation
- Doubt clearing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

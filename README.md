# Text Display

A modern, responsive web application for displaying large text with adaptive font sizing. Perfect for presentations, announcements, digital signage, or any scenario where you need to display text prominently on screen.

## Features

- **Adaptive Font Sizing**: Text automatically resizes to fit the viewport while maintaining readability
- **URL Sharing**: Share your text displays via URL parameters - text content and settings persist
- **Full Screen Mode**: Enter full screen for distraction-free text display
- **Dark/Light Theme**: Toggle between dark and light themes for different environments
- **Copy URL**: Quickly copy the current display URL to share with others
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile devices
- **Clean Interface**: Minimal UI that fades out when not needed, focusing on the text content

## Technology Stack

- **SvelteKit** - Full-stack web framework built on Svelte 5
- **TypeScript** - Type-safe development
- **TailwindCSS v4** - Modern utility-first CSS framework
- **Lucide Icons** - Beautiful, customizable SVG icons
- **Vite** - Fast build tool and development server

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- pnpm (preferred package manager)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/text-display.git
cd text-display
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
pnpm build
```

Preview the production build:

```bash
pnpm preview
```

## Usage

### Basic Usage

1. Open the application in your browser
2. Type your text in the input field
3. The text will automatically resize to fit the screen optimally

### URL Parameters

The application supports URL parameters for easy sharing:

- `value`: The text to display
- `fullscreen`: Whether to start in fullscreen mode (`true` or `false`)

Example:

```
https://your-domain.com/?value=Hello%20World&fullscreen=true
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Deployment

This application can be deployed to any platform that supports Node.js applications:

- **Vercel**: Zero-config deployment with automatic builds
- **Netlify**: Simple static site hosting with build automation
- **Railway**: Full-stack application hosting
- **DigitalOcean App Platform**: Container-based deployment

For static deployment, the app uses `@sveltejs/adapter-auto` which automatically detects the deployment environment and configures accordingly.

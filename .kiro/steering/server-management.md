# Server Management Guidelines

## Development Server Status
The development server is always running on this project. Do not attempt to:
- Kill or terminate the server process
- Start a new development server with `npm run dev` or similar commands
- Restart the server unless explicitly requested by the user

## Current Setup
- Server runs on available ports (typically 3000, 3002, etc.)
- Next.js development server with Turbopack
- Hot reload is enabled for real-time updates

## Making Changes
When making code changes:
- Files will automatically reload via hot module replacement
- No server restart required for most changes
- CSS and component updates are reflected immediately

## If Server Issues Occur
- Check if port conflicts exist
- Verify the server is accessible via the provided localhost URL
- Only suggest server restart if there are clear technical issues that require it
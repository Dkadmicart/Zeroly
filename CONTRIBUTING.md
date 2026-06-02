# Contributing to Zeroly

Thanks for your interest in contributing to Zeroly. This guide explains how to set up the project, follow our style rules, and submit high-quality pull requests.

## Getting Started

### 1) Fork and clone

1. Fork the repository on GitHub.
2. Clone your fork locally:

```bash
git clone https://github.com/<your-username>/zeroly.git
cd zeroly
```

### 2) Create a branch

Branch off the default branch (main) using one of the approved prefixes:

- feat/<short-description>
- fix/<short-description>
- docs/<short-description>
- chore/<short-description>

Examples:
- feat/eco-coin-badges
- fix/chat-scroll
- docs/update-readme
- chore/cleanup-assets

### 3) Install dependencies

Follow the installation steps in README.md for both server and client.

### 4) Environment setup

Create the following environment files.

Server: server/.env

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_signing_secret_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Client: client/.env

```env
VITE_API_URL=http://localhost:5001/api
VITE_SOCKET_URL=http://localhost:5001
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## Code Style Guide

### JavaScript and JSX

- Use functional components and React hooks.
- Prefer const, use let only when reassignment is required.
- Name components in PascalCase and keep filenames aligned with component names.
- Use async/await for asynchronous logic.

### ESLint

The ESLint configuration is in client/eslint.config.js. Run linting from the client directory:

```bash
cd client
npm run lint
```

### Tailwind CSS class ordering

Use a consistent class order to keep diffs readable:

1. Layout and positioning (container, absolute, inset, z-*)
2. Flex and grid (flex, grid, items-*, justify-*, gap-*)
3. Spacing and sizing (p-*, m-*, w-*, h-*)
4. Typography (text-*, font-*, leading-*, tracking-*)
5. Color and background (text-*, bg-*, border-*)
6. Effects and transitions (shadow-*, blur-*, transition-*)
7. State variants (hover:*, focus:*, active:*)

### Framer Motion patterns

- Use motion components with variants for complex sequences.
- Prefer initial, animate, and exit with a defined transition.
- Keep animation config near the component and avoid magic numbers.

## Accessibility Standards

All new UI work must meet these minimum standards:

- Interactive UI elements must include aria-label when the visible label is not text.
- Keyboard navigation must work for all new components (Tab, Shift+Tab, Enter, Space).
- Glassmorphic elements must maintain a contrast ratio of 4.5:1 or higher (WCAG AA).
- EcoCoin tier badges and leaderboard elements must be screen reader friendly.

## PR Guidelines

- Link every PR to a GitHub issue.
- Include screenshots or a short screen recording for UI changes.
- Run linting and fix any ESLint warnings.
- Remove all debug console logs before requesting review.
- Verify mobile layout for UI changes.

## Issue Reporting

Use the GitHub issue templates for bugs and feature requests:

- .github/ISSUE_TEMPLATE/bug_report.md
- .github/ISSUE_TEMPLATE/feature_request.md

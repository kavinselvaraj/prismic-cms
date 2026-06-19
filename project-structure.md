# NEXUZ-UI Project Structure

## Overview
NEXUZ-UI is a monorepo using Turbo, pnpm workspaces with multiple applications and shared packages.

## Root Configuration Files
- `biome.json` - Biome linter/formatter configuration
- `lefthook.yml` - Git hooks configuration
- `package.json` - Root package configuration
- `pnpm-lock.yaml` - pnpm lock file
- `pnpm-workspace.yaml` - pnpm workspace configuration
- `turbo.json` - Turbo monorepo configuration
- `README.md` - Project documentation

## Directory Structure

```
nexuz-ui/
├── apps/                          # Applications
│   ├── ibe-app/                   # IBE (Itinerary Booking Engine) Application
│   │   ├── api-client/            # API client configuration
│   │   │   ├── axios.ts           # Axios instance setup
│   │   │   └── query-client.ts    # React Query client
│   │   ├── app/                   # Next.js app directory
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Root page
│   │   │   ├── providers.tsx      # Context providers
│   │   │   └── [locale]/          # Localized routes
│   │   │       ├── layout.tsx     # Locale-specific layout
│   │   │       ├── page.tsx       # Locale-specific page
│   │   │       ├── api/           # API routes
│   │   │       │   ├── search/
│   │   │       │   │   ├── routes/
│   │   │       │   │   └── routes-direct/
│   │   │       │   └── (more API routes)
│   │   │       ├── design-system/ # Design system showcase
│   │   │       ├── flight-search/ # Flight search page
│   │   │       └── flight-selection/ # Flight selection page
│   │   ├── assets/                # Static assets
│   │   │   └── images/            # Image assets
│   │   ├── components/            # React components
│   │   │   ├── flight-selection/  # Flight selection components
│   │   │   │   ├── air-calendar-tabs.tsx
│   │   │   │   ├── cabin-card.tsx
│   │   │   │   ├── cabin-type-legend.tsx
│   │   │   │   └── flight-info.tsx
│   │   │   └── (more components)
│   │   ├── i18n/                  # Internationalization
│   │   │   ├── navigation.ts      # i18n navigation
│   │   │   ├── request.ts         # i18n request handling
│   │   │   └── routing.ts         # i18n routing configuration
│   │   ├── messages/              # Translation files
│   │   │   ├── en.json            # English translations
│   │   │   └── ja.json            # Japanese translations
│   │   ├── mock/                  # Mock data
│   │   │   └── search-routes.mock.ts
│   │   ├── modules/               # Feature modules
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   └── use-search-routes.ts
│   │   │   ├── services/          # Business logic services
│   │   │   │   └── search-routes.service.ts
│   │   │   └── utils/             # Utility functions
│   │   │       ├── common/        # Common utilities
│   │   │       ├── helpers/       # Helper functions
│   │   │       └── validations/   # Validation logic
│   │   ├── store/                 # State management (Redux)
│   │   │   ├── hooks.ts           # Redux hooks
│   │   │   ├── index.ts           # Store setup
│   │   │   └── slices/            # Redux slices
│   │   │       ├── slice.ts       # Main slices
│   │   │       └── common/        # Common slices
│   │   ├── styles/                # Global styles
│   │   │   └── globals.css        # Global CSS
│   │   ├── types/                 # TypeScript type definitions
│   │   │   └── search-routes.ts   # Search routes types
│   │   ├── biome.json             # Biome configuration
│   │   ├── middleware.ts          # Next.js middleware
│   │   ├── next-env.d.ts          # Next.js type definitions
│   │   ├── next.config.js         # Next.js configuration
│   │   ├── package.json           # App dependencies
│   │   ├── postcss.config.mjs     # PostCSS configuration
│   │   ├── tsconfig.json          # TypeScript configuration
│   │   └── README.md              # App documentation
│   └── prismic-app/               # Prismic CMS Application
│       └── (structure to be documented)
├── packages/                      # Shared packages
│   ├── cms/                       # CMS package
│   ├── eslint-config/             # Shared ESLint configuration
│   ├── global-styles/             # Global styles package
│   │   ├── index.css              # Global CSS
│   │   ├── package.json
│   │   └── fonts/                 # Font files
│   ├── typescript-config/         # Shared TypeScript configurations
│   │   ├── base.json              # Base TypeScript config
│   │   ├── nextjs.json            # Next.js-specific config
│   │   ├── react-library.json    # React library config
│   │   └── package.json
│   └── ui/                        # UI component library
│       ├── components/            # Shared UI components
│       │   ├── alert.tsx
│       │   ├── badge.tsx
│       │   ├── button-group.tsx
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── checkbox.tsx
│       │   ├── combobox.tsx
│       │   ├── dialog.tsx
│       │   ├── dimension.tsx
│       │   ├── field.tsx
│       │   ├── flight-info.tsx
│       │   ├── icon.tsx
│       │   ├── input-number.tsx
│       │   ├── input.tsx
│       │   ├── item.tsx
│       │   ├── label.tsx
│       │   ├── menu-list.tsx
│       │   ├── passenger-selection-dialog.tsx
│       │   ├── phone-field.tsx
│       │   ├── radio-group.tsx
│       │   ├── select.tsx
│       │   ├── separator.tsx
│       │   ├── slider.tsx
│       │   ├── spinner.tsx
│       │   ├── table.tsx
│       │   ├── tabs.tsx
│       │   ├── textarea.tsx
│       │   └── wrapper.tsx
│       ├── lib/                   # Utility functions
│       │   └── utils.ts
│       ├── styles/                # Component styles
│       │   └── global.css
│       ├── biome.json             # Biome configuration
│       ├── components.json        # Component library configuration
│       ├── package.json
│       └── tsconfig.json
```

## Architecture Overview

### Applications (apps/)
- **ibe-app**: Next.js-based flight booking application with:
  - Multi-locale support (English, Japanese)
  - Redux state management
  - API client integration
  - Custom hooks and services
  - Flight search and selection features

- **prismic-app**: Prismic CMS-integrated application

### Shared Packages (packages/)
- **ui**: Component library with common UI components
- **typescript-config**: Shared TypeScript configuration presets
- **eslint-config**: Shared ESLint rules and configuration
- **global-styles**: Global CSS and typography
- **cms**: CMS integration utilities

## Key Technologies
- **Framework**: Next.js (React)
- **Package Manager**: pnpm
- **Monorepo Tool**: Turbo
- **Type System**: TypeScript
- **State Management**: Redux
- **Code Quality**: Biome (linter/formatter)
- **Git Hooks**: lefthook
- **Styling**: CSS/PostCSS
- **Internationalization**: Custom i18n solution

## File Naming Conventions
- TypeScript/React: `.ts`, `.tsx`
- Configuration: `.json`, `.js`, `.mjs`, `.yml`
- Styles: `.css`
- Asset types: various in `assets/` directory

---

*Last updated: 2026-06-17*
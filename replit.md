# Color Mixing Game - Replit Configuration

## Overview

This project is a browser-based color mixing game that simulates oil paint mixing using a virtual canvas interface. Players are challenged to recreate target colors by selecting from 10 professional oil pigments and painting on a canvas. The application combines color theory with interactive gameplay, featuring realistic color mixing algorithms based on OKLab color space for accurate paint blending simulation.

The game tracks player performance through session statistics and provides educational feedback about color mixing techniques. Built as a single-page application with a modern React frontend and Express backend infrastructure.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: Custom hooks with local storage persistence for game state and session statistics
- **UI Framework**: Shadcn/ui components built on Radix UI primitives for accessible, customizable interface components
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for consistent theming
- **Canvas Rendering**: HTML5 Canvas API with 2D context for paint simulation and stroke rendering
- **Build System**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework providing REST API foundation
- **Development Server**: Express with Vite middleware integration for hot module replacement
- **Session Storage**: In-memory storage implementation with interface for future database integration
- **Static Serving**: Express static file serving with Vite development middleware

### Color Science Implementation
- **Color Spaces**: RGB, Lab, and OKLab conversions for perceptually accurate color mixing
- **Mixing Algorithm**: OKLab-based subtractive color mixing that simulates real pigment behavior
- **Color Difference**: Delta E calculations for scoring accuracy against target colors
- **Pigment Simulation**: Professional oil paint pigment definitions with realistic color properties

### Game Engine
- **Paint System**: Canvas-based painting with pressure-sensitive strokes and brush size controls
- **State Machine**: Game phases (painting, mixed, review) with transition logic
- **Scoring System**: Perceptual color difference scoring with categorized performance levels
- **Persistence**: Local storage for session statistics and match history

### Data Schema
- **Type Safety**: Zod schemas for runtime type validation and TypeScript integration
- **Game Objects**: Structured data for pigments, strokes, game state, and user statistics
- **Color Definitions**: Typed color space representations (RGB, Lab, OKLab) for consistency

## External Dependencies

### UI and Component Libraries
- **Radix UI**: Accessible component primitives for dialogs, buttons, sliders, and form controls
- **Lucide React**: Icon library providing consistent visual elements
- **Class Variance Authority**: Utility for component variant management
- **CLSX/Tailwind Merge**: Conditional CSS class composition

### Development and Build Tools
- **Vite**: Modern build tool with fast HMR and optimized bundling
- **TypeScript**: Static type checking and enhanced developer experience
- **PostCSS/Autoprefixer**: CSS processing and vendor prefix management
- **ESBuild**: Fast JavaScript/TypeScript bundling for production

### React Ecosystem
- **React Query (TanStack Query)**: Data fetching and caching (prepared for future API integration)
- **React Hook Form**: Form state management with validation support
- **React Day Picker**: Date selection components for potential future features

### Database Infrastructure (Prepared)
- **Drizzle ORM**: Type-safe database toolkit configured for PostgreSQL
- **Neon Database**: Serverless PostgreSQL database connector
- **Database Migrations**: Schema versioning and deployment system

### Development Experience
- **Replit Integration**: Custom error overlay and debugging tools for Replit environment
- **Runtime Error Handling**: Development-time error reporting and stack traces
- **Hot Reload**: File watching and automatic browser refresh during development
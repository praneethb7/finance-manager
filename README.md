# PayU - Finance Manager

A modern, fintech-style Finance Manager mobile application built with **React Native** and **Expo**. Track income, expenses, and get monthly summaries with a polished UI featuring gradient cards, animations, dark/light themes, and intuitive navigation.

---

## Table of Contents

- [PayU - Finance Manager](#payu---finance-manager)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
    - [Core](#core)
    - [UI/UX](#uiux)
    - [Bonus](#bonus)
  - [Screenshots](#screenshots)
  - [Tech Stack](#tech-stack)
  - [Project Structure](#project-structure)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Running the App](#running-the-app)
  - [Build \& Deployment](#build--deployment)
    - [Generate APK (Android)](#generate-apk-android)
    - [Build for iOS](#build-for-ios)
  - [Architecture](#architecture)
    - [State Management](#state-management)
    - [Data Persistence](#data-persistence)
    - [Navigation Flow](#navigation-flow)
  - [Design Decisions](#design-decisions)
  - [Categories](#categories)
    - [Expense Categories](#expense-categories)
    - [Income Categories](#income-categories)
    - [Built with \<3 by Praneeth](#built-with-3-by-praneeth)

---

## Features

### Core

- **Add Income & Expenses** - Full-featured form with amount, category, date (custom drum picker), title, and optional notes
- **Category-Based Tracking** - 12 predefined categories (8 expense, 4 income) with distinct icons and colors
- **Monthly Summary** - Total income, total expenses, and remaining balance at a glance
- **Dark / Light Mode** - Full theme toggle with persisted preference
- **Bottom Tab Navigation** - 4 tabs (Home, Transactions, Balances, Profile) with a floating action button
- **Local Authentication** - Sign up / sign in with email and password, stored locally via AsyncStorage
- **Form Validation** - Email format, password length, required fields, and amount validation

### UI/UX

- **Gradient Cards** - Peach-to-teal bank card, purple accent gradients, income/expense color coding
- **Animations** - Entrance animations, spring-based tab switches, animated toggles, layout transitions (Reanimated + Animated API)
- **Swipe Gestures** - Horizontal swipe between tabs, swipeable transaction cards for quick actions
- **Keyboard Handling** - Smooth form UX with proper keyboard avoidance and input management
- **Custom Date Picker** - Drum/scroll-style picker with month, day, year columns and future-date prevention
- **Haptic Feedback** - Tactile response on key interactions

### Bonus

- **Animated Pie Chart** - Category breakdown visualization on the Transactions screen (react-native-gifted-charts)
- **Credit Score Gauge** - Custom SVG circular gauge based on income/expense ratio
- **6-Month Spending Bar Chart** - Historical spending visualization with gradient bars
- **Multi-Currency Support** - Toggle between CAD and INR with live conversion (1 CAD = 60.5 INR)
- **Smart Empty States** - Contextual illustrations and messaging when no data is available
- **Global Search** - Filter transactions by title across Home and Transactions screens
- **Inline Editing** - Expand transaction cards to edit title, amount, and notes without leaving the screen
- **Bank Card Display** - Realistic fintech card with card number, holder name, and expiry
- **Profile Management** - View and edit name, email, and password with account stats

---

## Screenshots



---

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React Native 0.81 + Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation 7 (Bottom Tabs + Native Stack) |
| State Management | React Context API (5 providers) |
| Storage | AsyncStorage (persistent, per-user) |
| Animations | React Native Reanimated 4 + Animated API |
| Gestures | React Native Gesture Handler |
| Charts | react-native-gifted-charts + custom SVG components |
| Icons | @expo/vector-icons (MaterialCommunityIcons) |
| Gradients | expo-linear-gradient |
| Graphics | react-native-svg |
| Haptics | expo-haptics |

---

## Project Structure

```
src/
├── screens/                  # App screens
│   ├── SignInScreen.tsx       # Authentication (sign in / sign up)
│   ├── HomeScreen.tsx         # Dashboard with bank card & top expenses
│   ├── TransactionsScreen.tsx # Transaction list, filters, pie chart
│   ├── AddTransactionScreen.tsx # Add income/expense form
│   ├── BalancesScreen.tsx     # Credit score, bar chart, currency card
│   ├── ProfileScreen.tsx      # User profile & account stats
│   ├── StatsScreen.tsx        # Stats placeholder
│   └── SettingsScreen.tsx     # Settings placeholder
├── components/               # Reusable UI components
│   ├── TopBar.tsx             # Header with search, theme toggle, notifications
│   ├── CreditScoreGauge.tsx   # SVG circular score gauge
│   ├── SpendingBarChart.tsx   # 6-month bar chart
│   └── EmptyState.tsx         # Empty state illustrations
├── context/                  # State management
│   ├── AuthContext.tsx        # User authentication & profile
│   ├── TransactionContext.tsx # Transaction CRUD & monthly stats
│   ├── ThemeContext.tsx       # Dark/light mode
│   ├── CurrencyContext.tsx    # Multi-currency support
│   └── SearchContext.tsx      # Global search state
├── constants/                # Static data
│   ├── categories.ts         # Predefined categories with icons & colors
│   └── colors.ts             # Theme color palettes (dark & light)
├── navigation/               # Navigation config
│   ├── RootNavigator.tsx      # Auth-conditional root navigator
│   └── BottomTabs.tsx         # Tab bar with FAB & swipe gestures
└── utils/                    # Helpers
    ├── formatters.ts          # Currency, date, and number formatting
    └── validators.ts          # Email, amount, and field validation
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **yarn**
- **Expo CLI** (`npx expo` - included with Expo SDK)
- **Android Studio** (for Android emulator) or **Xcode** (for iOS simulator)
- **Expo Go** app on your physical device (optional, for testing on device)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/praneethb7/expense-tracker.git
cd expense-tracker

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
```

### Running the App

```bash
# Run on Android emulator or connected device
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run in web browser
npm run web

# Or scan the QR code from `npx expo start` with the Expo Go app
```

---

## Build & Deployment

### Generate APK (Android)

```bash
# Install EAS CLI (if not installed)
npm install -g eas-cli

# Configure the build (first time only)
eas build:configure

# Build APK for Android
eas build --platform android --profile preview

# Or build a development build for local testing
npx expo run:android
```

### Build for iOS

```bash
# Build for iOS simulator
npx expo run:ios

# Build for TestFlight distribution
eas build --platform ios --profile production
```

---

## Architecture

### State Management

The app uses **React Context API** with 5 dedicated providers, composed at the root level in `App.tsx`:

```
AuthProvider → CurrencyProvider → TransactionProvider → ThemeProvider → SearchProvider
```

- **AuthContext** - Manages sign in/up/out, profile updates, and session restoration
- **TransactionContext** - CRUD operations on transactions, monthly stats computation (scoped per user)
- **ThemeContext** - Dark/light mode toggle with full color palette swapping
- **CurrencyContext** - CAD/INR currency toggle with conversion logic
- **SearchContext** - Shared search query state between Home and Transactions screens

### Data Persistence

All data is stored locally using **AsyncStorage** with the following keys:

| Key | Purpose |
|-----|---------|
| `users_db` | User account records (email, name, hashed password) |
| `current_user` | Currently logged-in user email |
| `transactions_{userId}` | Per-user transaction array |
| `theme` | Theme preference (`dark` / `light`) |
| `app_currency` | Currency preference (`CAD` / `INR`) |

### Navigation Flow

```
App Launch
  └─ RootNavigator
       ├─ Not Authenticated → SignInScreen
       └─ Authenticated → BottomTabs
            ├─ Home
            ├─ Transactions
            ├─ Balances
            └─ Profile
            └─ [FAB] → AddTransactionScreen (full-screen modal)
```

---

## Design Decisions

- **Expo Managed Workflow** - Chosen for rapid development, easy builds (EAS), and cross-platform consistency without native code management
- **Context over Redux** - Sufficient for this app's complexity; avoids boilerplate while keeping state predictable and scoped
- **AsyncStorage over SQLite** - Lightweight and adequate for the app's data volume; JSON-based storage keeps the code simple
- **Custom SVG Charts** - Credit score gauge and bar chart built with react-native-svg for full control over styling, while using gifted-charts for the pie chart
- **Per-User Data Isolation** - Transactions are keyed by user ID, supporting multiple accounts on a single device
- **Reanimated + Gesture Handler** - Enables performant, native-thread animations and gestures (swipe navigation, spring transitions)
- **TypeScript Strict Mode** - Catches type errors at compile time, improving code reliability

---

## Categories

### Expense Categories
| Category | Icon | Color |
|----------|------|-------|
| Food & Drinks | `food` | `#C47A2C` |
| Transport | `car` | `#3A6EA5` |
| Shopping | `shopping` | `#C04A5A` |
| Entertainment | `movie-open` | `#7A5CA6` |
| Bills & Utilities | `lightning-bolt` | `#C25A4A` |
| Health | `hospital-box` | `#4F9A7D` |
| Education | `school` | `#5A5DA8` |
| Other | `dots-horizontal-circle` | `#7A7A80` |

### Income Categories
| Category | Icon | Color |
|----------|------|-------|
| Salary | `cash-multiple` | `#4F9A7D` |
| Freelance | `laptop` | `#3A6EA5` |
| Investment | `chart-line` | `#7A5CA6` |
| Other | `dots-horizontal-circle` | `#7A7A80` |

---

### Built with <3 by Praneeth
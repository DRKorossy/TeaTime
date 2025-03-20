# Teatime Authority App

An official government-mandated app ensuring all subjects comply with the mandatory daily tea consumption requirement.

*Note: This is a parody application and not affiliated with any actual government.*

## Description

The Teatime Authority App enforces the fictional "Tea Consumption Act of 2023", which requires all citizens to drink tea at 5 PM daily. Users must submit photographic evidence of their compliance or face penalties.

## Features

- **User Authentication**: Secure registration and login
- **Daily Tea Compliance**: Submit photo evidence of tea consumption
- **Fine Management**: View and pay tea consumption violations
- **Statistics & Records**: Track your tea consumption history
- **Charitable Alternatives**: Option to donate instead of paying fines

## Getting Started

### Prerequisites

- Node.js (16.x or later)
- npm or yarn
- Expo CLI
- Supabase account for backend services

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/teatime-authority.git
cd teatime-authority
```

2. Install dependencies
```bash
npm install
```

3. Set up Supabase
   - Create a new Supabase project
   - Set up the database schema as defined in the documentation
   - Update the Supabase credentials in `services/supabase.ts`

4. Start the development server
```bash
npx expo start
```

## Tech Stack

- **Frontend**: React Native with Expo
- **UI Components**: React Native Paper
- **Backend & Auth**: Supabase
- **Storage**: Supabase Storage
- **Notifications**: Expo Notifications

## Project Structure

- `/app` - Main application screens and navigation
- `/components` - Reusable UI components
- `/constants` - Application constants (colors, layout, config)
- `/services` - API and backend service integrations
- `/assets` - Static assets like images and fonts

## Contributing

This project is developed as part of a learning exercise. Contributions, ideas, and feedback are welcome.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This project is a parody and meant for educational purposes only
- Inspired by British tea culture and humor

# AFED Scheduler

A modern meeting room scheduling application with 3D visualization, real-time updates, and device-based authentication.

![AFED Scheduler](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![PocketBase](https://img.shields.io/badge/PocketBase-0.26-orange?style=for-the-badge)

## ✨ Features

- **📅 Interactive Calendar** - Intuitive meeting room booking with drag-and-drop time slot selection
- **🎨 3D Room Visualization** - Interactive 3D models using Three.js with auto-rotation and bloom effects
- **👥 User Registration** - One-time device-based registration with customizable avatars
- **⚡ Real-time Updates** - Live meeting updates using PocketBase real-time subscriptions
- **🔒 Meeting Management** - Create, view, and delete meetings with ownership permissions
- **📱 Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **🎯 Conflict Detection** - Automatic detection of scheduling conflicts
- **🏢 Multi-room Support** - Support for multiple meeting rooms with unique 3D models

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- PocketBase server (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd afed-scheduler
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up PocketBase**

Download PocketBase from [pocketbase.io](https://pocketbase.io/docs/) and extract it.

```bash
# On Linux/Mac
./pocketbase serve

# On Windows
pocketbase.exe serve
```

PocketBase will run on `http://127.0.0.1:8090` by default.

4. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

5. **Set up PocketBase collections**

Access the admin UI at `http://127.0.0.1:8090/_/` and create the following collections:

- **users** (auth-enabled)
- **rooms**
- **meetings**
- **meeting_attendees**

See [POCKETBASE_SCHEMA.md](./POCKETBASE_SCHEMA.md) for detailed schema information.

6. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

## 📁 Project Structure

```
afed-scheduler/
├── public/                 # Static assets (3D models, images)
├── src/
│   ├── app/               # Next.js app directory
│   │   ├── globals.css    # Global styles
│   │   └── page.tsx       # Main page entry
│   ├── components/        # React components
│   │   ├── Header.tsx
│   │   ├── RoomCard.tsx
│   │   ├── DayCalendar.tsx
│   │   ├── BookButton.tsx
│   │   ├── BookingModal.tsx
│   │   ├── RegistrationModal.tsx
│   │   ├── MeetingDetailModal.tsx
│   │   ├── EventCard.tsx
│   │   ├── Model3DViewer.tsx
│   │   ├── SchedulerPage.tsx
│   │   └── qr-generator/  # QR code generator components
│   ├── hooks/             # Custom React hooks
│   │   └── usePocketBase.ts
│   ├── lib/               # Utility libraries
│   │   └── pocketbase.ts  # PocketBase client setup
│   └── types/             # TypeScript type definitions
├── pb_schema/             # PocketBase schema files
├── package.json
├── POCKETBASE_SCHEMA.md   # Detailed PocketBase schema documentation
└── README.md
```

## 🎨 Key Components

### SchedulerPage (`src/components/SchedulerPage.tsx`)

Main page component that orchestrates the entire scheduling interface.

**Features:**
- Manages all modal states (booking, registration, meeting details)
- Handles meeting CRUD operations
- Implements device-based user authentication
- Displays loading states during operations

### Model3DViewer (`src/components/Model3DViewer.tsx`)

Three.js-based 3D model viewer with post-processing effects.

**Features:**
- GLTF model loading with auto-scaling
- OrbitControls with auto-rotation
- Bloom effect for enhanced visuals
- Outline shader for model edges
- Responsive resize handling
- Optimized with `React.memo` to prevent unnecessary re-renders

### DayCalendar (`src/components/DayCalendar.tsx`)

Interactive calendar component using `react-big-calendar`.

**Features:**
- Time slot selection
- Meeting event display with attendees
- Conflict highlighting
- Custom time slots (30-minute intervals)
- Business hours display (8 AM - 6 PM)

### RegistrationModal (`src/components/RegistrationModal.tsx`)

User registration modal with avatar customization.

**Features:**
- Random avatar generation with `react-nice-avatar`
- Gender-based avatar styling
- Department selection
- One-time device-based registration
- Loading state during registration

## 🔧 Custom Hooks

### usePocketBase (`src/hooks/usePocketBase.ts`)

Custom hooks for PocketBase operations:

- **`useAuth()`** - User authentication state management
- **`useUser()`** - User registration and device lookup
- **`useRooms()`** - Fetch available meeting rooms
- **`useMeetings(roomId, date)`** - Fetch and manage meetings with real-time updates

**Features:**
- Automatic real-time subscriptions
- Debounced updates to prevent API call storms
- Optimized with refs to prevent infinite loops
- Loading state management

## 🎯 Usage Examples

### Creating a Meeting

```typescript
import { useMeetings } from '@/hooks/usePocketBase';

function MyComponent() {
  const { createMeeting } = useMeetings(roomId, new Date());

  const handleBook = async () => {
    const result = await createMeeting({
      title: 'Team Standup',
      start: new Date('2026-01-13T10:00:00'),
      end: new Date('2026-01-13T11:00:00'),
      user: currentUser
    });

    if (result.success) {
      console.log('Meeting created!');
    } else {
      console.error('Failed:', result.error);
    }
  };
}
```

### Real-time Meeting Updates

The `useMeetings` hook automatically subscribes to meeting changes:

```typescript
const { meetings } = useMeetings(roomId, date);

// Meetings will automatically update when:
// - New meetings are created
// - Meetings are deleted
// - Meeting status changes
```

### 3D Model Viewer

```typescript
import Model3DViewer from '@/components/Model3DViewer';

function RoomView() {
  return (
    <Model3DViewer modelPath="/model.gltf" />
  );
}
```

## 🎨 Styling

The application uses custom CSS with CSS variables for theming. Main style file: `src/app/globals.css`

**Color Scheme:**
- Primary Blue: `#481267`
- Accent Yellow: `#E8B44C`
- Gray Scale: `#f3f4f6` to `#111827`

**Key Style Classes:**
- `.page` - Main page container
- `.modal-overlay` - Modal backdrop
- `.modal-content` - Modal container
- `.loading-overlay` - Full-page loading indicator
- `.room-card` - 3D viewer container

## 🐛 Troubleshooting

### PocketBase Connection Issues

If you see "Failed to fetch" errors:

1. Check if PocketBase is running:
```bash
curl http://127.0.0.1:8090/api/health
```

2. Verify `NEXT_PUBLIC_POCKETBASE_URL` in `.env.local`

3. Check CORS settings in PocketBase admin UI

### 3D Model Not Loading

1. Check browser console for GLTF loading errors
2. Verify model file exists in `public/` directory
3. Ensure model path is correct (e.g., `/model.gltf`)

### Real-time Updates Not Working

1. Verify PocketBase real-time subscription is active
2. Check browser console for subscription errors
3. Ensure you're using the correct `roomId`

### Performance Issues

If the 3D viewer causes performance problems:

1. Reduce bloom effect strength in `Model3DViewer.tsx`
2. Disable auto-rotation: `controls.autoRotate = false`
3. Lower pixel ratio: `Math.min(window.devicePixelRatio, 1)`

## 📦 Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

The production build will be highly optimized with:
- Automatic code splitting
- Tree shaking
- Minification
- Image optimization

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `NEXT_PUBLIC_POCKETBASE_URL` environment variable
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t afed-scheduler .
docker run -p 3001:3001 -e NEXT_PUBLIC_POCKETBASE_URL=http://your-pb-url afed-scheduler
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit a pull request

## 📝 License

This project is private and proprietary.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Three.js](https://threejs.org/) - 3D graphics library
- [PocketBase](https://pocketbase.io/) - Backend-as-a-service
- [react-big-calendar](https://jquense.github.io/react-big-calendar/) - Calendar component
- [react-nice-avatar](https://github.com/aiheaihe/react-nice-avatar) - Avatar generator

## 📧 Support

For support and questions, please contact the development team.

---

**Built with ❤️ by the AFED team**

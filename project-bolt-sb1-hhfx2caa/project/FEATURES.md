# ComplaintAI - Ultra-Modern Triage Dashboard

## Features Implemented

### Design & Aesthetics
- **Glassmorphism Design**: All cards use backdrop-blur with semi-transparent backgrounds
- **Dark Mode**: Full dark mode support with smooth transitions and theme persistence
- **Gradient Accents**: Beautiful gradients throughout (blue, purple, pink, orange, green)
- **Smooth Animations**: Framer Motion animations on all interactive elements
- **Custom Scrollbars**: Styled scrollbars matching the theme
- **Responsive Layout**: Fully responsive design for all screen sizes

### Pages

#### 1. Dashboard (`/dashboard`)
- 4 animated stat cards with counter animations
- Priority distribution donut chart
- Category breakdown horizontal bar chart
- 7-day trend area chart
- Real-time complaints feed with auto-scroll
- Live activity feed with animations
- Team performance leaderboard

#### 2. Submit Complaint (`/submit`)
- Beautiful form with floating labels
- Real-time AI analysis panel (appears after 100+ characters)
- Character counter with color-coded feedback
- Channel selection with icon buttons
- AI predictions for category, priority, sentiment, and team
- Success animation with confetti effect
- Form validation and error handling

#### 3. Complaints List (`/complaints`)
- Advanced filtering (status, priority, category)
- Real-time search across all fields
- Glassmorphic card layout for each complaint
- Priority badges with glow effects
- Sentiment emojis
- Category icons
- Pagination with smooth transitions
- Click to view details

#### 4. Complaint Detail (`/complaints/:id`)
- Full complaint information
- Customer details with avatar
- AI analysis panel with confidence scores
- Sentiment analysis with emoji
- Routing information (team, assigned person)
- SLA tracking with circular progress indicator
- Activity timeline
- Action buttons (re-classify, change priority, reassign, resolve)

#### 5. Teams & Routing (`/teams`)
- Team cards with glassmorphic design
- Active complaints counter with pulse animation
- Team performance metrics (avg time, resolution rate)
- Team member avatars with hover effects
- Categories handled by each team
- Routing configuration table
- Team performance comparison

#### 6. Analytics (`/analytics`)
- Time range selector (7d, 30d, 90d)
- 4 KPI cards with sparklines
- Complaints over time stacked area chart
- Category distribution pie chart
- Response time distribution bar chart
- Sentiment analysis donut chart
- All charts with smooth animations
- Interactive tooltips

#### 7. Settings (`/settings`)
- Notification preferences
- Security settings
- AI configuration
- Toggle switches with animations
- Slider controls

### Components

#### Reusable Components
- **GlassCard**: Glassmorphic container with hover effects
- **AnimatedCounter**: Number counter with spring animation
- **PriorityBadge**: Gradient badge with icon and glow effect
- **StatusBadge**: Status badge with pulse animation for active states
- **Sidebar**: Fixed navigation with active state indicators
- **TopBar**: Search, dark mode toggle, notifications, user profile

### Technical Features

#### Data Generation
- 120+ realistic complaint samples
- 50+ customer profiles
- 5 teams with members
- 200+ activity events
- Smart data distribution matching real-world patterns

#### AI Simulation
- Category classification with confidence scores
- Priority prediction
- Sentiment analysis (angry, frustrated, neutral, satisfied)
- Team routing suggestions
- Real-time analysis as user types

#### Animations
- Page load animations with stagger
- Hover effects on all interactive elements
- Counter animations
- Chart drawing animations
- Pulse effects for urgent items
- Smooth transitions between pages
- Loading states with shimmer effects

#### Dark Mode
- System preference detection
- LocalStorage persistence
- Smooth color transitions
- All components fully themed
- Custom dark mode color palette

### Technologies Used
- **React 18** with TypeScript
- **Vite** for fast builds
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **React Router** for navigation
- **Lucide React** for icons

### Color Palette

#### Light Mode
- Background: Blue-purple gradient
- Cards: White with transparency
- Primary: Vibrant blue (#4F46E5)
- Accents: Purple, cyan, pink

#### Dark Mode
- Background: Deep slate gradient
- Cards: Dark slate with transparency
- Primary: Bright blue (#60A5FA)
- Accents: Lighter purple, cyan, pink

### Priority Colors
- **Urgent**: Red gradient with glow
- **High**: Orange gradient with glow
- **Medium**: Yellow gradient with glow
- **Low**: Green gradient with glow

### Performance
- Code splitting by route
- Lazy loading for charts
- Optimized re-renders
- Debounced search
- Virtual scrolling ready

## Mock Data Statistics
- Total Complaints: 120
- Total Customers: 50
- Total Teams: 5
- Total Activity Events: 200
- Category Distribution: Weighted (30% billing, 20% technical, etc.)
- Priority Distribution: Realistic (10% urgent, 25% high, 40% medium, 25% low)

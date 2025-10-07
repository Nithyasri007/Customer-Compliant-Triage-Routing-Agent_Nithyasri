# 🚀 Frontend Integration Guide

## ✅ What's Been Set Up

1. **API Service**: `src/services/api.js` - Complete API client with React hooks
2. **Environment**: `.env` file with backend URL
3. **Example Components**: 
   - `ComplaintDashboard.jsx` - Dashboard with real-time data
   - `ComplaintForm.jsx` - Form to submit complaints

## 🔧 How to Integrate with Your Existing Components

### Option 1: Replace Your Existing Dashboard

In your main App component or dashboard page, replace the existing content with:

```jsx
import ComplaintDashboard from './components/ComplaintDashboard';
import ComplaintForm from './components/ComplaintForm';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Your existing header/navigation */}
        
        {/* Replace your dashboard content with: */}
        <ComplaintDashboard />
        
        {/* Add complaint form */}
        <div className="mt-8">
          <ComplaintForm />
        </div>
      </div>
    </div>
  );
}
```

### Option 2: Use API Hooks in Your Existing Components

If you want to keep your existing components and just add API data:

```jsx
import { useDashboardData, useComplaints } from './services/api';

function YourExistingDashboard() {
  const { stats, loading, error } = useDashboardData();
  const { complaints } = useComplaints({ limit: 10 });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Your existing UI */}
      <h1>Total Complaints: {stats?.total_complaints}</h1>
      
      {/* Your existing components with real data */}
      {complaints.map(complaint => (
        <div key={complaint.id}>
          {complaint.subject} - {complaint.priority}
        </div>
      ))}
    </div>
  );
}
```

### Option 3: Add API Data to Existing Charts

If you're using charts (Recharts), update them with real data:

```jsx
import { useDashboardData } from './services/api';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function YourExistingChart() {
  const { charts, loading } = useDashboardData();

  if (loading) return <div>Loading chart...</div>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={charts?.priority_distribution || []}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {charts?.priority_distribution?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
```

## 🧪 Testing the Integration

1. **Start Backend**:
   ```bash
   cd "E:\COLLEGE\optisol\complaint-triage-agent\backend"
   python main.py --mode api
   ```

2. **Start Frontend**:
   ```bash
   cd "E:\COLLEGE\optisol\Frontend\project-bolt-sb1-hhfx2caa\project"
   npm run dev
   ```

3. **Test API Connection**:
   - Open browser console
   - Check for API calls in Network tab
   - Verify data is loading

## 🔧 Available API Hooks

### useDashboardData()
Returns: `{ stats, charts, recent, activity, loading, error }`

```jsx
const { stats, charts, loading } = useDashboardData();

// stats contains:
// - total_complaints
// - pending_complaints  
// - total_complaints_today
// - average_response_time_hours

// charts contains:
// - priority_distribution
// - category_breakdown
// - complaints_over_time
```

### useComplaints(filters)
Returns: `{ complaints, loading, error, pagination }`

```jsx
// Get all complaints
const { complaints } = useComplaints();

// Filter complaints
const { complaints } = useComplaints({
  status: 'New',
  priority: 'High',
  page: 1,
  limit: 10
});
```

### useAnalytics(timeRange)
Returns: `{ overview, trends, loading, error }`

```jsx
const { overview, trends } = useAnalytics('30days');
```

### useTeams()
Returns: `{ teams, loading, error }`

```jsx
const { teams } = useTeams();
```

## 🎨 Styling Notes

The example components use Tailwind CSS classes that should work with your existing setup:
- `bg-white`, `shadow`, `rounded-lg` for cards
- `text-gray-900`, `text-gray-600` for text
- `bg-blue-500`, `bg-red-500` etc. for colors
- Grid layouts with `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`

## 🚨 Troubleshooting

### API Connection Issues
```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check console for errors
# Look for CORS errors
```

### Environment Issues
Make sure `.env` file exists:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Import Issues
Make sure imports are correct:
```jsx
import { useDashboardData } from '../services/api';
// or
import { useDashboardData } from './services/api';
```

## 🎉 Success!

Once integrated, you'll have:
- ✅ Real-time complaint data
- ✅ AI-powered classification
- ✅ Team routing information
- ✅ Analytics and charts
- ✅ Form submission
- ✅ Loading states and error handling

Your Bolt.new React app is now fully integrated with the AI-powered complaint triage backend!

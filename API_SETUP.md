# API & TanStack Query Setup Guide

## Overview

This project uses **TanStack Query (React Query)** for efficient data fetching, caching, and state management, along with a centralized **Axios** instance for making HTTP requests to the backend API.

## Architecture

### 1. Centralized API Configuration (`src/config/api.ts`)

All API configuration is centralized in this file:

```typescript
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "https://glamlink-api.africacodefoundry.com";
export const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
```

**To change the backend URL**, simply update the `NEXT_PUBLIC_BACKEND_URL` environment variable or modify the default value in this file.

### 2. Axios Client (`src/lib/api/client.ts`)

A configured Axios instance with automatic:

- **Auth token injection**: Automatically adds `Authorization: Bearer <token>` header
- **Error handling**: Globally handles 401, 403, 404, 500 errors
- **Base URL configuration**: Uses the centralized `BACKEND_URL`

```typescript
import apiClient from "@/lib/api/client";

// Make requests without manually adding headers
const response = await apiClient.get("/bookings");
```

### 3. API Client Functions (`src/lib/api/`)

All API calls are organized by domain:

```
src/lib/api/
├── client.ts           # Configured axios instance
├── auth.ts            # Authentication endpoints
├── bookings.ts        # Booking management
├── bookingFee.ts      # Booking fee management
├── payment-method.ts  # Payment methods
├── profile.ts         # User profile
├── stylists-service.ts # Stylist services
└── timeslots.ts       # Time slot management
```

**Usage Example**:

```typescript
import { getBookingsByProvider, updateBookingStatus } from "@/lib/api/bookings";

// Fetch bookings
const bookings = await getBookingsByProvider(providerId);

// Update status
await updateBookingStatus(bookingId, "CONFIRMED");
```

### 4. TanStack Query Setup

#### QueryClient Configuration (`src/app/layout.tsx`)

The QueryClient is configured with optimal defaults:

```typescript
{
  queries: {
    staleTime: 60 * 1000,        // 1 minute - data stays fresh
    gcTime: 5 * 60 * 1000,       // 5 minutes - cache retention
    retry: 1,                     // Retry failed queries once
    refetchOnWindowFocus: false,  // Only in production
  },
  mutations: {
    retry: 0,                     // Don't retry mutations
  },
}
```

#### React Query DevTools

Available in **development mode only**. Press `Cmd+Shift+D` (Mac) or `Ctrl+Shift+D` (Windows) to toggle.

### 5. Custom Hooks (`src/hooks/`)

React Query hooks for data fetching:

```typescript
// src/hooks/use-bookings.ts
export function useBookings(providerId: string) {
  return useQuery({
    queryKey: ["bookings", providerId],
    queryFn: () => getBookingsByProvider(providerId),
  });
}

export function useUpdateBookingStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => updateBookingStatus(id, status),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["booking", variables.id] });
    },
  });
}
```

**Usage in Components**:

```typescript
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";

function MyComponent() {
  const { data: bookings, isLoading, error } = useBookings(providerId);
  const updateStatus = useUpdateBookingStatus();

  const handleConfirm = async (bookingId: string) => {
    await updateStatus.mutateAsync({
      id: bookingId,
      status: "CONFIRMED",
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* render bookings */}</div>;
}
```

## Best Practices

### 1. Use Custom Hooks for Data Fetching

✅ **Good**:

```typescript
const { data, isLoading } = useBookings(providerId);
```

❌ **Avoid**:

```typescript
const [data, setData] = useState([]);
useEffect(() => {
  fetch("/api/bookings")
    .then((r) => r.json())
    .then(setData);
}, []);
```

### 2. Invalidate Queries After Mutations

Always invalidate related queries after mutations to keep data fresh:

```typescript
const qc = useQueryClient();
return useMutation({
  mutationFn: createBooking,
  onSuccess: () => {
    qc.invalidateQueries({ queryKey: ["bookings"] });
  },
});
```

### 3. Use the Centralized API Client

✅ **Good**:

```typescript
import apiClient from "@/lib/api/client";
const res = await apiClient.get("/bookings");
```

❌ **Avoid**:

```typescript
const token = localStorage.getItem("token");
const res = await axios.get(url, {
  headers: { Authorization: `Bearer ${token}` },
});
```

### 4. Organize API Functions by Domain

Keep API functions in their respective files under `src/lib/api/`:

- `auth.ts` for authentication
- `bookings.ts` for bookings
- `profile.ts` for user profile
- etc.

### 5. Handle Loading and Error States

Always handle loading and error states in your components:

```typescript
const { data, isLoading, error, isError } = useBookings(id);

if (isLoading) return <Skeleton />;
if (isError) return <ErrorMessage error={error} />;
if (!data) return <EmptyState />;

return <DataDisplay data={data} />;
```

## Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_BACKEND_URL=https://glamlink-api.africacodefoundry.com
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

## TanStack Query vs Next.js Caching

### When to Use TanStack Query

- ✅ Client-side data fetching
- ✅ Real-time data that changes frequently
- ✅ User-specific data (authenticated requests)
- ✅ Complex state management with mutations
- ✅ Need fine-grained cache control

### When to Use Next.js Caching (Server Components)

- ✅ Static data that rarely changes
- ✅ SEO-critical data
- ✅ Public data (no authentication needed)
- ✅ Build-time or ISR (Incremental Static Regeneration)

**Our Choice**: We use **TanStack Query** because:

1. Most of our data is user-specific and requires authentication
2. Bookings, services, and profiles are dynamic and change frequently
3. We need real-time updates and optimistic UI updates
4. Better developer experience with hooks and automatic cache management

## Troubleshooting

### 401 Unauthorized Errors

The axios interceptor automatically clears the token on 401 errors. Check:

1. Is the user logged in?
2. Is the token expired?
3. Is the token being sent correctly?

### Stale Data Issues

If data isn't updating after mutations:

1. Check that you're invalidating the correct query keys
2. Verify the mutation's `onSuccess` callback is being called
3. Use React Query DevTools to inspect cache state

### Network Errors

Check:

1. Backend URL is correct in `.env.local`
2. Backend is running and accessible
3. CORS is properly configured on the backend

## Additional Resources

- [TanStack Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [Axios Docs](https://axios-http.com/docs/intro)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // 👈 1. Import TanStack Query
import { ThemeProvider } from "./hooks/useTheme.tsx";
import { AuthProvider } from "./hooks/useAuth.tsx"; // 👈 Add AuthProvider

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Retry failed requests once before showing error
      refetchOnWindowFocus: false, // Don't aggressively refetch every time user clicks the window
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>,
);

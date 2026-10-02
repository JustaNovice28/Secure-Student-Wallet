import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "../services/business/authService";
import { SessionState } from "../types";

/**
 * STATE MANAGEMENT — Context API
 *
 * Holds session state (isAuthenticated / isLoading) at the top of
 * the component tree so any screen can read "am I logged in?"
 * without prop-drilling. Screens/components never touch
 * authService or SecureStore directly for session state — they
 * consume this context.
 */

interface AuthContextValue extends SessionState {
  login: (pin: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({
    isAuthenticated: false,
    isLoading: true,
  });

  const refreshSession = async () => {
    const active = await authService.isSessionActive();
    setState({ isAuthenticated: active, isLoading: false });
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (pin: string) => {
    const result = await authService.login(pin);
    if (result.success) {
      setState({ isAuthenticated: true, isLoading: false });
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setState({ isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

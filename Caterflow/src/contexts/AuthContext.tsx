import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  loading: boolean;
  companyId: number | null;
  companyName: string | null;
};

const initialState: AuthState = {
  user: null,
  loading: true,
  companyId: null,
  companyName: null,
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  companyId: number | null;
  companyName: string | null;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  companyId: null,
  companyName: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(initialState);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted.current) {
          if (error) {
            console.error('Auth error:', error);
            setState({ ...initialState, loading: false });
          } else if (session?.user) {
            setState(prev => ({ ...prev, user: session.user, loading: false }));
          } else {
            setState({ ...initialState, loading: false });
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted.current) {
          setState({ ...initialState, loading: false });
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted.current) {
          if (session?.user) {
            setState(prev => ({ ...prev, user: session.user, loading: false }));
          } else {
            setState({ ...initialState, loading: false });
          }
        }
      }
    );

    return () => {
      mounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={state}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

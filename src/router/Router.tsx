import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppRoute = '/home' | '/products' | '/contact' | '/admin';

interface RouterContextType {
  route: AppRoute;
  navigate: (to: AppRoute) => void;
}

const RouterContext = createContext<RouterContextType | null>(null);

function normalizePath(path: string): AppRoute {
  if (path === '/products') return '/products';
  if (path === '/contact') return '/contact';
  if (path === '/admin') return '/admin';
  return '/home';
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<AppRoute>(() => {
    return normalizePath(window.location.pathname);
  });

  useEffect(() => {
    // If user is at root '/', set URL to '/home' without reload, preserving query parameters
    if (window.location.pathname === '/' || window.location.pathname === '') {
      const search = window.location.search || '';
      window.history.replaceState({}, '', `/home${search}`);
      setRoute('/home');
    }

    const handlePopState = () => {
      setRoute(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: AppRoute) => {
    if (to !== route) {
      window.history.pushState({}, '', to);
      setRoute(to);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <RouterContext.Provider value={{ route, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

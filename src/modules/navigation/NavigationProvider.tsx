import React, { createContext, useContext, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface NavigationState {
  currentRoute: string;
  previousRoute: string | null;
  navigationHistory: string[];
  canGoBack: boolean;
}

interface NavigationContextType extends NavigationState {
  navigateTo: (path: string, options?: { replace?: boolean; state?: any }) => void;
  navigateBack: () => void;
  resetNavigation: () => void;
  setQuickActions: (actions: QuickAction[]) => void;
  quickActions: QuickAction[];
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  action: () => void;
  badge?: string | number;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [navigationState, setNavigationState] = useState<NavigationState>({
    currentRoute: location.pathname,
    previousRoute: null,
    navigationHistory: [location.pathname],
    canGoBack: false
  });

  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);

  const navigateTo = useCallback((
    path: string,
    options: { replace?: boolean; state?: any } = {}
  ) => {
    setNavigationState(prev => ({
      currentRoute: path,
      previousRoute: prev.currentRoute,
      navigationHistory: options.replace
        ? [...prev.navigationHistory.slice(0, -1), path]
        : [...prev.navigationHistory, path],
      canGoBack: !options.replace && prev.navigationHistory.length > 0
    }));

    navigate(path, options);
  }, [navigate]);

  const navigateBack = useCallback(() => {
    if (navigationState.canGoBack && navigationState.previousRoute) {
      navigate(-1);
      setNavigationState(prev => ({
        ...prev,
        currentRoute: prev.previousRoute!,
        previousRoute: prev.navigationHistory[prev.navigationHistory.length - 3] || null,
        navigationHistory: prev.navigationHistory.slice(0, -1),
        canGoBack: prev.navigationHistory.length > 2
      }));
    }
  }, [navigate, navigationState]);

  const resetNavigation = useCallback(() => {
    setNavigationState({
      currentRoute: '/',
      previousRoute: null,
      navigationHistory: ['/'],
      canGoBack: false
    });
    navigate('/', { replace: true });
  }, [navigate]);

  // Update current route when location changes
  React.useEffect(() => {
    if (location.pathname !== navigationState.currentRoute) {
      setNavigationState(prev => ({
        currentRoute: location.pathname,
        previousRoute: prev.currentRoute,
        navigationHistory: [...prev.navigationHistory, location.pathname],
        canGoBack: true
      }));
    }
  }, [location.pathname, navigationState.currentRoute]);

  const contextValue: NavigationContextType = {
    ...navigationState,
    navigateTo,
    navigateBack,
    resetNavigation,
    setQuickActions,
    quickActions
  };

  return (
    <NavigationContext.Provider value={contextValue}>
      {children}
    </NavigationContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';

const ThemeContext = createContext({
  mode: 'dark',
  toggleMode: () => {},
  portal: 'customer',
  setPortal: () => {},
  language: 'en',
  setLanguage: () => {},
  t: (key) => key
});

const translations = {
  en: {
    welcomeBack: "Welcome Back",
    trackRealTime: "Track your orders in real time",
    emailPhone: "Email / Phone Number",
    password: "Password",
    rememberMe: "Remember Me",
    forgotPassword: "Forgot Password?",
    signIn: "Sign In",
    continueGoogle: "Continue with Google",
    createAccount: "Create New Account",
    driverPortal: "TrackFlow Driver Portal",
    vehicleId: "Vehicle ID",
    rememberDevice: "Remember Device",
    superAdminPortal: "Super Admin Portal",
    twoFactor: "2FA Code",
    secureLogin: "Secure Login",
    ordersDelivered: "Orders Delivered",
    happyCustomers: "Happy Customers",
    fastDelivery: "Fast Delivery",
    todaysDeliveries: "Today's Deliveries",
    completedOrders: "Completed Orders",
    currentLocation: "Current Location",
    rating: "Rating",
    gpsSignal: "GPS Signal",
    weather: "Weather",
    shift: "Current Shift",
    companyNews: "Company News",
    emergencyContact: "Emergency Contact",
    captcha: "Verify Captcha",
    rateLimit: "Rate limiting is active for security.",
    sslBadge: "SSL Protected",
    jwtBadge: "JWT Authentication",
    encBadge: "256-bit Encryption",
    rbacBadge: "Role Based Access"
  },
  es: {
    welcomeBack: "Bienvenido de Nuevo",
    trackRealTime: "Sigue tus pedidos en tiempo real",
    emailPhone: "Correo / Teléfono",
    password: "Contraseña",
    rememberMe: "Recordarme",
    forgotPassword: "¿Olvidó su contraseña?",
    signIn: "Iniciar Sesión",
    continueGoogle: "Continuar con Google",
    createAccount: "Crear Cuenta Nueva",
    driverPortal: "Portal de Conductores TrackFlow",
    vehicleId: "ID del Vehículo",
    rememberDevice: "Recordar Dispositivo",
    superAdminPortal: "Portal de Super Administrador",
    twoFactor: "Código 2FA",
    secureLogin: "Acceso Seguro",
    ordersDelivered: "Pedidos Entregados",
    happyCustomers: "Clientes Felices",
    fastDelivery: "Entrega Rápida",
    todaysDeliveries: "Entregas de Hoy",
    completedOrders: "Pedidos Completados",
    currentLocation: "Ubicación Actual",
    rating: "Calificación",
    gpsSignal: "Señal GPS",
    weather: "Clima",
    shift: "Turno Actual",
    companyNews: "Noticias de la Empresa",
    emergencyContact: "Contacto de Emergencia",
    captcha: "Verificar Captcha",
    rateLimit: "Límite de intentos activo por seguridad.",
    sslBadge: "Protegido con SSL",
    jwtBadge: "Autenticación JWT",
    encBadge: "Encriptación de 256 bits",
    rbacBadge: "Acceso Basado en Roles"
  },
  de: {
    welcomeBack: "Willkommen Zurück",
    trackRealTime: "Verfolgen Sie Bestellungen in Echtzeit",
    emailPhone: "E-Mail / Telefonnummer",
    password: "Passwort",
    rememberMe: "Angemeldet bleiben",
    forgotPassword: "Passwort vergessen?",
    signIn: "Anmelden",
    continueGoogle: "Weiter mit Google",
    createAccount: "Neues Konto erstellen",
    driverPortal: "TrackFlow Fahrerportal",
    vehicleId: "Fahrzeug-ID",
    rememberDevice: "Gerät merken",
    superAdminPortal: "Super-Admin-Portal",
    twoFactor: "2FA-Code",
    secureLogin: "Sicherer Login",
    ordersDelivered: "Gelieferte Aufträge",
    happyCustomers: "Zufriedene Kunden",
    fastDelivery: "Schnelle Lieferung",
    todaysDeliveries: "Heutige Lieferungen",
    completedOrders: "Abgeschlossene Aufträge",
    currentLocation: "Aktueller Standort",
    rating: "Bewertung",
    gpsSignal: "GPS-Signal",
    weather: "Wetter",
    shift: "Aktuelle Schicht",
    companyNews: "Firmennachrichten",
    emergencyContact: "Notfallkontakt",
    captcha: "Captcha bestätigen",
    rateLimit: "Sicherheits-Ratenbegrenzung ist aktiv.",
    sslBadge: "SSL-geschützt",
    jwtBadge: "JWT-Authentifizierung",
    encBadge: "256-Bit-Verschlüsselung",
    rbacBadge: "Rollenbasierter Zugriff"
  }
};

export const usePortalTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const [portal, setPortal] = useState(() => {
    // Infer initial portal type from current URL path
    const path = window.location.pathname;
    if (path.includes('/driver')) return 'driver';
    if (path.includes('/admin') || path.includes('/superadmin')) return 'admin';
    return 'customer';
  });

  // Keep portal synchronized with URL changes (e.g., clicking login links)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path.includes('/driver')) {
        setPortal('driver');
      } else if (path.includes('/admin') || path.includes('/superadmin')) {
        setPortal('admin');
      } else {
        setPortal('customer');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    // Periodically check path for route changes inside SPA router
    const interval = setInterval(handleLocationChange, 500);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      clearInterval(interval);
    };
  }, []);

  const toggleMode = () => {
    setMode((prevMode) => {
      const nextMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', nextMode);
      return nextMode;
    });
  };

  const activeTheme = useMemo(() => {
    // Define role-specific color configurations
    let primary = { main: '#2563EB', light: '#3b82f6', dark: '#1d4ed8', contrastText: '#ffffff' }; // Customer Blue
    let secondary = { main: '#7C3AED', light: '#818cf8', dark: '#6d28d9', contrastText: '#ffffff' }; // Customer Purple
    let background = mode === 'light' 
      ? { default: '#F8FAFC', paper: '#ffffff' } 
      : { default: '#0B0F19', paper: '#111827' };

    if (portal === 'driver') {
      primary = { main: '#F97316', light: '#fb923c', dark: '#ea580c', contrastText: '#ffffff' }; // Driver Orange
      secondary = { main: '#FBBF24', light: '#fcd34d', dark: '#d97706', contrastText: '#1f2937' }; // Yellow
      background = mode === 'light'
        ? { default: '#F9FAFB', paper: '#ffffff' }
        : { default: '#030712', paper: '#111827' };
    } else if (portal === 'admin') {
      primary = { main: '#0F172A', light: '#1e293b', dark: '#020617', contrastText: '#ffffff' }; // Admin Navy
      secondary = { main: '#06B6D4', light: '#22d3ee', dark: '#0891b2', contrastText: '#ffffff' }; // Cyan
      background = mode === 'light'
        ? { default: '#FFFFFF', paper: '#F8FAFC' }
        : { default: '#0A0E1A', paper: '#0F172A' };
    }

    return createTheme({
      palette: {
        mode,
        primary,
        secondary,
        background,
        text: mode === 'light' ? {
          primary: '#0F172A',
          secondary: '#475569',
          disabled: '#94a3b8'
        } : {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          disabled: '#4B5563'
        },
        success: { main: '#10B981' },
        warning: { main: '#F59E0B' },
        error: { main: '#EF4444' },
        divider: mode === 'light' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)'
      },
      typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
        h1: { fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.025em' },
        h2: { fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.02em' },
        h3: { fontSize: '1.75rem', fontWeight: 700 },
        h4: { fontSize: '1.5rem', fontWeight: 600 },
        h5: { fontSize: '1.25rem', fontWeight: 600 },
        h6: { fontSize: '1rem', fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.02em' }
      },
      shape: {
        borderRadius: 12
      },
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: {
              backgroundColor: background.default,
              color: mode === 'light' ? '#0F172A' : '#F9FAFB',
              transition: 'background-color 0.4s ease-in-out, color 0.4s ease-in-out'
            }
          }
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: mode === 'light' 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)' 
                : '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
            }
          }
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 12,
                transition: 'all 0.2s',
                '& fieldset': {
                  borderColor: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)'
                },
                '&:hover fieldset': {
                  borderColor: primary.main
                },
                '&.Mui-focused fieldset': {
                  borderColor: primary.main,
                  boxShadow: `0 0 0 4px ${primary.main}1a`
                }
              }
            }
          }
        }
      }
    });
  }, [mode, portal]);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, portal, setPortal, language, setLanguage: changeLanguage, t }}>
      <MuiThemeProvider theme={activeTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;

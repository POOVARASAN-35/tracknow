import { createTheme } from '@mui/material/styles';

export const getTheme = (mode = 'dark') => {
  return createTheme({
    palette: {
      mode,
      primary: mode === 'light' ? {
        main: '#2563EB', // Enterprise Blue
        light: '#3b82f6',
        dark: '#1d4ed8',
        contrastText: '#ffffff'
      } : {
        main: '#00e5ff', // Electric Teal
        light: '#6effff',
        dark: '#00b2cc',
        contrastText: '#0a0e1a'
      },
      secondary: {
        main: '#6366f1', // Indigo Glow
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff'
      },
      background: mode === 'light' ? {
        default: '#f8fafc',
        paper: '#ffffff'
      } : {
        default: '#070a13', // Deep cosmic blue
        paper: '#0f1424'    // Card glassmorphic panel base
      },
      text: mode === 'light' ? {
        primary: '#1e293b',
        secondary: '#64748b',
        disabled: '#94a3b8'
      } : {
        primary: '#f3f4f6',
        secondary: '#9ca3af',
        disabled: '#4b5563'
      },
      success: {
        main: '#10b981', // Emerald green
        contrastText: mode === 'light' ? '#ffffff' : '#000000'
      },
      warning: {
        main: '#f59e0b', // Amber yellow
        contrastText: mode === 'light' ? '#ffffff' : '#000000'
      },
      error: {
        main: '#ef4444' // Crimson red
      },
      divider: mode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 800,
        letterSpacing: '-0.025em'
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        letterSpacing: '-0.02em'
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 700
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.02em'
      }
    },
    shape: {
      borderRadius: 12
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: mode === 'light' ? '#f8fafc' : '#070a13',
            color: mode === 'light' ? '#0f172a' : '#f3f4f6',
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px'
            },
            '&::-webkit-scrollbar-track': {
              background: mode === 'light' ? '#f8fafc' : '#070a13'
            },
            '&::-webkit-scrollbar-thumb': {
              background: mode === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: mode === 'light' ? '#2563EB' : '#00e5ff'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'light' ? '#ffffff' : '#0f1424',
            backgroundImage: mode === 'light' ? 'none' : 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0))',
            backdropFilter: 'blur(20px)',
            border: mode === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)',
            borderRadius: 16,
            boxShadow: mode === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)' : '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: mode === 'light' ? '0 10px 15px -3px rgba(37, 99, 235, 0.1)' : '0 12px 40px 0 rgba(0, 229, 255, 0.08)',
              borderColor: mode === 'light' ? 'rgba(37, 99, 235, 0.2)' : 'rgba(0, 229, 255, 0.2)'
            }
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 20px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: mode === 'light' ? '0 4px 12px 0 rgba(37, 99, 235, 0.2)' : '0 4px 12px 0 rgba(0, 229, 255, 0.2)'
            }
          },
          containedPrimary: {
            background: mode === 'light' 
              ? 'linear-gradient(135deg, #2563EB 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #00e5ff 0%, #00b2cc 100%)',
            color: mode === 'light' ? '#ffffff' : '#070a13',
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563EB 100%)'
                : 'linear-gradient(135deg, #6effff 0%, #00e5ff 100%)'
            }
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)'
            }
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'all 0.2s',
              '& fieldset': {
                borderColor: mode === 'light' ? '#e2e8f0' : 'rgba(255, 255, 255, 0.1)'
              },
              '&:hover fieldset': {
                borderColor: mode === 'light' ? '#cbd5e1' : 'rgba(0, 229, 255, 0.3)'
              },
              '&.Mui-focused fieldset': {
                borderColor: mode === 'light' ? '#2563EB' : '#00e5ff',
                boxShadow: mode === 'light' ? '0 0 8px 0 rgba(37, 99, 235, 0.25)' : '0 0 8px 0 rgba(0, 229, 255, 0.25)'
              }
            }
          }
        }
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '4px 8px',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(37, 99, 235, 0.04)' : 'rgba(0, 229, 255, 0.05)',
              color: mode === 'light' ? '#2563EB' : '#00e5ff'
            },
            '&.Mui-selected': {
              backgroundColor: mode === 'light' ? 'rgba(37, 99, 235, 0.08)' : 'rgba(0, 229, 255, 0.1)',
              color: mode === 'light' ? '#2563EB' : '#00e5ff',
              borderLeft: mode === 'light' ? '4px solid #2563EB' : '4px solid #00e5ff',
              '&:hover': {
                backgroundColor: mode === 'light' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 229, 255, 0.15)'
              }
            }
          }
        }
      }
    }
  });
};

const defaultTheme = getTheme('dark');
export default defaultTheme;

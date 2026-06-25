// Global State Variables
let selectedRole = 'customer';
let googleClientId = '';
let tokenClient = null;

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  generateParticles();
  checkExistingSession();
  fetchAuthConfig();
});

// 1. Dynamic Particles Generator
function generateParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Randomize dimensions and positions
    const size = Math.floor(Math.random() * 20) + 6;
    const left = Math.floor(Math.random() * 100);
    const delay = Math.random() * 10;
    const duration = Math.floor(Math.random() * 10) + 8;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${left}%`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;

    container.appendChild(particle);
  }
}

// 2. Role Selector Handler
function selectRole(role) {
  selectedRole = role;
  
  // Update UI state toggles
  document.getElementById('roleCustomer').classList.toggle('active', role === 'customer');
  document.getElementById('roleDriver').classList.toggle('active', role === 'driver');
}

// 3. Fetch Configuration from Backend
async function fetchAuthConfig() {
  try {
    const response = await axios.get('/api/auth/config');
    if (response.data && response.data.googleClientId) {
      googleClientId = response.data.googleClientId;
      initGoogleGIS();
    }
  } catch (error) {
    console.warn('Could not load auth configuration. Defaulting to mock mode.', error.message);
  }
}

// 4. Initialize Google Identity Services
function initGoogleGIS() {
  const isGoogleLoaded = window.google && window.google.accounts && window.google.accounts.oauth2;
  const hasValidClientId = googleClientId && googleClientId !== 'your_google_client_id_placeholder' && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID';

  if (isGoogleLoaded && hasValidClientId) {
    try {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: googleClientId,
        scope: 'email profile openid',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            await authenticateWithBackend(tokenResponse.access_token);
          }
        },
        error_callback: (err) => {
          console.error('Google token client error:', err);
          showNotification('Google Sign-In initialization failed. Falling back to mock login.', 'warning');
        }
      });
    } catch (err) {
      console.error('Failed to initialize Google token client:', err);
    }
  }
}

// 5. Trigger Google OAuth Prompt
function handleGoogleLogin() {
  clearAlert();
  
  if (tokenClient) {
    // Open Google Popup
    setLoadingState(true);
    tokenClient.requestAccessToken();
  } else {
    // Trigger Mock Selector modal in development
    setLoadingState(false);
    const mockModal = new bootstrap.Modal(document.getElementById('mockGoogleModal'));
    
    // Set default inputs based on role selection
    document.getElementById('modalTitle').textContent = `Mock Google Account - ${selectedRole.toUpperCase()}`;
    document.getElementById('mockEmailInput').value = selectedRole === 'customer' ? 'google-customer@tracknow.com' : 'driver@tracknow.com';
    document.getElementById('mockNameInput').value = selectedRole === 'customer' ? 'Google Test Customer' : 'Courier Driver';
    
    mockModal.show();
  }
}

// 6. Handle Mock Popup Form Submission
async function handleMockSubmit(event) {
  event.preventDefault();
  
  // Hide modal
  const modalEl = document.getElementById('mockGoogleModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();

  const name = document.getElementById('mockNameInput').value;
  const email = document.getElementById('mockEmailInput').value;
  
  setLoadingState(true);
  const mockToken = `mock_token_google_${Date.now()}`;
  await authenticateWithBackend(mockToken, name, email);
}

// 7. Perform Authentication network call
async function authenticateWithBackend(token, name = '', email = '') {
  try {
    const payload = { token, role: selectedRole };
    
    // If it's a mock token, include custom fields
    if (token.startsWith('mock_token_')) {
      payload.name = name;
      payload.email = email;
    }

    const response = await axios.post('/api/auth/google', payload);
    
    if (response.data && response.data.success) {
      const data = response.data;
      
      // Save to localStorage
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      showNotification('Google Sign-In successful! Opening session...', 'success');
      
      setTimeout(() => {
        setLoadingState(false);
        renderProfile(data.user);
      }, 1000);
    }
  } catch (error) {
    setLoadingState(false);
    console.error('Backend authentication error:', error);
    const errMsg = error.response?.data?.message || 'Authentication failed. Please try again.';
    showNotification(errMsg, 'danger');
  }
}

// 8. Check Session state on reload
function checkExistingSession() {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      renderProfile(user);
    } catch (e) {
      localStorage.clear();
      showLoginPanel();
    }
  } else {
    showLoginPanel();
  }
}

// 9. Render Profile Panel
function renderProfile(user) {
  document.getElementById('loginPanel').classList.add('d-none');
  document.getElementById('profilePanel').classList.remove('d-none');
  
  // Populate elements
  document.getElementById('userName').textContent = user.name;
  document.getElementById('userEmail').textContent = user.email;
  document.getElementById('userRole').textContent = user.role.toUpperCase();
  
  // Format last access timestamp
  const dateStr = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : new Date().toLocaleString();
  document.getElementById('lastLoginTime').textContent = dateStr;

  // Set avatar photo
  const avatarImg = document.getElementById('userAvatar');
  if (user.profileImage) {
    avatarImg.src = user.profileImage;
  } else {
    // Generate simple SVG character avatar if no image present
    avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff&size=120`;
  }

  // Display Verified Badge dynamically if verified
  document.getElementById('googleBadge').style.display = user.isVerified ? 'flex' : 'none';
}

// 10. Show Login Panel
function showLoginPanel() {
  document.getElementById('profilePanel').classList.add('d-none');
  document.getElementById('loginPanel').classList.remove('d-none');
}

// 11. Switch Account handler
function switchAccount() {
  // Clear only current access tokens but preserve settings, redirecting back to chooser
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
  clearAlert();
  showLoginPanel();
}

// 12. Handle Logout Session
async function handleLogout() {
  setLoadingState(true);
  const token = localStorage.getItem('accessToken');

  try {
    if (token) {
      await axios.post('/api/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.warn('Backend session logout failed:', error.message);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    showNotification('Session terminated. Signing out...', 'info');
    setTimeout(() => {
      setLoadingState(false);
      showLoginPanel();
    }, 1000);
  }
}

// 13. Redirect to Dashboard App
function redirectToDashboard() {
  // Dashboard routes resolve to http://localhost:3000/dashboard (frontend React portal)
  window.location.href = 'http://localhost:3000/dashboard';
}

// Helper: Alert/Notification systems
function showNotification(message, type) {
  const alert = document.getElementById('authAlert');
  if (!alert) return;

  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alert.classList.remove('d-none');
}

function clearAlert() {
  const alert = document.getElementById('authAlert');
  if (alert) alert.classList.add('d-none');
}

// Helper: Button Loading spinner toggler
function setLoadingState(loading) {
  const spinner = document.getElementById('btnSpinner');
  const content = document.getElementById('btnContent');
  const btn = document.getElementById('googleAuthBtn');

  if (loading) {
    spinner.classList.remove('d-none');
    content.classList.add('d-none');
    btn.setAttribute('disabled', 'true');
  } else {
    spinner.classList.add('d-none');
    content.classList.remove('d-none');
    btn.removeAttribute('disabled');
  }
}

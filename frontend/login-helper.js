// Add this to frontend/script.js for login
async function loginUser(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

// Example: Show login form and handle login
function showLoginForm() {
  const form = document.createElement('form');
  form.innerHTML = `
    <input type="email" name="email" placeholder="Email" required><br>
    <input type="password" name="password" placeholder="Password" required><br>
    <button type="submit">Login</button>
  `;
  form.onsubmit = async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    const result = await loginUser(email, password);
    if (result.success) {
      alert('Login successful!');
      location.reload();
    } else {
      alert('Invalid credentials');
    }
  };
  document.body.innerHTML = '';
  document.body.appendChild(form);
}

// Call showLoginForm() when Google button is clicked
// document.getElementById('google-login-btn').onclick = showLoginForm;

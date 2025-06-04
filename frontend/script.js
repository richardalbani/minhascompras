const backendUrl = ''; // Vazio, pois frontend é servido pelo mesmo domínio

// Login
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  const res = await fetch(`${backendUrl}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  const msg = document.getElementById('message');

  if (res.ok) {
    localStorage.setItem('loggedIn', 'true');
    window.location = 'dashboard.html';
  } else {
    msg.textContent = data.msg || 'Erro no login';
  }
});

// Cadastro
document.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  const res = await fetch(`${backendUrl}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  const msg = document.getElementById('regMessage');

  if (res.ok) {
    msg.style.color = 'lightgreen';
    msg.textContent = data.msg || 'Cadastro feito com sucesso!';
    setTimeout(() => {
      window.location = 'index.html';
    }, 1500);
  } else {
    msg.style.color = 'red';
    msg.textContent = data.msg || 'Erro no cadastro';
  }
});

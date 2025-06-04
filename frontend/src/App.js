import React, { useState, useEffect } from 'react';

function App() {
  const [step, setStep] = useState('login');
  const [token, setToken] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: 1, value: 0 });

  useEffect(() => {
    if(step === 'list') fetchItems();
  }, [step]);

  function fetchItems() {
    fetch('http://localhost:5000/items', {
      headers: { Authorization: token }
    })
      .then(res => res.json())
      .then(data => setItems(data));
  }

  function login(e) {
    e.preventDefault();
    const user = e.target.username.value;
    const pwd = e.target.password.value;
    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pwd })
    })
    .then(res => res.json())
    .then(data => {
      setToken(data.token);
      setIsAdmin(data.isAdmin);
      setStep('list');
    });
  }

  function addItem(e) {
    e.preventDefault();
    fetch('http://localhost:5000/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: token },
      body: JSON.stringify(form)
    }).then(() => fetchItems());
  }

  function deleteItem(id) {
    fetch(`http://localhost:5000/items/${id}`, {
      method: 'DELETE',
      headers: { Authorization: token }
    }).then(() => fetchItems());
  }

  if(step === 'login') {
    return <form onSubmit={login} style={{ padding: '2rem' }}>
      <h2>Login</h2>
      <input name="username" placeholder="Usuário" required />
      <input type="password" name="password" placeholder="Senha" required />
      <button type="submit">Entrar</button>
    </form>;
  }

  const total = items.reduce((sum, i) => sum + i.quantity * i.value, 0);

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Lista de Compras {isAdmin && '(Admin)'}</h2>
      <p>Total: R$ {total.toFixed(2)}</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Nome</th><th>Qtde</th><th>Valor</th><th>Soma</th><th>Ações</th></tr></thead>
        <tbody>
          {items.map(i => (
            <tr key={i.id}>
              <td>{i.name}</td><td>{i.quantity}</td><td>R$ {i.value.toFixed(2)}</td>
              <td>R$ {(i.quantity*i.value).toFixed(2)}</td>
              <td><button onClick={() => deleteItem(i.id)}>Excluir</button></td>
            </tr>
          ))}
          <tr>
            <td><input placeholder="Nome" onChange={e => setForm({...form, name: e.target.value})} /></td>
            <td><input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: +e.target.value})} /></td>
            <td><input type="number" step="0.01" value={form.value} onChange={e => setForm({...form, value: +e.target.value})} /></td>
            <td></td>
            <td><button onClick={addItem}>Adicionar</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default App;
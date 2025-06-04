let username = '';
let compras = [];

function login() {
  username = document.getElementById('username').value;
  fetch('/api/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ username })
  }).then(res => res.json()).then(() => {
    document.getElementById('login').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    carregar();
  });
}

function carregar() {
  fetch(`/api/compras/${username}`)
    .then(res => res.json())
    .then(data => {
      compras = data;
      render();
    });
}

function render() {
  const tbody = document.getElementById('lista');
  tbody.innerHTML = '';
  let total = 0;

  compras.forEach((item, i) => {
    const row = document.createElement('tr');
    const subtotal = (item.qtd * item.valor).toFixed(2);
    total += parseFloat(subtotal);

    row.innerHTML = `
      <td><input value="${item.nome}" onchange="compras[${i}].nome=this.value"/></td>
      <td><input type="number" value="${item.qtd}" onchange="compras[${i}].qtd=this.value"/></td>
      <td><input type="number" value="${item.valor}" onchange="compras[${i}].valor=this.value"/></td>
      <td>R$ ${subtotal}</td>
      <td><button onclick="remover(${i})">🗑️</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('totalGeral').innerText = total.toFixed(2);
}

function addLinha() {
  compras.push({ nome: '', qtd: 1, valor: 0 });
  render();
}

function remover(i) {
  compras.splice(i, 1);
  render();
}

function salvar() {
  fetch(`/api/compras/${username}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ compras })
  }).then(() => alert('Salvo!'));
}

let currentUser = null;
const users = {
  user: "user123",
  adm: "adm123"
};

const lists = {
  user: [],
  adm: []
};

function login() {
  const user = document.getElementById("user").value;
  const pass = document.getElementById("pass").value;
  if (users[user] && users[user] === pass) {
    currentUser = user;
    document.querySelector(".login-container").style.display = "none";
    document.getElementById("app").style.display = "block";
    document.getElementById("loggedUser").innerText = user;

    if (user === "adm") {
      document.getElementById("userSelect").style.display = "inline";
      document.getElementById("userSelect").innerHTML = Object.keys(users)
        .map(u => `<option value="${u}">${u}</option>`)
        .join("");
    }

    loadList();
  } else {
    alert("Usuário ou senha incorretos");
  }
}

function loadList() {
  const user = currentUser === "adm"
    ? document.getElementById("userSelect").value
    : currentUser;
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";
  let total = 0;

  (lists[user] || []).forEach((item, i) => {
    const row = document.createElement("tr");
    const itemTotal = item.qtd * item.valor;
    total += itemTotal;
    row.innerHTML = `
      <td>${item.nome}</td>
      <td>${item.qtd}</td>
      <td>R$ ${item.valor.toFixed(2)}</td>
      <td>R$ ${itemTotal.toFixed(2)}</td>
      <td><button onclick="removeItem(${i})">Excluir</button></td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("totalGeral").innerText = total.toFixed(2);
}

function addItem() {
  const nome = document.getElementById("item").value;
  const qtd = parseInt(document.getElementById("qtd").value);
  const valor = parseFloat(document.getElementById("valor").value);
  if (!nome || isNaN(qtd) || isNaN(valor)) return;

  const user = currentUser === "adm"
    ? document.getElementById("userSelect").value
    : currentUser;

  lists[user].push({ nome, qtd, valor });
  loadList();
}

function removeItem(index) {
  const user = currentUser === "adm"
    ? document.getElementById("userSelect").value
    : currentUser;

  lists[user].splice(index, 1);
  loadList();
}

function saveList() {
  alert("Lista salva com sucesso!");
}

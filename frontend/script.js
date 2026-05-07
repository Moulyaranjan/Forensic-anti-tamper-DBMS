const API = "http://localhost:5000";

/* LOGIN */
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.success) {
    document.getElementById("loginPage").style.display = "none";
    document.getElementById("heroPage").style.display = "block";
  } else {
    document.getElementById("msg").innerHTML = "❌ Invalid login";
  }
}

/* OPEN FEATURE PAGE */
function openPage(page) {
  window.location.href = page;
}

/* ENTER SYSTEM */
function enterSystem() {
  document.getElementById("heroPage").style.display = "none";
  document.getElementById("dashboard").style.display = "block";
}

/* LOGOUT */
function logout() {
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("heroPage").style.display = "none";
  document.getElementById("loginPage").style.display = "flex";
}

/* VIEW */
async function viewEvidence() {
  const user = document.getElementById("user").value;
  const case_id = document.getElementById("case_id").value;
  const warrant_id = document.getElementById("warrant_id").value;

  const res = await fetch(`${API}/view`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ user, case_id, warrant_id })
  });

  const data = await res.json();
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";

  if (!Array.isArray(data)) {
    document.getElementById("status").innerHTML = "🚨 ACCESS DENIED";
    return;
  }

  data.forEach(r => {
    resultDiv.innerHTML += `
      <div class="record">
        <p>ID: ${r.record_id}</p>
        <p>Data: ${r.data}</p>
        <p class="hash">Prev: ${r.previous_hash}</p>
        <p class="hash">Hash: ${r.current_hash}</p>
      </div>
    `;
  });
}

/* ADD */
async function addEvidence() {
  const case_id = document.getElementById("case_add").value;
  const data = document.getElementById("data_add").value;
  const warrant_id = document.getElementById("warrant_add").value;

  await fetch(`${API}/add`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ case_id, data, warrant_id })
  });

  document.getElementById("status").innerHTML = "✅ Evidence Added";
}
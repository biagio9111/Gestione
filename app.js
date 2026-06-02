import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase,
  ref,
  onValue,
  set,
  remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBlwH6PrN4fVRant9e52KSN8elfWLZ_yFM",
  authDomain: "gestione-90c47.firebaseapp.com",
  databaseURL: "https://gestione-90c47-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gestione-90c47",
  storageBucket: "gestione-90c47.firebasestorage.app",
  messagingSenderId: "671030782476",
  appId: "1:671030782476:web:4ce37b8a34e35ecdc49c29"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

let operai = {};
let furgoni = {};
let presenzeOggi = {};

window.showScreen = function(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
};

function oggiISO() {
  return new Date().toISOString().slice(0, 10);
}

function euro(valore) {
  return Number(valore || 0).toFixed(2);
}

function calcolaOre(inizio, fine) {
  if (!inizio || !fine) return 0;

  const [h1, m1] = inizio.split(":").map(Number);
  const [h2, m2] = fine.split(":").map(Number);

  const minutiIn = h1 * 60 + m1;
  const minutiOut = h2 * 60 + m2;

  return (minutiOut - minutiIn) / 60;
}

document.getElementById("dataOggi").innerText = "📅 Oggi: " + oggiISO();

/* LOGIN */

document.getElementById("btnLogin").onclick = async function() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errore = document.getElementById("loginErrore");

  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("email", email);
    errore.innerText = "";
    showScreen("screenHome");
  } catch (e) {
    errore.innerText = "Email o password errata";
  }
};

document.getElementById("btnLogout").onclick = async function() {
  await signOut(auth);
  showScreen("screenLogin");
};

onAuthStateChanged(auth, function(user) {
  if (user) {
    showScreen("screenHome");
    caricaRealtime();
  } else {
    showScreen("screenLogin");
  }
});

/* REALTIME FIREBASE */

function caricaRealtime() {
  onValue(ref(db, "operai"), function(snapshot) {
    operai = snapshot.val() || {};
    renderOperai();
    riempiSelectOperai();
  });

  onValue(ref(db, "furgoni"), function(snapshot) {
    furgoni = snapshot.val() || {};
    renderFurgoni();
    riempiSelectFurgoni();
  });

  onValue(ref(db, "presenze/" + oggiISO()), function(snapshot) {
    presenzeOggi = snapshot.val() || {};
    renderPresenzeOggi();
  });
}

/* OPERAI */

document.getElementById("btnSalvaOperaio").onclick = function() {
  const id = "op_" + Date.now();

  const dati = {
    nome: document.getElementById("opNome").value,
    ruolo: document.getElementById("opRuolo").value,
    telefono: document.getElementById("opTelefono").value,
    pagaOra: Number(document.getElementById("opPaga").value || 0),
    trasferta: Number(document.getElementById("opTrasferta").value || 0),
    attivo: true
  };

  set(ref(db, "operai/" + id), dati);

  document.getElementById("opNome").value = "";
  document.getElementById("opRuolo").value = "";
  document.getElementById("opTelefono").value = "";
  document.getElementById("opPaga").value = "";
  document.getElementById("opTrasferta").value = "";
};

function renderOperai() {
  const box = document.getElementById("listaOperai");
  const cerca = document.getElementById("cercaOperaio").value.toLowerCase();

  box.innerHTML = "";

  Object.entries(operai).forEach(function([id, op]) {
    const nome = (op.nome || "").toLowerCase();

    if (cerca && !nome.includes(cerca)) return;

    box.innerHTML += `
      <div class="card">
        <h3>👷 ${op.nome || ""}</h3>
        <small>
          Ruolo: ${op.ruolo || ""}<br>
          Telefono: ${op.telefono || ""}<br>
          Paga: €${euro(op.pagaOra)}/h<br>
          Trasferta: €${euro(op.trasferta)}
        </small><br>
        <button class="btn-edit" onclick="modificaOperaio('${id}')">Modifica</button>
        <button class="btn-delete" onclick="eliminaOperaio('${id}')">Elimina</button>
      </div>
    `;
  });
}

document.getElementById("cercaOperaio").oninput = renderOperai;

window.eliminaOperaio = function(id) {
  if (confirm("Vuoi eliminare questo operaio?")) {
    remove(ref(db, "operai/" + id));
  }
};

window.modificaOperaio = function(id) {
  const op = operai[id];

  document.getElementById("opNome").value = op.nome || "";
  document.getElementById("opRuolo").value = op.ruolo || "";
  document.getElementById("opTelefono").value = op.telefono || "";
  document.getElementById("opPaga").value = op.pagaOra || "";
  document.getElementById("opTrasferta").value = op.trasferta || "";

  remove(ref(db, "operai/" + id));
};

/* FURGONI */

document.getElementById("btnSalvaFurgone").onclick = function() {
  const id = "fur_" + Date.now();

  const dati = {
    modello: document.getElementById("furModello").value,
    targa: document.getElementById("furTarga").value
  };

  set(ref(db, "furgoni/" + id), dati);

  document.getElementById("furModello").value = "";
  document.getElementById("furTarga").value = "";
};

function renderFurgoni() {
  const box = document.getElementById("listaFurgoni");
  box.innerHTML = "";

  Object.entries(furgoni).forEach(function([id, fur]) {
    box.innerHTML += `
      <div class="card">
        <h3>🚐 ${fur.modello || ""}</h3>
        <small>Targa: ${fur.targa || ""}</small><br>
        <button class="btn-delete" onclick="eliminaFurgone('${id}')">Elimina</button>
      </div>
    `;
  });
}

window.eliminaFurgone = function(id) {
  if (confirm("Vuoi eliminare questo furgone?")) {
    remove(ref(db, "furgoni/" + id));
  }
};

/* SELECT OPERAI E FURGONI */

function riempiSelectOperai() {
  const selectOperaio = document.getElementById("presOperaio");
  const selectAutista = document.getElementById("presAutista");

  selectOperaio.innerHTML = "";
  selectAutista.innerHTML = "";

  Object.entries(operai).forEach(function([id, op]) {
    selectOperaio.innerHTML += `<option value="${id}">${op.nome}</option>`;
    selectAutista.innerHTML += `<option value="${op.nome}">${op.nome}</option>`;
  });
}

function riempiSelectFurgoni() {
  const selectFurgone = document.getElementById("presFurgone");
  selectFurgone.innerHTML = "";

  Object.values(furgoni).forEach(function(fur) {
    selectFurgone.innerHTML += `
      <option value="${fur.modello} - ${fur.targa}">
        ${fur.modello} - ${fur.targa}
      </option>
    `;
  });
}

/* PRESENZE */

document.getElementById("btnSalvaPresenza").onclick = function() {
  const idOperaio = document.getElementById("presOperaio").value;
  const op = operai[idOperaio];

  if (!op) {
    alert("Seleziona un operaio");
    return;
  }

  const stato = document.getElementById("presStato").value;
  const checkIn = document.getElementById("presIn").value;
  const checkOut = document.getElementById("presOut").value;
  const trasfertaAttiva = document.getElementById("presTrasferta").checked;

  let ore = 0;
  let costoTotale = 0;

  if (stato === "Presente") {
    ore = calcolaOre(checkIn, checkOut);
    costoTotale = ore * Number(op.pagaOra || 0);

    if (trasfertaAttiva) {
      costoTotale += Number(op.trasferta || 0);
    }
  }

  const dati = {
    idOperaio: idOperaio,
    nome: op.nome || "",
    stato: stato,
    cantiere: document.getElementById("presCantiere").value,
    furgone: document.getElementById("presFurgone").value,
    autista: document.getElementById("presAutista").value,
    checkIn: checkIn,
    checkOut: checkOut,
    ore: ore,
    pagaOra: Number(op.pagaOra || 0),
    trasfertaAttiva: trasfertaAttiva,
    valoreTrasferta: Number(op.trasferta || 0),
    costoTotale: costoTotale,
    dal: document.getElementById("presDal").value,
    al: document.getElementById("presAl").value,
    motivo: document.getElementById("presMotivo").value
  };

  set(ref(db, "presenze/" + oggiISO() + "/" + idOperaio), dati);

  alert("Presenza salvata");
};

function renderPresenzeOggi() {
  const box = document.getElementById("listaPresenzeOggi");
  box.innerHTML = "";

  Object.values(presenzeOggi).forEach(function(p) {
    box.innerHTML += `
      <div class="card">
        <h3>${p.stato === "Presente" ? "🟢" : "🔴"} ${p.nome}</h3>
        <small>
          Stato: ${p.stato}<br>
          Check-in: ${p.checkIn || "-"}<br>
          Check-out: ${p.checkOut || "-"}<br>
          Ore: ${p.ore || 0}<br>
          Cantiere: ${p.cantiere || "-"}<br>
          Furgone: ${p.furgone || "-"}<br>
          Autista: ${p.autista || "-"}<br>
          Trasferta: ${p.trasfertaAttiva ? "Sì" : "No"}<br>
          
        </small>
      </div>
    `;
  });
}

/* STORICO */

document.getElementById("btnCaricaStorico").onclick = function() {
  const data = document.getElementById("storicoData").value;

  if (!data) {
    alert("Seleziona una data");
    return;
  }

  onValue(ref(db, "presenze/" + data), function(snapshot) {
    const storico = snapshot.val() || {};
    const box = document.getElementById("listaStorico");

    box.innerHTML = "";

    Object.values(storico).forEach(function(p) {
      box.innerHTML += `
        <div class="card">
          <h3>${p.stato === "Presente" ? "🟢" : "🔴"} ${p.nome}</h3>
          <small>
            Stato: ${p.stato}<br>
            Ore: ${p.ore || 0}<br>
            Cantiere: ${p.cantiere || "-"}<br>
            Furgone: ${p.furgone || "-"}<br>
          
            Motivo: ${p.motivo || "-"}
          </small>
        </div>
      `;
    });

    if (Object.keys(storico).length === 0) {
      box.innerHTML = "<p>Nessun dato trovato per questa data.</p>";
    }
  }, {
    onlyOnce: true
  });
};

/* COSTI */

document.getElementById("btnCalcolaCosti").onclick = function() {
  const dal = document.getElementById("costiDal").value;
  const al = document.getElementById("costiAl").value;

  if (!dal || !al) {
    alert("Seleziona data inizio e data fine");
    return;
  }

  onValue(ref(db, "presenze"), function(snapshot) {
    const dati = snapshot.val() || {};
    const riepilogo = {};
    let totale = 0;

    Object.entries(dati).forEach(function([data, giornata]) {
      if (data >= dal && data <= al) {
        Object.values(giornata).forEach(function(p) {
          const nome = p.nome || "Senza nome";
          const costo = Number(p.costoTotale || 0);

          if (!riepilogo[nome]) {
            riepilogo[nome] = 0;
          }

          riepilogo[nome] += costo;
          totale += costo;
        });
      }
    });

    const box = document.getElementById("listaCosti");
    box.innerHTML = "";

    Object.entries(riepilogo).forEach(function([nome, costo]) {
      box.innerHTML += `
        <div class="card">
          <h3>${nome}</h3>
          <small>Totale: €${euro(costo)}</small>
        </div>
      `;
    });

    document.getElementById("totaleCosti").innerText =
      "💰 TOTALE: €" + euro(totale);

    if (Object.keys(riepilogo).length === 0) {
      box.innerHTML = "<p>Nessun costo trovato.</p>";
    }
  }, {
    onlyOnce: true
  });
};

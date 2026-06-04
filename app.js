import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
getAuth,
signInWithEmailAndPassword,
signOut,
onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
getDatabase,
ref,
onValue,
set,
remove
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* =========================
FIREBASE
========================= */

const firebaseConfig = {

apiKey:
"AIzaSyBlwH6PrN4fVRant9e52KSN8elfWLZ_yFM",

authDomain:
"gestione-90c47.firebaseapp.com",

databaseURL:
"https://gestione-90c47-default-rtdb.europe-west1.firebasedatabase.app",

projectId:
"gestione-90c47",

storageBucket:
"gestione-90c47.firebasestorage.app",

messagingSenderId:
"671030782476",

appId:
"1:671030782476:web:4ce37b8a34e35ecdc49c29"

};

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const db =
getDatabase(app);

/* =========================
VARIABILI
========================= */

let operai = {};

let furgoni = {};

let cantieri = {};

let presenzeOggi = {};

let storico = {};

/* =========================
CAMBIO SCHERMATA
========================= */

window.showScreen =
function(id){

document
.querySelectorAll(".screen")
.forEach(function(screen){

screen.classList.remove(
"active"
);

});

document
.getElementById(id)
.classList.add("active");

};

/* =========================
DATA OGGI
========================= */

function oggiISO(){

return new Date()
.toISOString()
.slice(0,10);

}

document
.getElementById("dataOggi")
.innerText =
"📅 Oggi: " + oggiISO();

const campoData =
document.getElementById("presData");

if(campoData){

campoData.value =
oggiISO();

}

/* =========================
LOGIN
========================= */

document
.getElementById("btnLogin")
.onclick =
async function(){

const email =
document.getElementById(
"email"
).value;

const password =
document.getElementById(
"password"
).value;

try{

await signInWithEmailAndPassword(
auth,
email,
password
);

}catch(e){

document
.getElementById(
"loginErrore"
)
.innerText =
"Email o Password errata";

}

};

/* =========================
LOGOUT
========================= */

document
.getElementById("btnLogout")
.onclick =
async function(){

await signOut(auth);

};

/* =========================
CONTROLLO LOGIN
========================= */

onAuthStateChanged(
auth,
function(user){

if(user){

showScreen(  
  "screenHome"  
  );  

  caricaRealtime();

}else{

showScreen(  
  "screenLogin"  
  );

}

}
);

/* =========================
CARICA REALTIME
========================= */

function caricaRealtime(){

onValue(
ref(db,"operai"),
function(snapshot){

operai =
snapshot.val() || {};

renderOperai();

riempiSelectOperai();

});

onValue(
ref(db,"furgoni"),
function(snapshot){

furgoni =
snapshot.val() || {};

renderFurgoni();

riempiSelectFurgoni();

});

onValue(
ref(db,"cantieri"),
function(snapshot){

cantieri =
snapshot.val() || {};

renderCantieri();

riempiSelectCantieri();

});

onValue(
ref(
db,
"presenze/" +
oggiISO()
),

function(snapshot){

presenzeOggi =
snapshot.val() || {};

renderPresenzeOggi();

});

}
/* =========================
OPERAI
========================= */

document
.getElementById("btnSalvaOperaio")
.onclick = function(){

const id =
"op_" + Date.now();

const dati = {

nome:
document.getElementById("opNome").value,

ruolo:
document.getElementById("opRuolo").value,

telefono:
document.getElementById("opTelefono").value,

pagaGiorno:
Number(
document.getElementById("opPaga").value || 0
),

trasferta:
Number(
document.getElementById("opTrasferta").value || 0
)

};

set(
ref(db,"operai/" + id),
dati
);

};

function renderOperai(){

const box =
document.getElementById("listaOperai");

box.innerHTML = "";

Object.entries(operai)
.forEach(function([id,op]){

box.innerHTML += `

   <div class="card">     <h3>  
   👷 ${op.nome}  
   </h3>     <small>  Ruolo:
${op.ruolo}<br>

Telefono:
${op.telefono}<br>

Paga:
€${op.pagaGiorno}<br>

Trasferta:
€${op.trasferta}

   </small>     <br>  <button  
class="btn-delete"  
onclick="eliminaOperaio('${id}')">

Elimina

   </button>     </div>  `;

});

}

window.eliminaOperaio =
function(id){

if(confirm(
"Eliminare operaio?"
)){

remove(
ref(
db,
"operai/" + id
)
);

}

};

/* =========================
FURGONI
========================= */

document
.getElementById("btnSalvaFurgone")
.onclick = function(){

const id =
"fur_" + Date.now();

const dati = {

modello:
document.getElementById("furModello").value,

targa:
document.getElementById("furTarga").value

};

set(
ref(
db,
"furgoni/" + id
),
dati
);

};

function renderFurgoni(){

const box =
document.getElementById("listaFurgoni");

box.innerHTML = "";

Object.entries(furgoni)
.forEach(function([id,f]){

box.innerHTML += `

   <div class="card">     <h3>  
   🚐 ${f.modello}  
   </h3>     <small>  Targa:
${f.targa}

   </small>     <br>  <button  
class="btn-delete"  
onclick="eliminaFurgone('${id}')">

Elimina

   </button>     </div>  `;

});

}

window.eliminaFurgone =
function(id){

if(confirm(
"Eliminare furgone?"
)){

remove(
ref(
db,
"furgoni/" + id
)
);

}

};

/* =========================
CANTIERI
========================= */

document
.getElementById("btnSalvaCantiere")
.onclick = function(){

const id =
"cant_" + Date.now();

const dati = {

nome:
document.getElementById("cantNome").value,

cliente:
document.getElementById("cantCliente").value,

indirizzo:
document.getElementById("cantIndirizzo").value,

telefono:
document.getElementById("cantTelefono").value,

note:
document.getElementById("cantNote").value

};

set(
ref(
db,
"cantieri/" + id
),
dati
);

alert("Cantiere salvato");

};

function renderCantieri(){

const box =
document.getElementById("listaCantieri");

box.innerHTML = "";

Object.entries(cantieri)
.forEach(function([id,c]){

box.innerHTML += `

   <div class="card">     <h3>  
   🏗️ ${c.nome}  
   </h3>     <small>  Cliente:
${c.cliente}<br>

Indirizzo:
${c.indirizzo}<br>

Telefono:
${c.telefono}

   </small>     <br>  <button  
class="btn-delete"  
onclick="eliminaCantiere('${id}')">

Elimina

   </button>     </div>  `;

});

}

window.eliminaCantiere =
function(id){

if(confirm(
"Eliminare cantiere?"
)){

remove(
ref(
db,
"cantieri/" + id
)
);

}

};
/* =========================
SELECT OPERAI
========================= */

function riempiSelectOperai(){

const presOperaio =
document.getElementById("presOperaio");

const presAutista =
document.getElementById("presAutista");

const storicoOperaio =
document.getElementById("storicoOperaio");

if(presOperaio)
presOperaio.innerHTML = "";

if(presAutista)
presAutista.innerHTML = "";

if(storicoOperaio)
storicoOperaio.innerHTML =
'<option value="">Tutti gli operai</option>';

Object.entries(operai)
.forEach(function([id,op]){

if(presOperaio){

presOperaio.innerHTML +=  
 `<option value="${id}">  
   ${op.nome}  
 </option>`;

}

if(presAutista){

presAutista.innerHTML +=  
 `<option value="${op.nome}">  
   ${op.nome}  
 </option>`;

}

if(storicoOperaio){

storicoOperaio.innerHTML +=  
 `<option value="${op.nome}">  
   ${op.nome}  
 </option>`;

}

});

}

/* =========================
SELECT FURGONI
========================= */

function riempiSelectFurgoni(){

const select =
document.getElementById("presFurgone");

if(!select) return;

select.innerHTML = "";

Object.entries(furgoni)
.forEach(function([id,f]){

select.innerHTML +=

`<option value="${f.modello}">
${f.modello} (${f.targa})

   </option>`;  });

}

/* =========================
SELECT CANTIERI
========================= */

function riempiSelectCantieri(){

const select =
document.getElementById("presCantiere");

if(!select) return;

select.innerHTML = "";

Object.entries(cantieri)
.forEach(function([id,c]){

select.innerHTML +=

`<option value="${c.nome}">
${c.nome}

   </option>`;  });

}

/* =========================
PRESENZE
========================= */

document
.getElementById("btnSalvaPresenza")
.onclick = function(){

const idOperaio =
document.getElementById(
"presOperaio"
).value;
const dataGiornata =
document.getElementById(
"presData"
).value || oggiISO();

const op =
operai[idOperaio];

if(!op){

alert(
"Seleziona un operaio"
);

return;

}

const dati = {

nome: op.nome,

stato:
document.getElementById(
"presStato"
).value,

cantiere:
document.getElementById(
"presCantiere"
).value,

furgone:
document.getElementById(
"presFurgone"
).value,

autista:
document.getElementById(
"presAutista"
).value,

checkIn:
document.getElementById(
"presIn"
).value,

checkOut:
document.getElementById(
"presOut"
).value,

trasferta:
document.getElementById(
"presTrasferta"
).checked,

dal:
document.getElementById(
"presDal"
).value,

al:
document.getElementById(
"presAl"
).value,

motivo:
document.getElementById(
"presMotivo"
).value,

pagaGiorno:
op.pagaGiorno || 0

};

set(

ref(
db,
"presenze/" +
dataGiornata +
"/" +
idOperaio
),

dati

);

alert(
"Presenza salvata"
);

};

function renderPresenzeOggi(){

const box =
document.getElementById(
"listaPresenzeOggi"
);

if(!box) return;

box.innerHTML = "";

Object.entries(
presenzeOggi
)
.forEach(function([id,p]){

box.innerHTML += `

   <div class="card">     <h3>  👷 ${p.nome}

   </h3>     <small>  Stato:
${p.stato}<br>

Cantiere:
${p.cantiere}<br>

Furgone:
${p.furgone}<br>

Autista:
${p.autista}<br>

Check-In:
${p.checkIn}<br>

Check-Out:
${p.checkOut}

   </small>     <br>  <button  
class="btn-delete"  
onclick="eliminaPresenza('${id}')">

Elimina

   </button>     </div>  `;

});

}

window.eliminaPresenza =
function(id){

if(confirm(
"Eliminare giornata?"
)){

remove(

ref(  
 db,  
 "presenze/" +  
 oggiISO() +  
 "/" +  
 id  
)

);

}

};
/* =========================
STORICO
========================= */

document
.getElementById("btnCaricaStorico")
.onclick = function(){

const data =
document.getElementById(
"storicoData"
).value;

const operaio =
document.getElementById(
"storicoOperaio"
).value;

if(!data){

alert(
"Seleziona una data"
);

return;

}

onValue(

ref(
db,
"presenze/" + data
),

function(snapshot){

storico =
snapshot.val() || {};

const box =
document.getElementById(
"listaStorico"
);

box.innerHTML = "";

Object.entries(storico)
.forEach(function([id,p]){

if(  
   operaio !== "" &&  
   p.nome !== operaio  
  ){  
   return;  
  }  

  box.innerHTML += `  

  <div class="card">  

  <h3>  

  👷 ${p.nome}  

  </h3>  

  <small>  

  Stato:  
  ${p.stato}<br>  

  Cantiere:  
  ${p.cantiere || "-"}<br>  

  Furgone:  
  ${p.furgone || "-"}<br>  

  Autista:  
  ${p.autista || "-"}<br>  

  Check-In:  
  ${p.checkIn || "-"}<br>  

  Check-Out:  
  ${p.checkOut || "-"}<br>  

  Motivo:  
  ${p.motivo || "-"}  

  </small>  

  </div>  

  `;

});

});

};

/* =========================
COSTI
========================= */

document
.getElementById("btnCalcolaCosti")
.onclick = function(){

const dal =
document.getElementById(
"costiDal"
).value;

const al =
document.getElementById(
"costiAl"
).value;

if(
!dal ||
!al
){

alert(
"Seleziona le date"
);

return;

}

onValue(

ref(db,"presenze"),

function(snapshot){

const dati =
snapshot.val() || {};

const riepilogo = {};

let totale = 0;

Object.entries(dati)
.forEach(function([data,giornata]){

if(  
   data >= dal &&  
   data <= al  
  ){  

     Object.values(giornata)  
     .forEach(function(p){  

        let paga = 0;  

        if(  
         p.stato === "Presente"  
        ){  

           paga =  
           Number(  
           p.pagaGiorno || 0  
           );  

        }  

        const nome =  
        p.nome;  

        if(  
         !riepilogo[nome]  
        ){  

           riepilogo[nome] = 0;  

        }  

        riepilogo[nome] += paga;  

        totale += paga;  

     });  

  }

});

const box =
document.getElementById(
"listaCosti"
);

box.innerHTML = "";

Object.entries(riepilogo)
.forEach(function([nome,valore]){

box.innerHTML += `  

  <div class="card">  

  <h3>  

  👷 ${nome}  

  </h3>  

  <small>  

  Totale:  
  €${valore}  

  </small>  

  </div>  

  `;

});

document
.getElementById(
"totaleCosti"
)
.innerText =

"Totale: €" + totale;

});

};


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

/* FIREBASE */

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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);

/* VARIABILI */

let operai = {};

let furgoni = {};

let presenzeOggi = {};

let storico = {};

/* CAMBIO SCHERMATA */

window.showScreen = function(id){

 document
 .querySelectorAll(".screen")
 .forEach(function(screen){

   screen.classList.remove("active");

 });

 document
 .getElementById(id)
 .classList.add("active");

};

/* DATA OGGI */

function oggiISO(){

 return new Date()
 .toISOString()
 .slice(0,10);

}

document
.getElementById("dataOggi")
.innerText =
"📅 Oggi: " + oggiISO();

/* LOGIN */

document
.getElementById("btnLogin")
.onclick = async function(){

 const email =
 document.getElementById("email").value;

 const password =
 document.getElementById("password").value;

 try{

   await signInWithEmailAndPassword(
      auth,
      email,
      password
   );

 }catch(e){

   document
   .getElementById("loginErrore")
   .innerText =
   "Email o Password errata";

 }

};

/* LOGOUT */

document
.getElementById("btnLogout")
.onclick = async function(){

 await signOut(auth);

};

/* CONTROLLO LOGIN */

onAuthStateChanged(
 auth,
 function(user){

   if(user){

      showScreen("screenHome");

      caricaRealtime();

   }else{

      showScreen("screenLogin");

   }

 }
);

/* CARICAMENTO REALTIME */

function caricaRealtime(){

 /* OPERAI */

 onValue(
  ref(db,"operai"),
  function(snapshot){

   operai =
   snapshot.val() || {};

   renderOperai();

   riempiSelectOperai();

   riempiFiltroStorico();

  });

 /* FURGONI */

 onValue(
  ref(db,"furgoni"),
  function(snapshot){

   furgoni =
   snapshot.val() || {};

   renderFurgoni();

   riempiSelectFurgoni();

  });

 /* PRESENZE OGGI */

 onValue(
  ref(
   db,
   "presenze/" + oggiISO()
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
   ),

   attivo:true

 };

 set(
  ref(db,"operai/" + id),
  dati
 );

 document.getElementById("opNome").value="";
 document.getElementById("opRuolo").value="";
 document.getElementById("opTelefono").value="";
 document.getElementById("opPaga").value="";
 document.getElementById("opTrasferta").value="";

};

function renderOperai(){

 const box =
 document.getElementById("listaOperai");

 const cerca =
 document.getElementById("cercaOperaio")
 .value
 .toLowerCase();

 box.innerHTML="";

 Object.entries(operai)
 .forEach(function([id,op]){

   const nome =
   (op.nome || "")
   .toLowerCase();

   if(
    cerca &&
    !nome.includes(cerca)
   ){
    return;
   }

   box.innerHTML += `

   <div class="card">

      <h3>
      👷 ${op.nome}
      </h3>

      <small>

      Ruolo:
      ${op.ruolo}<br>

      Telefono:
      ${op.telefono}<br>

      Paga Giornaliera:
      €${op.pagaGiorno || 0}<br>

      Trasferta:
      €${op.trasferta || 0}

      </small>

      <br>

      <button
      class="btn-delete"
      onclick="eliminaOperaio('${id}')">

      Elimina

      </button>

   </div>

   `;

 });

}

document
.getElementById("cercaOperaio")
.oninput =
renderOperai;

window.eliminaOperaio =
function(id){

 if(
  confirm(
   "Eliminare operaio?"
  )
 ){

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

 document.getElementById("furModello").value="";
 document.getElementById("furTarga").value="";

};

function renderFurgoni(){

 const box =
 document.getElementById("listaFurgoni");

 box.innerHTML="";

 Object.entries(furgoni)
 .forEach(function([id,fur]){

   box.innerHTML += `

   <div class="card">

      <h3>

      🚐 ${fur.modello}

      </h3>

      <small>

      Targa:
      ${fur.targa}

      </small>

      <br>

      <button
      class="btn-delete"
      onclick="eliminaFurgone('${id}')">

      Elimina

      </button>

   </div>

   `;

 });

}

window.eliminaFurgone =
function(id){

 if(
  confirm(
   "Eliminare furgone?"
  )
 ){

   remove(
    ref(
      db,
      "furgoni/" + id
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

 presOperaio.innerHTML="";
 presAutista.innerHTML="";

 Object.entries(operai)
 .forEach(function([id,op]){

   presOperaio.innerHTML +=

   `<option value="${id}">
      ${op.nome}
    </option>`;

   presAutista.innerHTML +=

   `<option value="${op.nome}">
      ${op.nome}
    </option>`;

 });

}

/* =========================
   SELECT FURGONI
========================= */

function riempiSelectFurgoni(){

 const select =
 document.getElementById("presFurgone");

 select.innerHTML="";

 Object.values(furgoni)
 .forEach(function(fur){

   select.innerHTML +=

   `<option
      value="${fur.modello}">

      ${fur.modello}
      (${fur.targa})

    </option>`;

 });

}

/* =========================
   FILTRO STORICO OPERAI
========================= */

function riempiFiltroStorico(){

 const select =
 document.getElementById("storicoOperaio");

 select.innerHTML =

 `<option value="">
   Tutti gli operai
 </option>`;

 Object.entries(operai)
 .forEach(function([id,op]){

   select.innerHTML +=

   `<option value="${op.nome}">
      ${op.nome}
    </option>`;

 });

        }
/* =========================
   PRESENZE
========================= */

document
.getElementById("btnSalvaPresenza")
.onclick = function(){

 const idOperaio =
 document.getElementById("presOperaio").value;

 const op =
 operai[idOperaio];

 if(!op){
   alert("Seleziona un operaio");
   return;
 }

 const stato =
 document.getElementById("presStato").value;

 const dati = {

   idOperaio:idOperaio,

   nome:op.nome,

   stato:stato,

   cantiere:
   document.getElementById("presCantiere").value,

   furgone:
   document.getElementById("presFurgone").value,

   autista:
   document.getElementById("presAutista").value,

   checkIn:
   document.getElementById("presIn").value,

   checkOut:
   document.getElementById("presOut").value,

   trasferta:
   document.getElementById("presTrasferta").checked,

   dal:
   document.getElementById("presDal").value,

   al:
   document.getElementById("presAl").value,

   motivo:
   document.getElementById("presMotivo").value,

   pagaGiorno:
   op.pagaGiorno || 0

 };

 set(
  ref(
   db,
   "presenze/" +
   oggiISO() +
   "/" +
   idOperaio
  ),
  dati
 );

 alert("Presenza salvata");

};

function renderPresenzeOggi(){

 const box =
 document.getElementById(
 "listaPresenzeOggi"
 );

 box.innerHTML="";

 Object.entries(
 presenzeOggi
 )
 .forEach(
 function([id,p]){

   box.innerHTML += `

   <div class="card">

   <h3>

   ${p.nome}

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

   CheckIn:
   ${p.checkIn || "-"}<br>

   CheckOut:
   ${p.checkOut || "-"}<br>

   Motivo:
   ${p.motivo || "-"}

   </small>

   <br>

   <button
   class="btn-delete"
   onclick="eliminaPresenza('${id}')">

   Elimina giornata

   </button>

   </div>

   `;

 });

}

window.eliminaPresenza =
function(idOperaio){

 if(
  confirm(
   "Eliminare giornata?"
  )
 ){

   remove(
    ref(
     db,
     "presenze/" +
     oggiISO() +
     "/" +
     idOperaio
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

   box.innerHTML="";

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

      ${p.nome}

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

      CheckIn:
      ${p.checkIn || "-"}<br>

      CheckOut:
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
   .forEach(
   function([data,giornata]){

      if(
       data >= dal &&
       data <= al
      ){

         Object.values(
         giornata
         )
         .forEach(
         function(p){

            const nome =
            p.nome;

            const paga =
            Number(
            p.pagaGiorno || 0
            );

            if(
             !riepilogo[nome]
            ){
             riepilogo[nome]=0;
            }

            riepilogo[nome]+=paga;

            totale+=paga;

         });

      }

   });

   const box =
   document.getElementById(
   "listaCosti"
   );

   box.innerHTML="";

   Object.entries(
   riepilogo
   )
   .forEach(
   function([nome,valore]){

      box.innerHTML += `

      <div class="card">

      <h3>

      ${nome}

      </h3>

      <small>

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

function toggleDesayuno() {
    const selector = document.getElementById('hayDesayuno').value;
    document.getElementById('tiemposDesayuno').style.display = (selector === 'si') ? 'flex' : 'none';
}

function calcularMinutos(hora) {
    let [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
}

function crearCamposNombres() {
    const num = parseInt(document.getElementById('equipos').value);
    const container = document.getElementById('contenedorNombres');
    container.innerHTML = "";
    if (num > 0) {
        for (let i = 1; i <= num; i++) {
            let div = document.createElement('div');
            div.style.display = "flex";
            div.style.flexDirection = "column";
            div.innerHTML = `<label style="font-size:0.7em">Nombre Eq. ${i}</label>
                             <input type="text" id="name_${i-1}" placeholder="Equipo ${i}" style="padding:5px; border-radius:4px; border:1px solid #ccc;">`;
            container.appendChild(div);
        }
    }
}

// Ejecutar al cargar la página para que aparezcan los primeros 4 equipos
window.onload = crearCamposNombres;

function generarCalendario() {
    const porPosta = parseInt(document.getElementById('equiposPorPosta').value);
    const numEquipos = parseInt(document.getElementById('equipos').value);
    const numPostas = parseInt(document.getElementById('postas').value);
    const tJuego = parseInt(document.getElementById('tiempoPostaManual').value);
    const tRotacion = parseInt(document.getElementById('descanso').value);
    const horaInicioStr = document.getElementById('horaInicio').value;
    const repeticiones = parseInt(document.getElementById('repeticiones').value);
    
    const tieneDesayuno = document.getElementById('hayDesayuno').value === 'si';
    const desInicio = tieneDesayuno ? calcularMinutos(document.getElementById('desayunoInicio').value) : 0;
    const desFin = tieneDesayuno ? calcularMinutos(document.getElementById('desayunoFin').value) : 0;

    let nombres = [];
    for (let i = 0; i < numEquipos; i++) {
        let input = document.getElementById(`name_${i}`);
        nombres.push((input && input.value) ? input.value : `Eq. ${i+1}`);
    }

    let tiempoActualMins = calcularMinutos(horaInicioStr);
    let rondasTotales = Math.max(numPostas, Math.ceil(numEquipos / porPosta)) * repeticiones;

    let html = `<h2>Horario de Competición</h2>`;
    html += "<table><tr><th>Ronda</th><th>Horario</th>";
    for(let i=1; i<=numPostas; i++) html += `<th>Posta ${i}</th>`;
    html += "</tr>";

    let desayunoPasado = false;

    for (let r = 0; r < rondasTotales; r++) {
        // Verificar si la siguiente ronda entra en el desayuno
        if (tieneDesayuno && !desayunoPasado && (tiempoActualMins + tJuego) > desInicio) {
            html += `<tr style="background:#e8f5e9; font-weight:bold;"><td colspan="${numPostas+2}">☕ DESCANSO DESAYUNO</td></tr>`;
            tiempoActualMins = desFin;
            desayunoPasado = true;
        }

        let h = Math.floor(tiempoActualMins/60).toString().padStart(2,'0');
        let m = (tiempoActualMins%60).toString().padStart(2,'0');
        let finMins = tiempoActualMins + tJuego;
        let hF = Math.floor(finMins/60).toString().padStart(2,'0');
        let mF = (finMins%60).toString().padStart(2,'0');

        html += `<tr><td>${r+1}</td><td style="white-space:nowrap">${h}:${m} - ${hF}:${mF}</td>`;
        for (let p = 0; p < numPostas; p++) {
            let eqEnPosta = [];
            for (let e = 0; e < porPosta; e++) {
                let id = (p * porPosta + e + r) % numEquipos;
                eqEnPosta.push(nombres[id]);
            }
            html += `<td>${eqEnPosta.join(' <br>vs<br> ')}</td>`;
        }
        html += "</tr>";
        tiempoActualMins = finMins + tRotacion;
    }
    document.getElementById('resultado').innerHTML = html + "</table>";
}
function generarCalendario() {
    const porPosta = parseInt(document.getElementById('equiposPorPosta').value);
    const numEquipos = parseInt(document.getElementById('equipos').value);
    const numPostas = parseInt(document.getElementById('postas').value);
    const tJuego = parseInt(document.getElementById('tiempoPostaManual').value);
    const tRotacion = parseInt(document.getElementById('descanso').value);
    const horaInicioStr = document.getElementById('horaInicio').value;
    const repeticiones = parseInt(document.getElementById('repeticiones').value);
    
    const tieneDesayuno = document.getElementById('hayDesayuno').value === 'si';
    const desInicio = tieneDesayuno ? calcularMinutos(document.getElementById('desayunoInicio').value) : 0;
    const desFin = tieneDesayuno ? calcularMinutos(document.getElementById('desayunoFin').value) : 0;

    let nombres = [];
    for (let i = 0; i < numEquipos; i++) {
        let input = document.getElementById(`name_${i}`);
        nombres.push((input && input.value) ? input.value : `Eq. ${i+1}`);
    }

    let tiempoActualMins = calcularMinutos(horaInicioStr);
    let rondasTotales = Math.max(numPostas, Math.ceil(numEquipos / porPosta)) * repeticiones;

    // --- GENERAR TABLA DE HORARIOS ---
    let html = `<h2>Horario de Competición</h2>`;
    html += "<table><tr><th>Ronda</th><th>Horario</th>";
    for(let i=1; i<=numPostas; i++) html += `<th>Posta ${i}</th>`;
    html += "</tr>";

    let desayunoPasado = false;
    for (let r = 0; r < rondasTotales; r++) {
        if (tieneDesayuno && !desayunoPasado && (tiempoActualMins + tJuego) > desInicio) {
            html += `<tr style="background:#e8f5e9; font-weight:bold;"><td colspan="${numPostas+2}">☕ DESCANSO DESAYUNO</td></tr>`;
            tiempoActualMins = desFin;
            desayunoPasado = true;
        }

        let h = Math.floor(tiempoActualMins/60).toString().padStart(2,'0');
        let m = (tiempoActualMins%60).toString().padStart(2,'0');
        let finMins = tiempoActualMins + tJuego;
        let hF = Math.floor(finMins/60).toString().padStart(2,'0');
        let mF = (finMins%60).toString().padStart(2,'0');

        html += `<tr><td>${r+1}</td><td style="white-space:nowrap">${h}:${m} - ${hF}:${mF}</td>`;
        for (let p = 0; p < numPostas; p++) {
            let eqEnPosta = [];
            for (let e = 0; e < porPosta; e++) {
                let id = (p * porPosta + e + r) % numEquipos;
                eqEnPosta.push(nombres[id]);
            }
            html += `<td>${eqEnPosta.join(' <br>vs<br> ')}</td>`;
        }
        html += "</tr>";
        tiempoActualMins = finMins + tRotacion;
    }
    document.getElementById('resultado').innerHTML = html + "</table>";

    // --- GENERAR CUADRANTES DE ACTIVIDAD Y MATERIAL ---
    let htmlDetalles = `<h2>Detalles de las Postas</h2><div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">`;
    for(let i=1; i<=numPostas; i++) {
        htmlDetalles += `
            <div class="posta-card">
                <h3>Posta ${i}</h3>
                <label>Nombre de la Actividad:</label>
                <input type="text" placeholder="Ej: Carrera de sacos">
                <label>Material necesario:</label>
                <textarea rows="2" placeholder="Ej: 4 sacos, conos, silbato"></textarea>
            </div>`;
    }
    htmlDetalles += `</div>`;
    document.getElementById('detallesPostas').innerHTML = htmlDetalles;
}
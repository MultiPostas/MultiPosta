// CONFIGURACIÓN PRO
let planProActivado = false;
const CODIGO_SECRETO = "GYM2026"; 

// Variable global para que el PDF coincida con la pantalla
let calendarioGlobal = [];

window.onload = () => {
    crearCamposNombres();
    crearCamposPostas();
    
    // Lo protegemos aquí para asegurar que el botón "X" ya existe al cargar
    const btnCerrar = document.getElementById("botonCerrar");
    if (btnCerrar) {
        btnCerrar.addEventListener("click", function() {
            document.getElementById("modalPlanPro").style.display = "none";
        });
    }
    
    const modalPro = document.getElementById("modalPlanPro"); 
    window.onclick = function(event) {
        if (event.target == modalPro) {
            modalPro.style.display = "none";
        }
    };
};

function mostrarModalPRO() { 
   document.getElementById('modalPlanPro').style.display = 'flex';
}

function cerrarModalPRO() { 
    document.getElementById('modalPlanPro').style.display = 'none';
}

function verificarCodigo() {
    const cod = document.getElementById('inputCodigoPro').value.trim();
    if (cod === CODIGO_SECRETO) {
        planProActivado = true;
        alert("✅ Modo PRO activado correctamente. Ya puedes usar las funciones premium.");
        cerrarModalPRO();
    } else {
        alert("❌ Código incorrecto. Asegúrate de haber completado la solicitud en el formulario y de introducir el código que te enviamos por correo.");
    }
}

function ajustarMetodologia() {
    const metodo = document.getElementById('metodologia').value;
    const inputEquiposPorPosta = document.getElementById('equiposPorPosta');
    if (metodo === 'grandprix') {
        inputEquiposPorPosta.value = 2;
    }
}

function recomendarGrupos() {
    const ninos = parseInt(document.getElementById('numNinos').value);
    const postas = parseInt(document.getElementById('postas').value);
    if (ninos > 0 && postas > 0) {
        const equiposRec = postas * 2;
        const porEquipo = Math.floor(ninos / equiposRec);
        document.getElementById('alertaRecomendacion').innerHTML = 
            `💡 Recomendación: Crea <b>${equiposRec} equipos</b> de <b>${porEquipo} niños</b>.`;
    }
}

function validarYGenerar() {
    const email = document.getElementById('emailUsuario').value;
    const tipo = document.getElementById('tipoCompeticion').value;
    if (!email) { alert("Por favor, introduce tu correo."); return; }
    if (tipo === 'eliminatorias' && !planProActivado) { mostrarModalPRO(); return; }
    generarCalendario();
}

function crearCamposNombres() {
    const num = parseInt(document.getElementById('equipos').value);
    const container = document.getElementById('contenedorNombres');
    container.innerHTML = "";
    for (let i = 0; i < num; i++) {
        container.innerHTML += `<input type="text" id="name_${i}" placeholder="Equipo ${i+1}" style="padding:8px; border:1px solid #ccc; border-radius:4px;">`;
    }
}

function crearCamposPostas() {
    const num = parseInt(document.getElementById('postas').value);
    const container = document.getElementById('detallesPostas');
    container.innerHTML = "";
    for (let i = 0; i < num; i++) {
        container.innerHTML += `
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <input type="text" id="posta_name_${i}" placeholder="Actividad Posta ${i+1}" style="flex:1;">
                <input type="text" id="posta_mat_${i}" placeholder="Material" style="flex:1;">
            </div>`;
    }
}

function toggleDesayuno() {
    document.getElementById('tiemposDesayuno').style.display = 
        document.getElementById('hayDesayuno').value === 'si' ? 'block' : 'none';
}

function formatearHora(minutos) {
    let h = Math.floor(minutos / 60) % 24;
    let m = minutos % 60;
    return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
}

// --- MOTOR INTELIGENTE DE CRUCES ---
function generarCalendarioInteligente(numEquipos, numPostas, eqPorPosta, totalRondas) {
    let historialEnfrentamientos = Array(numEquipos).fill(null).map(() => Array(numEquipos).fill(0));
    let historialPostas = Array(numEquipos).fill(null).map(() => Array(numPostas).fill(0));
    let historialPartidos = Array(numEquipos).fill(0); 

    let calendario = [];

    for (let r = 0; r < totalRondas; r++) {
        let ronda = [];
        let equiposDisponibles = new Set();
        for (let i = 0; i < numEquipos; i++) equiposDisponibles.add(i);

        let ordenPostas = Array.from({length: numPostas}, (_, i) => i);
        ordenPostas.sort(() => Math.random() - 0.5);

        for (let p = 0; p < numPostas; p++) ronda.push([]);

        for (let p of ordenPostas) {
            let equiposPosta = [];
            for (let e = 0; e < eqPorPosta; e++) {
                if (equiposDisponibles.size === 0) break;

                let mejorEquipo = -1;
                let mejorPuntuacion = -Infinity;

                let arrayDisponibles = Array.from(equiposDisponibles);
                arrayDisponibles.sort(() => Math.random() - 0.5); 

                for (let candidato of arrayDisponibles) {
                    let penalizacionRival = 0;
                    for (let yaSeleccionado of equiposPosta) {
                        penalizacionRival += historialEnfrentamientos[candidato][yaSeleccionado] * 10000;
                    }

                    let penalizacionJugados = historialPartidos[candidato] * 1000;
                    let penalizacionPosta = historialPostas[candidato][p] * 100;

                    let puntuacion = -(penalizacionRival + penalizacionJugados + penalizacionPosta);

                    if (puntuacion > mejorPuntuacion) {
                        mejorPuntuacion = puntuacion;
                        mejorEquipo = candidato;
                    }
                }

                if (mejorEquipo !== -1) {
                    equiposPosta.push(mejorEquipo);
                    equiposDisponibles.delete(mejorEquipo);
                }
            }

            for (let i = 0; i < equiposPosta.length; i++) {
                historialPostas[equiposPosta[i]][p]++;
                historialPartidos[equiposPosta[i]]++;
                for (let j = i + 1; j < equiposPosta.length; j++) {
                    historialEnfrentamientos[equiposPosta[i]][equiposPosta[j]]++;
                    historialEnfrentamientos[equiposPosta[j]][equiposPosta[i]]++;
                }
            }
            ronda[p] = equiposPosta;
        }
        calendario.push(ronda);
    }
    return calendario;
}

function generarCalendario() {
    const numEquipos = parseInt(document.getElementById('equipos').value);
    const numPostas = parseInt(document.getElementById('postas').value);
    const eqPorPosta = parseInt(document.getElementById('equiposPorPosta').value);
    const tiempoP = parseInt(document.getElementById('tiempoPosta').value);
    const tiempoR = parseInt(document.getElementById('tiempoRotacion').value);
    const rep = parseInt(document.getElementById('repeticiones').value);
    const totalRondas = numPostas * rep;
    
    let [h, m] = document.getElementById('horaInicio').value.split(':').map(Number);
    let horaActual = h * 60 + m;

    calendarioGlobal = generarCalendarioInteligente(numEquipos, numPostas, eqPorPosta, totalRondas);
    
    let html = `<div id="pdfContent" style="padding:20px; background:white;">
                <h2>Horario de Encuentros</h2>
                <table><thead><tr><th>Hora</th>`;
    
    for(let p=0; p<numPostas; p++) {
        let nP = document.getElementById(`posta_name_${p}`).value || `Posta ${p+1}`;
        html += `<th>${nP}</th>`;
    }
    html += `</tr></thead><tbody>`;

    for(let r=0; r < totalRondas; r++) {
        let horaFin = horaActual + tiempoP;
        html += `<tr><td>${formatearHora(horaActual)} - ${formatearHora(horaFin)}</td>`;
        
        for(let p=0; p < numPostas; p++) {
            html += `<td>`;
            let equiposEnEstaPosta = calendarioGlobal[r][p];
            
            for(let e=0; e < eqPorPosta; e++) {
                let eqIdx = equiposEnEstaPosta[e];
                if (eqIdx !== undefined) {
                    let nEq = document.getElementById(`name_${eqIdx}`).value || `Eq. ${eqIdx+1}`;
                    html += `<div>${nEq}</div>`;
                } else {
                    html += `<div>-</div>`;
                }
            }
            html += `</td>`;
        }
        html += `</tr>`;
        horaActual = horaFin + tiempoR;
    }
    html += `</tbody></table></div>`;
    
    document.getElementById('resultado').innerHTML = html;
    document.getElementById('resultado').style.display = 'block';
    document.getElementById('btnDescargar').style.display = 'block';
}

async function descargarPDF() {
    const { jsPDF } = window.jspdf;
    const content = document.getElementById("pdfContent");
    const canvas = await html2canvas(content, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save("Planificacion.pdf");
}

function descargarPDFPorEquipos() {
    if (!planProActivado) {
        mostrarModalPRO();
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const numEquipos = parseInt(document.getElementById('equipos').value);
    const numPostas = parseInt(document.getElementById('postas').value);
    const tiempoP = parseInt(document.getElementById('tiempoPosta').value);
    const tiempoR = parseInt(document.getElementById('tiempoRotacion').value);
    const rep = parseInt(document.getElementById('repeticiones').value);
    let [h, m] = document.getElementById('horaInicio').value.split(':').map(Number);
    const totalRondas = numPostas * rep;

    for (let equipoActual = 0; equipoActual < numEquipos; equipoActual++) {
        let nombreEquipoActual = document.getElementById(`name_${equipoActual}`).value || `Equipo ${equipoActual + 1}`;
        
        if (equipoActual > 0) {
            doc.addPage();
        }

        doc.setFontSize(18);
        doc.setTextColor(0, 51, 102); 
        doc.text(`Ruta de Competición: ${nombreEquipoActual}`, 14, 20);
        doc.setFontSize(12);
        doc.setTextColor(51, 51, 51);

        let bodyData = [];
        let horaActualLoop = h * 60 + m;

        for (let r = 0; r < totalRondas; r++) {
            let horaFin = horaActualLoop + tiempoP;
            let horarioTexto = `${formatearHora(horaActualLoop)} - ${formatearHora(horaFin)}`;
            
            let juegaEnRonda = false;

            for (let p = 0; p < numPostas; p++) {
                let equiposEnEstaPosta = calendarioGlobal[r][p];

                if (equiposEnEstaPosta.includes(equipoActual)) {
                    juegaEnRonda = true;
                    let nombrePosta = document.getElementById(`posta_name_${p}`).value || `Posta ${p + 1}`;
                    let materialPosta = document.getElementById(`posta_mat_${p}`).value || `-`;
                    
                    let rivales = equiposEnEstaPosta
                        .filter(id => id !== undefined && id !== equipoActual)
                        .map(id => document.getElementById(`name_${id}`).value || `Equipo ${id + 1}`)
                        .join(" y ");
                    
                    let textoRivales = rivales ? rivales : "Prueba en solitario";

                    bodyData.push([`Ronda ${r + 1}`, horarioTexto, nombrePosta, textoRivales, materialPosta]);
                }
            }

            if (!juegaEnRonda) {
                bodyData.push([`Ronda ${r + 1}`, horarioTexto, "Descanso", "-", "-"]);
            }

            horaActualLoop = horaFin + tiempoR;
        }

        doc.autoTable({
            startY: 30,
            head: [['Ronda', 'Hora', 'Lugar / Actividad', 'Se Enfrenta Contra', 'Material']], 
            body: bodyData,
            theme: 'striped',
            headStyles: { fillColor: [0, 51, 102] }, 
            styles: { fontSize: 11 }
        });
    }

    doc.save("Cuadrante_Por_Equipos_PRO.pdf");
}

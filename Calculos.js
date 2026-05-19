// Función para ocultar/mostrar las paradas de la misma ciudad
function actualizarDestinosOpciones() {
    const selectorOrigen = document.getElementById('origen');
    const selectorDestino = document.getElementById('destino');
    
    const opcionOrigenSeleccionada = selectorOrigen.options[selectorOrigen.selectedIndex];
    const ciudadOrigen = opcionOrigenSeleccionada.getAttribute('data-ciudad');

    let primeraOpcionValida = null;

    for (let i = 0; i < selectorDestino.options.length; i++) {
        const opcionDestino = selectorDestino.options[i];
        const ciudadDestino = opcionDestino.getAttribute('data-ciudad');

        if (ciudadDestino === ciudadOrigen) {
            opcionDestino.style.display = 'none';
        } else {
            opcionDestino.style.display = 'block';
            if (!primeraOpcionValida) {
                primeraOpcionValida = opcionDestino;
            }
        }
    }

    if (selectorDestino.options[selectorDestino.selectedIndex].style.display === 'none' && primeraOpcionValida) {
        selectorDestino.value = primeraOpcionValida.value;
    }
}

window.onload = function() {
    actualizarDestinosOpciones();
};

function aplicarMascaraHora(input) {
    let valor = input.value.replace(/\D/g, "");
    if (valor.length > 2) {
        valor = valor.slice(0, 2) + ":" + valor.slice(2, 4);
    }
    input.value = valor;
}

function validarHoraFormato(horaTexto) {
    const regex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(horaTexto);
}

function convertirAMinutos(horaTexto) {
    if (!horaTexto || horaTexto === "-" || horaTexto.includes(".")) return null;
    const partes = horaTexto.split(":");
    return parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
}

function buscarAutobusReal() {
    const origen = document.getElementById('origen').value;
    const destino = document.getElementById('destino').value;
    const horaDeseadaTexto = document.getElementById('horaLlegada').value;
    const divResultado = document.getElementById('resultado');

    if (!validarHoraFormato(horaDeseadaTexto)) {
        divResultado.style.display = "block";
        divResultado.innerHTML = "❌ Por favor, introduce una hora válida en formato 24h (Ej: 08:30).";
        return;
    }

    divResultado.style.display = "block";
    divResultado.innerHTML = "🔍 Consultando al Consorcio de Transportes...";

    const minutesDeseados = convertirAMinutos(horaDeseadaTexto);

    fetch('https://backend-calculadora-m-10-movil.onrender.com/api/horarios')
        .then(response => response.json())
        .then(datos => {
            const listaAutobuses = datos.ida; 
            let mejorBus = null;
            let menorDiferencia = Infinity;

            listaAutobuses.forEach(bus => {
                const minutosSalida = convertirAMinutos(bus[origen]);
                const minutosLlegada = convertirAMinutos(bus[destino]);

                if (minutosSalida !== null && minutosLlegada !== null && minutosSalida < minutosLlegada) {
                    if (minutosLlegada <= minutesDeseados) {
                        const diferencia = minutesDeseados - minutosLlegada;
                        if (diferencia < menorDiferencia) {
                            menorDiferencia = diferencia;
                            mejorBus = bus;
                        }
                    }
                }
            });

            if (mejorBus) {
                divResultado.innerHTML = `
                    <p>✅ <strong>¡Autobús ideal encontrado!</strong></p>
                    <ul>
                        <li>Súbete en tu parada a las: <strong>${mejorBus[origen]}</strong> 🚌</li>
                        <li>Llegarás a tu destino a las: <strong>${mejorBus[destino]}</strong> 🏁</li>
                        <li>Llegarás con <strong>${menorDiferencia} minutos</strong> de adelanto.</li>
                    </ul>
                    <p style="font-size: 12px; color: #777;">Calendario del servicio: ${mejorBus.dias}</p>
                `;
            } else {
                divResultado.innerHTML = "❌ No hay ningún autobús de la línea M-10 que pase por esas paradas en ese orden y llegue antes de la hora indicada.";
            }
        })
        .catch(error => {
            console.error(error);
            // Esto nos mostrará el error real en pantalla si algo falla
            divResultado.innerHTML = "⚠️ Error: " + error.message;
        });
}
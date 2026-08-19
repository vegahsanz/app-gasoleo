const supabaseClient = supabase.createClient("https://hxnzdrpljgyfmzjlsuaa.supabase.co", "sb_publishable_gsHvbe35Rv21Ja03AMNd0g_EgSKkUIi");
const panelLogin =
    document.getElementById("panelLogin");

const appPrincipal =
    document.getElementById("appPrincipal");

const emailLogin =
    document.getElementById("emailLogin");

const passwordLogin =
    document.getElementById("passwordLogin");

const botonLogin =
    document.getElementById("botonLogin");

const mensajeLogin =
    document.getElementById("mensajeLogin");

const botonLogout =
    document.getElementById("botonLogout");

async function iniciarSesion() {

    const email =
        emailLogin.value.trim();

    const password =
        passwordLogin.value;

    mensajeLogin.textContent =
        "Entrando...";

    const { error } =
        await supabaseClient.auth
            .signInWithPassword({
                email: email,
                password: password
            });

    if (error) {

        console.log(
            "Error iniciando sesión:",
            error
        );

        mensajeLogin.textContent =
            "Correo o contraseña incorrectos.";

        return;
    }

    mensajeLogin.textContent = "";

    panelLogin.style.display =
        "none";

    appPrincipal.style.display =
        "block";

    await iniciarApp();
}
botonLogin.addEventListener(
    "click",
    iniciarSesion
);

async function cerrarSesion() {

    const { error } =
        await supabaseClient.auth.signOut();

    if (error) {
        console.log(
            "Error cerrando sesión:",
            error
        );
        return;
    }

    appPrincipal.style.display = "none";
    panelLogin.style.display = "block";

    emailLogin.value = "";
    passwordLogin.value = "";
}
botonLogout.addEventListener(
    "click",
    cerrarSesion
);

const boton = document.getElementById("guardarViaje");
const listaViajes = document.getElementById("listaViajes");
const botonRepostaje = document.getElementById("guardarRepostaje");
const listaRepostajes = document.getElementById("listaRepostajes");
const panelPendientes = document.getElementById("panelPendientes");
const listaPendientes = document.getElementById("listaPendientes");
const cerrarPendientes = document.getElementById("cerrarPendientes");
const contenidoResumenCiclo = document.getElementById("contenidoResumenCiclo");
const listaCiclos = document.getElementById("listaCiclos");
const toggleViajes = document.getElementById("toggleViajes");
const toggleRepostajes = document.getElementById("toggleRepostajes");
listaViajes.style.display =
    "none";

listaRepostajes.style.display =
    "none";


toggleViajes.addEventListener(
    "click",
    function () {

        if (
            listaViajes.style.display ===
            "none"
        ) {

            listaViajes.style.display =
                "block";

            toggleViajes.textContent =
                "Ocultar viajes";

        } else {

            listaViajes.style.display =
                "none";

            toggleViajes.textContent =
                "Mostrar viajes";
        }
    }
);


toggleRepostajes.addEventListener(
    "click",
    function () {

        if (
            listaRepostajes.style.display ===
            "none"
        ) {

            listaRepostajes.style.display =
                "block";

            toggleRepostajes.textContent =
                "Ocultar repostajes";

        } else {

            listaRepostajes.style.display =
                "none";

            toggleRepostajes.textContent =
                "Mostrar repostajes";
        }
    }
);
// Recuperamos los datos guardados, si existen
let viajes = [];
let repostajes = [];
let indiceViajeEditando = null;
let pagosRealizados = {};



// Mostramos los viajes guardados al abrir la página
mostrarViajes();
rellenarKmInicial();
mostrarRepostajes();
mostrarHistorialCiclos();

const campoKmInicial = document.getElementById("kmInicial");
const avisoKm = document.getElementById("avisoKm");
const textoAvisoKm = document.getElementById("textoAvisoKm");
const cerrarAvisoKm = document.getElementById("cerrarAvisoKm");
const registrarKmFaltantes = document.getElementById("registrarKmFaltantes");
const usuarioKmFaltantes = document.getElementById("usuarioKmFaltantes");
const fechaKmFaltantes = document.getElementById("fechaKmFaltantes");


// Aquí guardaremos temporalmente los km que faltan
let kmInicioFaltantes = null;
let kmFinalFaltantes = null;


campoKmInicial.addEventListener("change", function () {

    // Si estamos editando un viaje antiguo,
    // no comprobamos kilómetros faltantes
    if (indiceViajeEditando !== null) {
        return;
    }

    if (viajes.length === 0) {
        return;
    }

    const ultimoViaje = viajes[viajes.length - 1];

    const kmFinalUltimoViaje = ultimoViaje.kmFinal;
    const kmInicialNuevoViaje = Number(campoKmInicial.value);

    if (kmInicialNuevoViaje !== kmFinalUltimoViaje) {

        const diferencia =
            kmInicialNuevoViaje - kmFinalUltimoViaje;

        // Guardamos temporalmente el tramo que falta
        kmInicioFaltantes = kmFinalUltimoViaje;
        kmFinalFaltantes = kmInicialNuevoViaje;

        textoAvisoKm.textContent =
            "Hay " +
            diferencia +
            " km sin registrar, desde el km " +
            kmFinalUltimoViaje +
            " hasta el km " +
            kmInicialNuevoViaje +
            ".";

        avisoKm.className = "aviso-visible";
    }
});


// GUARDAR LOS KM FALTANTES
registrarKmFaltantes.addEventListener("click", async function () {

    const usuario = usuarioKmFaltantes.value;
    const fecha = fechaKmFaltantes.value;

    if (fecha === "") {
        textoAvisoKm.textContent =
            "Debes indicar una fecha antes de registrar los kilómetros.";
        return;
    }

    const distancia =
        kmFinalFaltantes - kmInicioFaltantes;

  const viajeFaltante = {
    usuarios: [usuario],
    kmInicial: kmInicioFaltantes,
    kmFinal: kmFinalFaltantes,
    distancia: distancia,
    fecha: fecha
};

await guardarViajeEnSupabase(
    viajeFaltante
);

await cargarViajesDesdeSupabase();


    avisoKm.className = "aviso-oculto";

    document.getElementById("resultado").textContent =
        "Se han registrado " +
        distancia +
        " km a nombre de " +
        usuario +
        ".";

    fechaKmFaltantes.value = "";
});


// CERRAR SIN REGISTRAR
cerrarAvisoKm.addEventListener("click", function () {

    avisoKm.className = "aviso-oculto";
});



// =========================
// GUARDAR VIAJE
// =========================

boton.addEventListener("click",  async function () {

    const casillasUsuarios =
    document.querySelectorAll("#usuariosViaje input[type='checkbox']:checked");

const usuarios = [];

casillasUsuarios.forEach(function (casilla) {
    usuarios.push(casilla.value);
});


// OLVIDÓN NO PUEDE COMPARTIR VIAJE
if (
    usuarios.includes("Olvidón") &&
    usuarios.length > 1
) {
    document.getElementById("resultado").textContent =
        "Olvidón no puede seleccionarse junto a otros usuarios.";

    return;
}


// DEBE HABER AL MENOS UN USUARIO
if (usuarios.length === 0) {
    document.getElementById("resultado").textContent =
        "Debes seleccionar al menos un usuario.";

    return;
}

    const kmInicialTexto = document.getElementById("kmInicial").value;
    const kmFinalTexto = document.getElementById("kmFinal").value;

    // Comprobamos que los campos no estén vacíos
    if (kmInicialTexto === "" || kmFinalTexto === "") {
        document.getElementById("resultado").textContent =
            "Debes introducir los kilómetros iniciales y finales.";
        return;
    }

    // Convertimos los textos a números
    const kmInicial = Number(kmInicialTexto);
    const kmFinal = Number(kmFinalTexto);

    // Los kilómetros finales deben ser mayores
    if (kmFinal <= kmInicial) {
        document.getElementById("resultado").textContent =
            "Los kilómetros finales deben ser mayores que los iniciales.";
        return;
    }

    // Calculamos la distancia recorrida
    const distancia = kmFinal - kmInicial;

    // Creamos el objeto viaje
    const viaje = {
        usuarios: usuarios,
        kmInicial: kmInicial,
        kmFinal: kmFinal,
        distancia: distancia
    };

    /// Añadimos el viaje a la lista o actualizamos uno existente
if (indiceViajeEditando === null) {

    await guardarViajeEnSupabase(
    viaje
);

await cargarViajesDesdeSupabase();

} else {

    const indice = indiceViajeEditando;

    const viajeOriginal = viajes[indice];

    const usuariosOriginales =
        viajeOriginal.usuarios ||
        (viajeOriginal.usuario
            ? [viajeOriginal.usuario]
            : []);


    // =========================
    // COMPROBAMOS QUE EL NUEVO
    // TRAMO ESTÉ DENTRO DEL ORIGINAL
    // =========================

   if (
    kmInicial < viajeOriginal.kmInicial ||
    kmInicial > viajeOriginal.kmFinal ||
    kmFinal < viajeOriginal.kmInicial ||
    kmFinal > viajeOriginal.kmFinal
) {

    document.getElementById("resultado").textContent =
        "El nuevo tramo debe estar dentro de los kilómetros del viaje original: " +
        viajeOriginal.kmInicial +
        " → " +
        viajeOriginal.kmFinal +
        ".";

    return;
}


    // Aquí guardaremos los nuevos tramos
    const nuevosViajes = [];


    // =========================
    // TRAMO QUE QUEDA ANTES
    // =========================

    if (kmInicial > viajeOriginal.kmInicial) {

        const tramoAnterior = {

            usuarios: [...usuariosOriginales],

            kmInicial:
                viajeOriginal.kmInicial,

            kmFinal:
                kmInicial,

            distancia:
                kmInicial -
                viajeOriginal.kmInicial
        };


        // Si el viaje original tenía fecha,
        // la conservamos
        if (viajeOriginal.fecha) {
            tramoAnterior.fecha =
                viajeOriginal.fecha;
        }


        nuevosViajes.push(
            tramoAnterior
        );
    }


    // =========================
    // VIAJE EDITADO
    // =========================

    if (viajeOriginal.fecha) {
        viaje.fecha =
            viajeOriginal.fecha;
    }

    nuevosViajes.push(
        viaje
    );


    // =========================
    // TRAMO QUE QUEDA DESPUÉS
    // =========================

    if (kmFinal < viajeOriginal.kmFinal) {

        const tramoPosterior = {

            usuarios: [...usuariosOriginales],

            kmInicial:
                kmFinal,

            kmFinal:
                viajeOriginal.kmFinal,

            distancia:
                viajeOriginal.kmFinal -
                kmFinal
        };


        if (viajeOriginal.fecha) {
            tramoPosterior.fecha =
                viajeOriginal.fecha;
        }


        nuevosViajes.push(
            tramoPosterior
        );
    }


    // =========================
    // SUSTITUIMOS EL VIAJE ORIGINAL
    // POR LOS NUEVOS TRAMOS
    // =========================

    const viajeOriginalId =
    viajeOriginal.id;

await reemplazarViajeEnSupabase(
    viajeOriginalId,
    nuevosViajes
);

indiceViajeEditando = null;
}

    // Actualizamos la pantalla
    mostrarViajes();
    rellenarKmInicial();

    document.getElementById("resultado").textContent =
    usuarios.join(" y ") +
    " han recorrido " +
    distancia +
    " km";

    // Limpiamos los km finales para el siguiente viaje
    document.getElementById("kmFinal").value = "";

    //limpiamos casillas de usuario
    casillasUsuarios.forEach(function (casilla) {
    casilla.checked = false;
});
});


// =========================
// RELLENAR KM INICIALES
// =========================

function rellenarKmInicial() {

    if (viajes.length > 0) {

        const ultimoViaje = viajes[viajes.length - 1];

        document.getElementById("kmInicial").value =
            ultimoViaje.kmFinal;
    }
}

function formatearFecha(fecha) {

    if (!fecha) {
        return "Sin fecha";
    }

    const partes = fecha.split("-");

    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// =========================
// MOSTRAR VIAJES
// =========================

function mostrarViajes() {

    listaViajes.innerHTML = "";

    viajes.forEach(function (viaje, indice) {

    const nuevoViaje = document.createElement("li");

    // Compatibilidad con viajes antiguos
    const usuariosViaje =
        viaje.usuarios ||
        (viaje.usuario ? [viaje.usuario] : []);

    const nombresUsuarios = usuariosViaje.join(" y ");

    if (
        usuariosViaje.length === 1 &&
        usuariosViaje[0] === "Olvidón" &&
        viaje.fecha
    ) {

        nuevoViaje.textContent =
            nombresUsuarios + " - " +
            viaje.distancia + " km (" +
            viaje.kmInicial + " → " +
            viaje.kmFinal + ") - " +
            formatearFecha(viaje.fecha);

    } else {

        nuevoViaje.textContent =
            nombresUsuarios + " - " +
            viaje.distancia + " km (" +
            viaje.kmInicial + " → " +
            viaje.kmFinal + ")";
    }
    
    const accionesViaje =
    document.createElement("div");

accionesViaje.className =
    "accionesViaje";
    
    const botonEditar = document.createElement("button");

    botonEditar.textContent = "✏️"; 
    botonEditar.addEventListener("click", function () {

    indiceViajeEditando = indice;

    const usuariosViaje =
        viaje.usuarios ||
        (viaje.usuario ? [viaje.usuario] : []);

    const casillas =
        document.querySelectorAll(
            "#usuariosViaje input[type='checkbox']"
        );

    casillas.forEach(function (casilla) {

        casilla.checked =
            usuariosViaje.includes(casilla.value);
    });

    document.getElementById("kmInicial").value =
        viaje.kmInicial;

    document.getElementById("kmFinal").value =
        viaje.kmFinal;

    document.getElementById("resultado").textContent =
        "Editando viaje. Modifica los datos y pulsa Guardar viaje.";
});
        accionesViaje.appendChild(botonEditar);

    // SOLO EL ÚLTIMO VIAJE TIENE BOTÓN ELIMINAR
if (indice === viajes.length - 1) {

    const botonEliminar = document.createElement("button");

    botonEliminar.textContent = "🗑️";

    botonEliminar.addEventListener("click", function () {

        const confirmar =
            confirm("¿Seguro que quieres eliminar este viaje?");

        if (!confirmar) {
            return;
        }

        const viajeABorrar =
        viajes[indice];

        eliminarViajeDeSupabase(
            viajeABorrar.id
    );
});

    accionesViaje.appendChild(botonEliminar);
}
     
    nuevoViaje.appendChild(accionesViaje);
    listaViajes.appendChild(nuevoViaje);
});
}


// =========================
// GUARDAR REPOSTAJE
// =========================

botonRepostaje.addEventListener("click", function () {

    const pagador = document.getElementById("pagador").value;

    const importeTexto =
        document.getElementById("importeRepostaje").value;

    const kmTexto =
        document.getElementById("kmRepostaje").value;

    const fecha =
        document.getElementById("fechaRepostaje").value;

    const litrosTexto =
        document.getElementById("litrosRepostaje").value;

    const tipo =
        document.getElementById("tipoRepostaje").value;

    // Comprobamos que todos los campos estén completos
    if (
        importeTexto === "" ||
        kmTexto === "" ||
        fecha === "" ||
        litrosTexto === ""
     )
    {
        document.getElementById("resultadoRepostaje").textContent =
            "Debes completar todos los datos del repostaje.";
        return;
    }


    // Convertimos los valores numéricos
    const importe = Number(importeTexto);
    const km = Number(kmTexto);
    const litros = Number(litrosTexto);
    const precioLitro = importe / litros;


    // Creamos el objeto repostaje
    const repostaje = {
        pagador: pagador,
        importe: importe,
        km: km,
        fecha: fecha,
        litros: litros,
        precioLitro: precioLitro,
        tipo: tipo
    };


    // Añadimos el repostaje a la lista
    repostajes.push(repostaje);
    guardarRepostajeEnSupabase(repostaje);


mostrarRepostajes();
mostrarHistorialCiclos();

// COMPROBAMOS SI ACABAMOS DE CERRAR UN CICLO

if (tipo === "completo") {

    const ciclos = obtenerCiclos();

    if (ciclos.length > 0) {

        const ultimoCiclo =
            ciclos[ciclos.length - 1];

        if (ultimoCiclo.estado === "pendiente") {

            mostrarPendientesDelCiclo(
                ultimoCiclo
            );

            mostrarResumenCiclo(
                ultimoCiclo
            );

        } else {

            mostrarResumenCiclo(
                ultimoCiclo
            );
        }
    }
}


// Mostramos mensaje de confirmación
document.getElementById("resultadoRepostaje").textContent =
    "Repostaje guardado: " +
    importe +
    " € pagados por " +
    pagador;


    // Limpiamos los campos
    document.getElementById("importeRepostaje").value = "";
    document.getElementById("kmRepostaje").value = "";
    document.getElementById("fechaRepostaje").value = "";
    document.getElementById("litrosRepostaje").value = "";
}); 
function mostrarRepostajes() {

    listaRepostajes.innerHTML = "";

    repostajes.forEach(function (repostaje, indice) {

    const nuevoRepostaje = document.createElement("li");

    const precioMostrado =
        repostaje.precioLitro !== undefined
            ? repostaje.precioLitro.toFixed(3)
            : "Sin dato";

    nuevoRepostaje.textContent =
        formatearFecha(repostaje.fecha) + " - " +
        repostaje.pagador + " - " +
        repostaje.importe + " € - " +
        repostaje.litros + " L - " +
        precioMostrado + " €/L - " +
        repostaje.km + " km - " +
        repostaje.tipo;
// SOLO EL ÚLTIMO REPOSTAJE TIENE BOTÓN ELIMINAR
if (indice === repostajes.length - 1) {

    const botonEliminarRepostaje =
        document.createElement("button");

    botonEliminarRepostaje.textContent =
        "🗑️";

    botonEliminarRepostaje.addEventListener(
        "click",
        function () {

            const confirmar =
                confirm(
                    "¿Seguro que quieres eliminar este repostaje?"
                );

            if (!confirmar) {
                return;
            }

            const repostajeABorrar =
                    repostajes[indice];

            eliminarRepostajeDeSupabase(
                    repostajeABorrar.id
                );
        }
    );

    nuevoRepostaje.appendChild(
        botonEliminarRepostaje
    );
}
    listaRepostajes.appendChild(nuevoRepostaje);
});
}
// =========================
// CICLOS
// =========================

function obtenerCiclos() {

    const completos = repostajes.filter(function (repostaje) {
        return repostaje.tipo === "completo";
    });

    const ciclos = [];

    for (let i = 0; i < completos.length - 1; i++) {

        const inicio = completos[i];
        const fin = completos[i + 1];


        // =========================
        // VIAJES DEL CICLO
        // =========================

        const viajesDelCiclo = viajes.filter(function (viaje) {

            return (
                viaje.kmInicial >= inicio.km &&
                viaje.kmFinal <= fin.km
            );
        });


        // =========================
        // VIAJES DE OLVIDÓN
        // =========================

        const cicloTemporal = {
            viajes: viajesDelCiclo
        };

        const viajesOlvidon =
            obtenerViajesOlvidon(cicloTemporal);


        // =========================
        // KM POR USUARIO
        // =========================

        const kmPorUsuario = {
            Vega: 0,
            Félix: 0,
            Estíbaliz: 0,
            Mario: 0,
            Olvidón: 0
        };

        viajesDelCiclo.forEach(function (viaje) {

            const usuariosViaje =
                viaje.usuarios ||
                (viaje.usuario ? [viaje.usuario] : []);

            if (usuariosViaje.length === 0) {
                return;
            }

            const kmPorPersona =
                viaje.distancia / usuariosViaje.length;

            usuariosViaje.forEach(function (usuario) {

                if (kmPorUsuario[usuario] !== undefined) {
                    kmPorUsuario[usuario] += kmPorPersona;
                }

            });

        });


        // =========================
        // KM TOTALES
        // =========================

        const kmTotales =
            kmPorUsuario.Vega +
            kmPorUsuario.Félix +
            kmPorUsuario.Estíbaliz +
            kmPorUsuario.Mario +
            kmPorUsuario.Olvidón;


        // =========================
        // REPOSTAJES DEL CICLO
        // =========================

        const repostajesDelCiclo = repostajes.filter(function (repostaje) {

            return (
                repostaje.km >= inicio.km &&
                repostaje.km < fin.km
            );
        });


        // =========================
        // COSTE TOTAL DEL CICLO
        // =========================

        let costeTotal = 0;

        repostajesDelCiclo.forEach(function (repostaje) {
            costeTotal += repostaje.importe;
        });


        // =========================
        // PORCENTAJES DE USO
        // =========================

        const porcentajePorUsuario = {
            Vega: 0,
            Félix: 0,
            Estíbaliz: 0,
            Mario: 0,
            Olvidón: 0
        };

        if (kmTotales > 0) {

            porcentajePorUsuario.Vega =
                kmPorUsuario.Vega / kmTotales;

            porcentajePorUsuario.Félix =
                kmPorUsuario.Félix / kmTotales;

            porcentajePorUsuario.Estíbaliz =
                kmPorUsuario.Estíbaliz / kmTotales;

            porcentajePorUsuario.Mario =
                kmPorUsuario.Mario / kmTotales;

            porcentajePorUsuario.Olvidón =
                kmPorUsuario.Olvidón / kmTotales;
        }


        // =========================
        // COSTE POR USUARIO
        // =========================

        const costePorUsuario = {

            Vega:
                porcentajePorUsuario.Vega * costeTotal,

            Félix:
                porcentajePorUsuario.Félix * costeTotal,

            Estíbaliz:
                porcentajePorUsuario.Estíbaliz * costeTotal,

            Mario:
                porcentajePorUsuario.Mario * costeTotal,

            Olvidón:
                porcentajePorUsuario.Olvidón * costeTotal
        };


        // =========================
        // DINERO PAGADO POR USUARIO
        // =========================

        const pagadoPorUsuario = {
            Vega: 0,
            Félix: 0,
            Estíbaliz: 0,
            Mario: 0
        };

        repostajesDelCiclo.forEach(function (repostaje) {

            if (pagadoPorUsuario[repostaje.pagador] !== undefined) {
                pagadoPorUsuario[repostaje.pagador] += repostaje.importe;
            }

        });


        // =========================
        // SALDOS
        // =========================

        const saldoPorUsuario = {

            Vega:
                pagadoPorUsuario.Vega -
                costePorUsuario.Vega,

            Félix:
                pagadoPorUsuario.Félix -
                costePorUsuario.Félix,

            Estíbaliz:
                pagadoPorUsuario.Estíbaliz -
                costePorUsuario.Estíbaliz,

            Mario:
                pagadoPorUsuario.Mario -
                costePorUsuario.Mario
        };


        // =========================
        // PAGOS
        // =========================

        let pagos = [];

if (viajesOlvidon.length === 0) {
    pagos = calcularPagosMinimos(saldoPorUsuario);
}


        // =========================
        // CREAMOS EL CICLO
        // =========================

        const ciclo = {

            repostajeInicial: inicio,
            repostajeFinal: fin,

            kmInicio: inicio.km,
            kmFin: fin.km,

            viajes: viajesDelCiclo,
            repostajes: repostajesDelCiclo,

            viajesOlvidon: viajesOlvidon,

            estado:
                viajesOlvidon.length > 0
                    ? "pendiente"
                    : "cerrado",

            kmPorUsuario: kmPorUsuario,
            kmTotales: kmTotales,

            porcentajePorUsuario:
                porcentajePorUsuario,

            costeTotal: costeTotal,
            costePorUsuario: costePorUsuario,

            pagadoPorUsuario:
                pagadoPorUsuario,

            saldoPorUsuario:
                saldoPorUsuario,

            pagos: pagos
        };


        ciclos.push(ciclo);
    }

    return ciclos;
}
function obtenerClaveCiclo(ciclo) {

        return ciclo.kmInicio + "-" + ciclo.kmFin;
    }

function obtenerClavePago(pago) {

    return (
        pago.de +
        "-" +
        pago.a +
        "-" +
        Math.round(pago.cantidad * 100)
    );
}


function pagoEstaRealizado(ciclo, pago) {

    const claveCiclo =
        obtenerClaveCiclo(ciclo);

    const clavePago =
        obtenerClavePago(pago);


    if (!pagosRealizados[claveCiclo]) {
        return false;
    }


    return pagosRealizados[
        claveCiclo
    ].includes(clavePago);
}


function cicloEstaLiquidado(ciclo) {

    if (ciclo.pagos.length === 0) {
        return true;
    }

    return ciclo.pagos.every(
        function (pago) {

            return pagoEstaRealizado(
                ciclo,
                pago
            );
        }
    );
}

function calcularPagosMinimos(saldoPorUsuario) {

    // Convertimos los saldos a céntimos
    const personas = [];

    for (const usuario in saldoPorUsuario) {

        const saldoCentimos =
            Math.round(saldoPorUsuario[usuario] * 100);

        if (saldoCentimos !== 0) {
            personas.push({
                usuario: usuario,
                saldo: saldoCentimos
            });
        }
    }


    let mejorSolucion = null;


    function buscarSolucion(personasActuales, pagosActuales) {

        // Buscamos la primera persona que todavía tenga saldo
        let indice = -1;

        for (let i = 0; i < personasActuales.length; i++) {

            if (personasActuales[i].saldo !== 0) {
                indice = i;
                break;
            }
        }


        // Si todos están a cero, hemos encontrado una solución
        if (indice === -1) {

            if (
                mejorSolucion === null ||
                pagosActuales.length < mejorSolucion.length
            ) {
                mejorSolucion = [...pagosActuales];
            }

            return;
        }


        // Si ya llevamos más pagos que la mejor solución,
        // no merece la pena seguir por este camino
        if (
            mejorSolucion !== null &&
            pagosActuales.length >= mejorSolucion.length
        ) {
            return;
        }


        const personaA = personasActuales[indice];


        // Probamos a compensarla con todas las personas
        // que tengan saldo del signo contrario
        for (
            let j = indice + 1;
            j < personasActuales.length;
            j++
        ) {

            const personaB = personasActuales[j];

            if (
                personaA.saldo === 0 ||
                personaB.saldo === 0 ||
                personaA.saldo * personaB.saldo > 0
            ) {
                continue;
            }


            const nuevasPersonas =
                personasActuales.map(function (persona) {

                    return {
                        usuario: persona.usuario,
                        saldo: persona.saldo
                    };
                });


            const a = nuevasPersonas[indice];
            const b = nuevasPersonas[j];

            const cantidad =
                Math.min(
                    Math.abs(a.saldo),
                    Math.abs(b.saldo)
                );


            let pago;

            // A debe dinero y B debe recibirlo
            if (a.saldo < 0) {

                pago = {
                    de: a.usuario,
                    a: b.usuario,
                    cantidad: cantidad / 100
                };

                a.saldo += cantidad;
                b.saldo -= cantidad;

            }

            // B debe dinero y A debe recibirlo
            else {

                pago = {
                    de: b.usuario,
                    a: a.usuario,
                    cantidad: cantidad / 100
                };

                b.saldo += cantidad;
                a.saldo -= cantidad;
            }


            buscarSolucion(
                nuevasPersonas,
                [...pagosActuales, pago]
            );
        }
    }


    buscarSolucion(personas, []);

    return mejorSolucion || [];
}

// CASO DE OLVIDÓN

function obtenerViajesOlvidon(ciclo) {

    return ciclo.viajes.filter(function (viaje) {

        const usuariosViaje =
            viaje.usuarios ||
            (viaje.usuario ? [viaje.usuario] : []);

        return (
            usuariosViaje.length === 1 &&
            usuariosViaje[0] === "Olvidón"
        );
    });
}
function mostrarPendientesDelCiclo(ciclo) {

    // Limpiamos la lista por si ya había algo mostrado
    listaPendientes.innerHTML = "";

    // Recorremos todos los viajes de Olvidón del ciclo
    ciclo.viajesOlvidon.forEach(function (viaje) {

        // Creamos un bloque para este viaje
        const bloque = document.createElement("div");

        bloque.innerHTML =
            "<p>" +
            formatearFecha(viaje.fecha) +
            " - " +
            viaje.distancia +
            " km (" +
            viaje.kmInicial +
            " → " +
            viaje.kmFinal +
            ")" +
            "</p>" +

            "<select class='selectorPendiente'>" +
                "<option value=''>Seleccionar usuario</option>" +
                "<option value='Vega'>Vega</option>" +
                "<option value='Félix'>Félix</option>" +
                "<option value='Estíbaliz'>Estíbaliz</option>" +
                "<option value='Mario'>Mario</option>" +
            "</select>" +

            "<button class='asignarPendiente'>" +
                "Asignar" +
            "</button>";

        listaPendientes.appendChild(bloque);


        // Buscamos dentro de ESTE bloque
        // su selector y su botón
        const selector =
            bloque.querySelector(".selectorPendiente");

        const botonAsignar =
            bloque.querySelector(".asignarPendiente");


        // Cuando pulsamos Asignar...
        botonAsignar.addEventListener("click", async function () {

            const usuario = selector.value;

            // Si no se ha elegido usuario, no hacemos nada
            if (usuario === "") {
                return;
            }


            // Buscamos este viaje dentro del array general de viajes
            const indiceViaje =
                viajes.indexOf(viaje);

            if (indiceViaje === -1) {
                return;
            }


            await reasignarViajeEnSupabase(
            viaje.id,
            usuario
             );

            await cargarViajesDesdeSupabase();

            // Volvemos a calcular TODOS los ciclos
            const ciclosActualizados =
                obtenerCiclos();


            // Buscamos de nuevo este mismo ciclo
            const cicloActualizado =
                ciclosActualizados.find(function (c) {

                    return (
                        c.kmInicio === ciclo.kmInicio &&
                        c.kmFin === ciclo.kmFin
                    );
                });


            // Si todavía quedan viajes de Olvidón...
            if (
                cicloActualizado &&
                cicloActualizado.estado === "pendiente"
            ) {

                mostrarPendientesDelCiclo(
                    cicloActualizado
                );

            } else {

                panelPendientes.className =
                    "aviso-oculto";

                document.getElementById("resultado").textContent =
                    "✅ Todos los kilómetros del ciclo están asignados.";

                mostrarResumenCiclo(cicloActualizado);
            }
        });
    });


    // Mostramos el modal
    panelPendientes.className =
        "aviso-visible";
}
cerrarPendientes.addEventListener("click", function () {

    panelPendientes.className =
        "aviso-oculto";

});
function mostrarResumenCiclo(ciclo) {

    contenidoResumenCiclo.innerHTML = "";

    // =========================
    // CICLO PENDIENTE
    // =========================

    if (ciclo.estado === "pendiente") {

        contenidoResumenCiclo.innerHTML =
            "<p>⚠️ Este ciclo tiene kilómetros pendientes de asignar.</p>";

        return;
    }


    // =========================
    // CABECERA DEL CICLO
    // =========================

    const titulo = document.createElement("h3");

    titulo.textContent =
        "Ciclo " +
        ciclo.kmInicio +
        " → " +
        ciclo.kmFin +
        " km";

    contenidoResumenCiclo.appendChild(titulo);


    const resumenGeneral = document.createElement("p");

    resumenGeneral.textContent =
        "Kilómetros totales: " +
        ciclo.kmTotales +
        " km | Coste total: " +
        ciclo.costeTotal.toFixed(2) +
        " €";

    contenidoResumenCiclo.appendChild(resumenGeneral);


    // =========================
    // DATOS POR USUARIO
    // =========================

    const tituloUsuarios =
        document.createElement("h3");

    tituloUsuarios.textContent =
        "Reparto por usuario";

    contenidoResumenCiclo.appendChild(
        tituloUsuarios
    );


    const tabla =
        document.createElement("table");


    // CABECERA

    const cabecera =
        document.createElement("tr");

    cabecera.innerHTML =
        "<th>Usuario</th>" +
        "<th>Km</th>" +
        "<th>Uso</th>" +
        "<th>Le corresponde</th>" +
        "<th>Ha pagado</th>" +
        "<th>Saldo</th>";

    tabla.appendChild(cabecera);


    const usuarios = [
        "Vega",
        "Félix",
        "Estíbaliz",
        "Mario"
    ];


    usuarios.forEach(function (usuario) {

        const fila =
            document.createElement("tr");

        const km =
            ciclo.kmPorUsuario[usuario];

        const porcentaje =
            ciclo.porcentajePorUsuario[usuario] * 100;

        const coste =
            ciclo.costePorUsuario[usuario];

        const pagado =
            ciclo.pagadoPorUsuario[usuario];

        const saldo =
            ciclo.saldoPorUsuario[usuario];

        let claseSaldo = "";

                if (saldo > 0) {
                    claseSaldo = "saldoPositivo";
                } else if (saldo < 0) {
                    claseSaldo = "saldoNegativo";
                }

        fila.innerHTML =
            "<td>" + usuario + "</td>" +
            "<td>" + km.toFixed(1) + " km</td>" +
            "<td>" + porcentaje.toFixed(1) + " %</td>" +
            "<td>" + coste.toFixed(2) + " €</td>" +
            "<td>" + pagado.toFixed(2) + " €</td>" +
            "<td class='" + claseSaldo + "'>" +
                saldo.toFixed(2) +
                " €</td>";


        tabla.appendChild(fila);
    });


    contenidoResumenCiclo.appendChild(tabla);


// =========================
// PAGOS FINALES
// =========================

const tituloPagos =
    document.createElement("h3");

tituloPagos.textContent =
    "Pagos";

contenidoResumenCiclo.appendChild(
    tituloPagos
);


// Si no hay transferencias necesarias
if (ciclo.pagos.length === 0) {

    const mensaje =
        document.createElement("p");

    mensaje.textContent =
        "✅ No hay pagos pendientes.";

    contenidoResumenCiclo.appendChild(
        mensaje
    );

    return;
}


// =========================
// ESTADO GENERAL
// =========================

const estadoPagos =
    document.createElement("p");


if (cicloEstaLiquidado(ciclo)) {

    estadoPagos.textContent =
        "✅ Ciclo completamente liquidado";

} else {

    const realizados =
        ciclo.pagos.filter(
            function (pago) {

                return pagoEstaRealizado(
                    ciclo,
                    pago
                );
            }
        ).length;


    estadoPagos.textContent =
        realizados +
        " de " +
        ciclo.pagos.length +
        " pagos realizados";
}


contenidoResumenCiclo.appendChild(
    estadoPagos
);


// =========================
// LISTA DE PAGOS
// =========================

const lista =
    document.createElement("div");


ciclo.pagos.forEach(
    function (pago) {

        const fila =
            document.createElement("div");


        const casilla =
            document.createElement("input");

        casilla.type =
            "checkbox";


        casilla.checked =
            pagoEstaRealizado(
                ciclo,
                pago
            );


        const texto =
            document.createElement("span");

        texto.textContent =
            pago.de +
            " paga " +
            pago.cantidad.toFixed(2) +
            " € a " +
            pago.a;


        casilla.addEventListener(
    "change",
    async function () {

        const claveCiclo =
            obtenerClaveCiclo(ciclo);

        const clavePago =
            obtenerClavePago(pago);


        // MARCAR COMO PAGADO
        if (casilla.checked) {

            const { error } =
                await supabaseClient
                    .from("pagos_realizados")
                    .insert({
                        clave_ciclo: claveCiclo,
                        clave_pago: clavePago
                    });

            if (error) {

                console.log(
                    "Error guardando pago realizado:",
                    error
                );

                return;
            }
        }


        // DESMARCAR PAGO
        else {

            const { error } =
                await supabaseClient
                    .from("pagos_realizados")
                    .delete()
                    .eq(
                        "clave_ciclo",
                        claveCiclo
                    )
                    .eq(
                        "clave_pago",
                        clavePago
                    );

            if (error) {

                console.log(
                    "Error eliminando pago realizado:",
                    error
                );

                return;
            }
        }


        // Volvemos a leer Supabase
        await cargarPagosRealizadosDesdeSupabase();
    }
);


        fila.appendChild(
            casilla
        );

        fila.appendChild(
            texto
        );

        lista.appendChild(
            fila
        );
    }
);


contenidoResumenCiclo.appendChild(
    lista
);
}
function mostrarHistorialCiclos() {

    listaCiclos.innerHTML = "";

    const ciclos = obtenerCiclos();


    // Si todavía no hay ciclos
    if (ciclos.length === 0) {

        listaCiclos.textContent =
            "Todavía no hay ciclos cerrados.";

        return;
    }


    // Recorremos todos los ciclos
    ciclos.forEach(function (ciclo) {

        const bloque =
            document.createElement("div");


        // Título del ciclo
        const titulo =
            document.createElement("h3");

        titulo.textContent =
            "Ciclo " +
            ciclo.kmInicio +
            " → " +
            ciclo.kmFin +
            " km";


        // Información básica
        // Información básica
const datos =
    document.createElement("p");

let textoPagos;


if (ciclo.pagos.length === 0) {

    textoPagos =
        "No requiere pagos";

} else {

    const pagosHechos =
        ciclo.pagos.filter(
            function (pago) {

                return pagoEstaRealizado(
                    ciclo,
                    pago
                );
            }
        ).length;


    if (pagosHechos === ciclo.pagos.length) {

        textoPagos =
            "Liquidado";

    } else {

        textoPagos =
            pagosHechos +
            " de " +
            ciclo.pagos.length +
            " pagos realizados";
    }
}


datos.textContent =
    "Coste total: " +
    ciclo.costeTotal.toFixed(2) +
    " € | Estado: " +
    ciclo.estado +
    " | Pagos: " +
    textoPagos;


        // Botón para ver el detalle
        const botonVer =
            document.createElement("button");

        botonVer.textContent =
            "Ver detalle";


        botonVer.addEventListener(
            "click",
            function () {

                mostrarResumenCiclo(
                    ciclo
                );

                // Nos lleva visualmente al resumen
                document
                    .getElementById("resumenCiclo")
                    .scrollIntoView({
                        behavior: "smooth"
                    });
            }
        );


        bloque.appendChild(titulo);
        bloque.appendChild(datos);
        bloque.appendChild(botonVer);

        listaCiclos.appendChild(
            bloque
        );
    });
}

function revisarUltimoCiclo() {

    const ciclos = obtenerCiclos();

    if (ciclos.length === 0) {

        contenidoResumenCiclo.innerHTML =
            "Todavía no hay ningún ciclo cerrado.";

        return;
    }

    const ultimoCiclo =
        ciclos[ciclos.length - 1];

    mostrarResumenCiclo(
        ultimoCiclo
    );

    if (ultimoCiclo.estado === "pendiente") {

        mostrarPendientesDelCiclo(
            ultimoCiclo
        );
    }
}

revisarUltimoCiclo();

async function probarLecturaSupabase() {

    const { data, error } =
        await supabaseClient
            .from("repostajes")
            .select("*");

    if (error) {

        console.log(
            "Error leyendo Supabase:",
            error
        );

        return;
    }

    console.log(
        "Datos de Supabase:",
        data
    );
}
async function guardarRepostajeEnSupabase(repostaje) {

    const { error } =
        await supabaseClient
            .from("repostajes")
            .insert({
                fecha: repostaje.fecha,
                pagador: repostaje.pagador,
                importe: repostaje.importe,
                litros: repostaje.litros,
                km: repostaje.km,
                tipo: repostaje.tipo
            });


    if (error) {

        console.log(
            "Error guardando repostaje en Supabase:",
            error
        );

        return;
    }


    console.log(
        "Repostaje guardado correctamente en Supabase"
    );
}
async function cargarRepostajesDesdeSupabase() {

    const { data, error } =
        await supabaseClient
            .from("repostajes")
            .select("*")
            .order("km", {
                ascending: true
            });


    if (error) {

        console.log(
            "Error cargando repostajes:",
            error
        );

        return;
    }


    repostajes =
    data.map(function (repostaje) {

        return {
            id: repostaje.id,

            pagador: repostaje.pagador,
            importe: Number(repostaje.importe),
            km: repostaje.km,
            fecha: repostaje.fecha,
            litros: Number(repostaje.litros),

            precioLitro:
                Number(repostaje.importe) /
                Number(repostaje.litros),

            tipo: repostaje.tipo
        };
    });

    mostrarRepostajes();

    console.log(
        "Repostajes cargados desde Supabase:",
        repostajes
    );
}
async function guardarViajeEnSupabase(viaje) {

    // =========================
    // 1. GUARDAMOS EL VIAJE
    // =========================

    const { data, error } =
        await supabaseClient
            .from("viajes")
            .insert({
                km_inicial: viaje.kmInicial,
                km_final: viaje.kmFinal,
                distancia: viaje.distancia,
                fecha: viaje.fecha || null
            })
            .select();


    if (error) {

        console.log(
            "Error guardando viaje:",
            error
        );

        return;
    }


    // El viaje recién creado
    const viajeCreado =
        data[0];

    const viajeId =
        viajeCreado.id;


    // =========================
    // 2. GUARDAMOS LOS USUARIOS
    // =========================

    const usuariosViaje =
        viaje.usuarios ||
        (
            viaje.usuario
                ? [viaje.usuario]
                : []
        );


    const filasUsuarios =
        usuariosViaje.map(
            function (usuario) {

                return {
                    viaje_id: viajeId,
                    usuario: usuario
                };
            }
        );


    const { error: errorUsuarios } =
        await supabaseClient
            .from("viaje_usuarios")
            .insert(filasUsuarios);


    if (errorUsuarios) {

        console.log(
            "Error guardando usuarios del viaje:",
            errorUsuarios
        );

        return;
    }


    console.log(
        "Viaje guardado correctamente en Supabase"
    );
}
async function cargarViajesDesdeSupabase() {

    const { data, error } =
        await supabaseClient
            .from("viajes")
            .select(`
                id,
                km_inicial,
                km_final,
                distancia,
                fecha,
                viaje_usuarios (
                    usuario
                )
            `)
            .order("km_inicial", {
                ascending: true
            });


    if (error) {

        console.log(
            "Error cargando viajes:",
            error
        );

        return;
    }


    viajes =
        data.map(function (viaje) {

            const usuarios =
                viaje.viaje_usuarios.map(
                    function (fila) {
                        return fila.usuario;
                    }
                );


            return {
                id: viaje.id,

                usuarios: usuarios,

                kmInicial:
                    viaje.km_inicial,

                kmFinal:
                    viaje.km_final,

                distancia:
                    viaje.distancia,

                fecha:
                    viaje.fecha
            };
        });


    mostrarViajes();
    rellenarKmInicial();

    console.log(
        "Viajes cargados desde Supabase:",
        viajes
    );
}
async function eliminarViajeDeSupabase(id) {

    // Primero borramos los usuarios asociados
    const { error: errorUsuarios } =
        await supabaseClient
            .from("viaje_usuarios")
            .delete()
            .eq("viaje_id", id);

    if (errorUsuarios) {

        console.log(
            "Error eliminando usuarios del viaje:",
            errorUsuarios
        );

        return;
    }


    // Después borramos el viaje
    const { error: errorViaje } =
        await supabaseClient
            .from("viajes")
            .delete()
            .eq("id", id);

    if (errorViaje) {

        console.log(
            "Error eliminando viaje:",
            errorViaje
        );

        return;
    }


    console.log(
        "Viaje eliminado correctamente"
    );


    // Recargamos desde Supabase
    await cargarViajesDesdeSupabase();
}
async function reemplazarViajeEnSupabase(
    viajeOriginalId,
    nuevosViajes
) {

    // 1. Borramos los usuarios del viaje original
    const { error: errorUsuarios } =
        await supabaseClient
            .from("viaje_usuarios")
            .delete()
            .eq("viaje_id", viajeOriginalId);

    if (errorUsuarios) {

        console.log(
            "Error borrando usuarios del viaje original:",
            errorUsuarios
        );

        return;
    }


    // 2. Borramos el viaje original
    const { error: errorViaje } =
        await supabaseClient
            .from("viajes")
            .delete()
            .eq("id", viajeOriginalId);

    if (errorViaje) {

        console.log(
            "Error borrando viaje original:",
            errorViaje
        );

        return;
    }


    // 3. Guardamos los nuevos tramos
    for (const nuevoViaje of nuevosViajes) {

        await guardarViajeEnSupabase(
            nuevoViaje
        );
    }


    // 4. Recargamos UNA SOLA VEZ al terminar
    await cargarViajesDesdeSupabase();


    console.log(
        "Viaje editado correctamente en Supabase"
    );
}
async function cargarPagosRealizadosDesdeSupabase() {

    const { data, error } =
        await supabaseClient
            .from("pagos_realizados")
            .select("*");

    if (error) {
        console.log(
            "Error cargando pagos realizados:",
            error
        );
        return;
    }

    pagosRealizados = {};

    data.forEach(function (fila) {

        if (!pagosRealizados[fila.clave_ciclo]) {
            pagosRealizados[fila.clave_ciclo] = [];
        }

        pagosRealizados[
            fila.clave_ciclo
        ].push(
            fila.clave_pago
        );
    });
}

async function eliminarRepostajeDeSupabase(id) {

    const { error } =
        await supabaseClient
            .from("repostajes")
            .delete()
            .eq("id", id);

    if (error) {

        console.log(
            "Error eliminando repostaje:",
            error
        );

        return;
    }

    console.log(
        "Repostaje eliminado correctamente"
    );

    await cargarRepostajesDesdeSupabase();
}
async function iniciarApp() {

    await cargarViajesDesdeSupabase();

    await cargarRepostajesDesdeSupabase();

    await cargarPagosRealizadosDesdeSupabase();

    mostrarHistorialCiclos();
    revisarUltimoCiclo();

}
async function reasignarViajeEnSupabase(
    viajeId,
    usuario
) {

    const { error: errorBorrando } =
        await supabaseClient
            .from("viaje_usuarios")
            .delete()
            .eq("viaje_id", viajeId);

    if (errorBorrando) {

        console.log(
            "Error borrando usuario anterior:",
            errorBorrando
        );

        return;
    }

    const { error: errorInsertando } =
        await supabaseClient
            .from("viaje_usuarios")
            .insert({
                viaje_id: viajeId,
                usuario: usuario
            });

    if (errorInsertando) {

        console.log(
            "Error asignando nuevo usuario:",
            errorInsertando
        );

        return;
    }
}

async function comprobarSesion() {

    const { data } =
        await supabaseClient.auth
            .getSession();

    if (data.session) {

        panelLogin.style.display =
            "none";

        appPrincipal.style.display =
            "block";

        await iniciarApp();

    } else {

        panelLogin.style.display =
            "block";

        appPrincipal.style.display =
            "none";
    }
}

comprobarSesion();

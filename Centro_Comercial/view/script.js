let centroComercial = {};

function agregarPiso(nombrePiso, locales) {
    centroComercial[nombrePiso] = locales;
}

async function cargarDatosDesdeBD() {
    const respuesta = await fetch("/locales");
    const filas = await respuesta.json();

    centroComercial = {};

    for (let i = 0; i < filas.length; i++) {
        let fila = filas[i];
        if (!centroComercial[fila.piso]) {
            agregarPiso(fila.piso, []);
        }
        centroComercial[fila.piso].push([
            fila.id_local,
            fila.nombre,
            Number(fila.total_vendido)
        ]);
    }

    crearLocales();
    actualizarAdmin();
}

function crearLocales() {
    const contenedor = document.getElementById("contenedor-pisos");
    contenedor.innerHTML = "";

    for (const [piso, locales] of Object.entries(centroComercial)) {
        let htmlPiso = `<h5 class="mt-4 mb-2 fw-bold">${piso}</h5><div class="row g-3">`;
        for (let i = 0; i < locales.length; i++) {

            let local = locales[i];
            let id = local[0];
            let nombre = local[1];
            let total = local[2];
            htmlPiso += `
                <div class="col-md-2">
                    <div class="card-local" id="${id}">
                        <span class="badge bg-secondary mb-1">ID: ${id}</span>
                        <h6>${nombre}</h6>
                        <input type="text" id="input-${id}" class="form-control form-control-sm my-2" placeholder="Venta $">
                        <button class="btn btn-sm btn-success w-100 mb-2" onclick="vender('${piso}', ${i})">Sumar Venta</button>
                        <div class="small fw-bold">Total: $${total}</div>
                    </div>
                </div>
            `;
        }

        htmlPiso += `</div>`;
        contenedor.innerHTML += htmlPiso;
    }
}

async function vender(piso, indiceLocal) {
    let local = centroComercial[piso][indiceLocal];
    let id = local[0];

    let input = document.getElementById("input-" + id);
    let valorVenta = Number(input.value);

    if (valorVenta > 0) {
        await fetch("vender", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_local: id, venta: valorVenta })
        });

        await cargarDatosDesdeBD();
    } else {
        alert("Ingresa un valor válido");
    }
}

function actualizarAdmin() {
    if (!centroComercial["Piso 1"]) return;

    let totalCC = 0;

    let primerLocal = centroComercial["Piso 1"][0];
    let mayorVenta = primerLocal[2];
    let menorVenta = primerLocal[2];
    let nombreMayor = `Piso 1 - ${primerLocal[1]} con $${primerLocal[2]}`;
    let nombreMenor = `Piso 1 - ${primerLocal[1]} con $${primerLocal[2]}`;

    for (const [piso, locales] of Object.entries(centroComercial)) {
        for (let i = 0; i < locales.length; i++) {
            let local = locales[i];
            let nombre = local[1];
            let venta = local[2];

            totalCC += venta;

            if (venta > mayorVenta) {
                mayorVenta = venta;
                nombreMayor = `${piso} - ${nombre} con $${venta}`;
            }

            if (venta < menorVenta) {
                menorVenta = venta;
                nombreMenor = `${piso} - ${nombre} con $${venta}`;
            }
        }
    }

    document.getElementById("total-cc").textContent = "$" + totalCC;
    document.getElementById("mayor-local").textContent = nombreMayor;
    document.getElementById("menor-local").textContent = nombreMenor;
}

function buscarPorId() {
    let idBuscado = document.getElementById("input-id-buscar").value.toUpperCase().trim();
    let resultado = document.getElementById("resultado-busqueda");

    for (const [piso, locales] of Object.entries(centroComercial)) {
        for (let i = 0; i < locales.length; i++) {
            let local = locales[i];

            if (local[0] === idBuscado) {
                resultado.textContent = `Encontrado: ${piso}, ${local[1]} | Total vendido: $${local[2]}`;
                return;
            }
        }
    }

    resultado.textContent = "No existe ningún local con ese ID.";
}

function mostrarPagina(pagina) {
    if (pagina === 'ventas') {
        document.getElementById("pagina-ventas").classList.remove("d-none");
        document.getElementById("pagina-admin").classList.add("d-none");
    } else {
        actualizarAdmin();
        document.getElementById("pagina-ventas").classList.add("d-none");
        document.getElementById("pagina-admin").classList.remove("d-none");
    }
}

cargarDatosDesdeBD();

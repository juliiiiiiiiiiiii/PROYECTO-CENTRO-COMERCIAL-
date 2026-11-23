const express = require("express");
const mysql = require("mysql2");
const app = express();

let conexion = mysql.createConnection({
    host: "localhost",
    database: "centro_comercial",
    user: "root",
    password: "JAS2026-3" 
});

conexion.connect(function(error) {
    if (error) {
        console.log("Error conectando a MySQL:", error);
    } else {
        console.log("Conectado a MySQL correctamente");
    }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("view"));

app.get("/locales", function(req, res) {
    let buscar = `
        SELECT locales.id_local, pisos.nombre_piso AS piso, locales.nombre, locales.total_vendido 
        FROM locales 
        INNER JOIN pisos ON locales.id_piso = pisos.id_piso
        ORDER BY pisos.id_piso ASC, locales.id_local ASC
    `;

    conexion.query(buscar, function(error, rows) {
        if (error) {
            throw error;
        } else {
            res.json(rows);
        }
    });
});

app.post("/vender", function(req, res) {
    const dato = req.body;
    let idLocal = dato.id_local;
    let valorVenta = Number(dato.venta);

    if (valorVenta > 0) {
        let actualizar = "UPDATE locales SET total_vendido = total_vendido + ? WHERE id_local = ?";

        conexion.query(actualizar, [valorVenta, idLocal], function(error) {
            if (error) {
                throw error;
            } else {
                console.log("Venta registrada en BD para:", idLocal);
                res.json({ ok: true });
            }
        });
    } else {
        res.json({ ok: false });
    }
});

app.listen(3000, function() {
    console.log("Servidor creado http://localhost:3000");
});

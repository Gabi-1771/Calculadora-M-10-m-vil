const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors'); // 1. Importamos CORS
const path = require('path');  // Importamos path para manejar las rutas de carpetas

const app = express();
const PORT = 3000;

// 2. Activamos CORS para evitar cualquier bloqueo de seguridad en el navegador
app.use(cors());

// --- CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS Y RUTA PRINCIPAL ---

// Compartimos la carpeta raíz para que el navegador encuentre el manifest.json y el icono.png
app.use(express.static(__dirname));

// Compartimos de forma explícita tus carpetas de estilos, HTML y scripts
app.use('/HTML', express.static(path.join(__dirname, 'HTML')));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));

// Ruta raíz: Cuando entres a http://localhost:3000 te cargará directamente la app
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'HTML', 'index.html'));
});

// -----------------------------------------------------------

// Tu ruta de la API para raspar los horarios del Consorcio
app.get('/api/horarios', async (req, res) => {
    try {
        const url = 'https://siu.cmtbc.es/movil/horarios_lineas_tabla.php?linea=2';
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        let horariosIda = [];

        $('table tr').each((index, element) => {
            let fila = [];
            $(element).find('td').each((i, td) => {
                fila.push($(td).text().trim());
            });
            
            if (fila.length >= 8 && fila.length <= 10) {
                if (fila[0].includes(':')) {
                    horariosIda.push({
                        pzEspana: fila[0],
                        pzSevilla: fila[1],
                        asdrubal: fila[2],
                        hospitalCadiz: fila[3],
                        estadio: fila[4],
                        stoEntierro: fila[5],
                        leonHerrero: fila[6],
                        hospitalSanCarlos: fila[7],
                        dias: fila[8] || "L-V"
                    });
                }
            }
        });

        res.json({ ida: horariosIda });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Hubo un error al obtener los horarios del Consorcio.' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 El backend está listo y escuchando en http://localhost:${PORT}`);
});
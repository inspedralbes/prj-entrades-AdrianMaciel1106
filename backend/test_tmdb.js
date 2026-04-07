import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configurar dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_KEY = process.env.TMDB_API_KEY;

async function testTMDB() {
    console.log('--- Probando conexión con TMDB para FlowPass ---');
    console.log('API Key cargada:', API_KEY ? 'SÍ ✅' : 'NO ❌');

    if (!API_KEY) {
        console.error('Error: No se encontró la API Key en el archivo .env');
        return;
    }

    try {
        // Probamos buscando una película popular
        const response = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`);
        const data = await response.json();

        if (data.status_code) {
           console.error('Error de TMDB:', data.status_message);
           return;
        }

        console.log('\n--- Resultado de la prueba ---');
        console.log(`Películas encontradas: ${data.results.length}`);
        console.log('Primera película de la lista:');
        console.log('- Título:', data.results[0].title);
        console.log('- Resumen:', data.results[0].overview.substring(0, 100) + '...');
        console.log('- Poster URL:', `https://image.tmdb.org/t/p/w500${data.results[0].poster_path}`);
        console.log('\n¡Conexión exitosa! 🚀');

    } catch (error) {
        console.error('Error al conectar con la API:', error.message);
    }
}

testTMDB();

/**
 * movie.service.js
 * ────────────────
 * Service to interact with the TMDb API and provide movie data.
 * Fallback to high-quality mock data if API_KEY is missing.
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

async function getNowPlayingMovies() {
  const apiKey = process.env.TMDB_API_KEY;
  
  if (!apiKey) {
    console.log('[movie-service] No TMDB_API_KEY found, using mock data.');
    return getMockMovies();
  }

  try {
    const res = await fetch(`${TMDB_API_BASE}/movie/now_playing?api_key=${apiKey}&language=ca-ES`);
    const data = await res.json();
    
    return data.results.map(movie => ({
      id: movie.id.toString(),
      nom: movie.title,
      data: movie.release_date,
      lloc: 'Sala 1 - Cinema Pedralbes',
      imatge: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : '/images/default.png',
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : '',
      sinopsi: movie.overview,
      rating: movie.vote_average
    }));
  } catch (err) {
    console.error('[movie-service] Error fetching from TMDB:', err);
    return getMockMovies();
  }
}

function getMockMovies() {
  return [
    {
      id: '101',
      nom: 'Dune: Part Two',
      data: '2024-03-01',
      lloc: 'Sala 1 - VIP',
      imatge: 'https://image.tmdb.org/t/p/w500/8u99hTN8BM4o97o9C1mJvQv7A1.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/m9Y7idH3Z6X0X8vBvBvBvBvBvBv.jpg',
      sinopsi: "Paul Atreides s'uneix a Chani i als Fremen mentre busca venjança contra els conspiradors que van destruir la seva família.",
      rating: 8.3
    },
    {
      id: '102',
      nom: 'Oppenheimer',
      data: '2023-07-21',
      lloc: 'Sala 2 - IMAX',
      imatge: 'https://image.tmdb.org/t/p/w500/8GxvPruYm0tEKvM9I1SvS3S9S9.jpg',
      backdrop: 'https://image.tmdb.org/t/p/original/nb34789vBvBvBvBvBvBvBvBvB.jpg',
      sinopsi: "La història del físic nord-americà J. Robert Oppenheimer i el seu paper en el projecte Manhattan.",
      rating: 8.1
    },
    {
      id: '103',
      nom: 'Pobres Criatures',
      data: '2024-01-26',
      lloc: 'Sala 3 - VOSE',
      imatge: 'https://image.tmdb.org/t/p/w500/k987654321.jpg', // Placeholder URLs
      backdrop: '',
      sinopsi: "La història increïble i l'evolució fantàstica de Bella Baxter, una jove que torna a la vida gràcies a un científic brillant i poc ortodox.",
      rating: 7.9
    }
  ];
}

module.exports = {
  getNowPlayingMovies
};

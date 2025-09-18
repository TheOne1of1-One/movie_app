import React, { useEffect, useState } from 'react';
import Search from './components/search.jsx';
import Spinner from './components/spinner.jsx';
import MovieCard from './components/moviecard.jsx';
import MovieModal from './components/moviemodal.jsx'; 
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCOunt } from './appwrite.js';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMovie, setSelectedMovie] = useState(null); 

  // Debounce search term input to limit API calls
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = '', pageNum = 1) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('Failed to fetch movies');
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        setTotalPages(1);
        return;
      }

      setMovieList(data.results || []);
      setTotalPages(data.total_pages || 1);

      if (query && data.results.length > 0) {
        await updateSearchCOunt(query, data.results[0]);
      }

    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Failed to fetch movies. Please try again later.');
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

  // Reset page to 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  // Fetch movies when search term or page changes
  useEffect(() => {
    fetchMovies(debouncedSearchTerm, page);
  }, [debouncedSearchTerm, page]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

 return (
    <main>
      <div className="pattern" />
      <div className="wrapper">
        <header>
              <img src={`${import.meta.env.BASE_URL}movie-poster.jpg`} alt="Hero Banner" />
              <h1>
                Find <span className="text-gradient"> Movies and Animes</span> Here!
              </h1>
              <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt="Title" />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>
          {isLoading ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                <li key={movie.id} onClick={() => setSelectedMovie(movie)} className="cursor-pointer">
                  <MovieCard movie={movie} />
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-center gap-4 mt-6">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous Page
            </button>
            <span className="self-center text-white">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next Page
            </button>
          </div>
        </section>
      </div>
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
      )}
    </main>
  )
}

export default App
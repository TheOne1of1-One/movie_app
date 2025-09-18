import React, { useEffect, useState } from "react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMBD_API_KEY;
const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const MovieModal = ({ movie, onClose }) => {
  const [details, setDetails] = useState(null);
  const [trailer, setTrailer] = useState(null);

  useEffect(() => {
    if (!movie) return;

    // Fetch movie details (for genres, overview, etc.)
    fetch(`${API_BASE_URL}/movie/${movie.id}`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => setDetails(data));

    // Fetch trailer (YouTube)
    fetch(`${API_BASE_URL}/movie/${movie.id}/videos`, API_OPTIONS)
      .then((res) => res.json())
      .then((data) => {
        const yt = data.results?.find(
          (v) => v.site === "YouTube" && v.type === "Trailer"
        );
        setTrailer(yt);
      });
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-lg w-full relative shadow-lg">
        <button
          className="absolute top-2 right-2 text-2xl text-gray-700 dark:text-gray-200"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        <div className="flex flex-col items-center">
          <img
            src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
            alt={movie.title}
            className="rounded-lg w-40 mb-4"
          />
          <h2 className="text-2xl font-bold mb-2 text-center">{movie.title}</h2>
          <p className="mb-2 text-gray-700 dark:text-gray-200">
            <span className="font-semibold">Release Date:</span>{" "}
            {details?.release_date || movie.release_date}
          </p>
          <p className="mb-2 text-gray-700 dark:text-gray-200">
            <span className="font-semibold">Rating:</span> {movie.vote_average}
          </p>
          <p className="mb-2 text-gray-700 dark:text-gray-200">
            <span className="font-semibold">Genres:</span>{" "}
            {details?.genres?.map((g) => g.name).join(", ") || "N/A"}
          </p>
          <p className="mb-4 text-gray-700 dark:text-gray-200 text-center">
            {details?.overview || movie.overview}
          </p>
          {trailer && (
            <div className="w-full aspect-video mb-2">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title="Trailer"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
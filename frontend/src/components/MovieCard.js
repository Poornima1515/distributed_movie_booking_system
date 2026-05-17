import React from 'react';

import { useNavigate } from 'react-router-dom';

function MovieCard({ movie }) {

  const navigate = useNavigate();

  return (

    <div
      className="bg-slate-800 rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition cursor-pointer"
      onClick={() => navigate(`/movie/${movie._id}`)}
    >

      <img
        src={movie.image}
        alt="movie"
        className="h-80 w-full object-cover"
      />

      <div className="p-4">

        <h2 className="text-2xl font-bold text-white">
          {movie.title}
        </h2>

        <p className="text-gray-300 mt-2">
          {movie.language}
        </p>

      </div>

    </div>

  );

}

export default MovieCard;
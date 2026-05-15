import React, {

  useEffect,

  useState

} from 'react';
import Navbar from '../components/Navbar';
import {

  useParams,

  useNavigate

} from 'react-router-dom';

import API from '../api';

function MovieDetails() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [movie, setMovie] =
    useState(null);

  const [shows, setShows] =
    useState([]);

  useEffect(() => {

    fetchMovie();

    fetchShows();

  }, []);

  const fetchMovie = async () => {

    try {

      const res =
        await API.get('/movies');

      const selectedMovie =
        res.data.find(
          (m) => m._id === id
        );

      setMovie(selectedMovie);

    } catch (error) {

      console.log(error);

    }

  };

  const fetchShows = async () => {

    try {

      const res =
        await API.get('/admin/shows');

      const filteredShows =
        res.data.filter(
          (show) =>
            show.movie?._id === id
        );

      setShows(filteredShows);

    } catch (error) {

      console.log(error);

    }

  };

  if (!movie) {

    return (
      <h1 style={{
        color: 'white'
      }}>
        Loading...
      </h1>
    );

  }

  return (
<>
  <Navbar />
    <div
      style={{
        background: '#0f172a',
        minHeight: '100vh',
        color: 'white',
        padding: '30px'
      }}
    >

      <div
        style={{
          display: 'flex',
          gap: '30px',
          marginBottom: '40px'
        }}
      >

        <img
          src={
  movie.poster ||

  "https://via.placeholder.com/300x450?text=Movie+Poster"
}
          alt={movie.title}
          style={{
            width: '300px',
            borderRadius: '20px'
          }}
        />

        <div>

          <h1
            style={{
              fontSize: '42px'
            }}
          >
            {movie.title}
          </h1>

          <p>
            ⭐ {movie.rating}
          </p>

          <p>
            {movie.genre}
          </p>

          <p>
            {movie.language}
          </p>

          <p>
            {movie.duration}
          </p>

          <p
            style={{
              marginTop: '20px',
              maxWidth: '600px'
            }}
          >
            {movie.description}
          </p>

        </div>

      </div>

      <h2
        style={{
          marginBottom: '20px'
        }}
      >
        Available Shows
      </h2>

      {

  shows.length === 0

  ? (

    <h3
      style={{
        color: 'gray'
      }}
    >

      No shows available

    </h3>

  )

  : (

    shows.map((show) => (

      <div
        key={show._id}
        style={{
          background: '#1e293b',
          padding: '20px',
          borderRadius: '15px',
          marginBottom: '20px'
        }}
      >

        <h3>
          {show.theatre?.name}
        </h3>

        <p>
          {show.showTime}
        </p>

        <p>
          ₹ {show.price}
        </p>

        <button

          onClick={() =>
            navigate(
              `/seats/${show._id}`
            )
          }

          style={{
            padding: '10px 20px',
            background: '#ff004f',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer'
          }}
        >

          Select Seats

        </button>

      </div>

    ))

  )

}

    </div>
</>
  );

}

export default MovieDetails;
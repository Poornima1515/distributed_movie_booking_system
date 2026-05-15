import React, {

  useEffect,

  useState

} from 'react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

import API from '../api';

function Home() {

  const navigate = useNavigate();

  const [movies, setMovies] =
    useState([]);

  const [search, setSearch] =
    useState('');

  useEffect(() => {

    fetchMovies();

  }, []);

  const fetchMovies = async () => {

    try {

      const res =
        await API.get('/movies');

      setMovies(res.data);

    } catch (error) {

      console.log(error);

    }

  };

  const filteredMovies =
    movies.filter((movie) =>

      movie.title
      .toLowerCase()
      .includes(
        search.toLowerCase()
      )

    );

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
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '40px'
        }}
      >

        <div>

          <h1
            style={{
              color: '#ff004f',
              fontSize: '42px',
              marginBottom: '5px'
            }}
          >
            CineVerse
          </h1>

          <p
            style={{
              color: '#94a3b8'
            }}
          >
            Experience Movies Like Never Before
          </p>

        </div>

        <input

          placeholder="Search Movies..."

          value={search}

          onChange={(e) =>
            setSearch(e.target.value)
          }

          style={{

            padding: '14px',

            width: '300px',

            borderRadius: '12px',

            border: 'none',

            outline: 'none',

            fontSize: '15px'

          }}

        />

      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill,minmax(250px,1fr))',
          gap: '25px'
        }}
      >

        {

          filteredMovies.map((movie) => (

            <div

              key={movie._id}

              style={{

                background: '#1e293b',

                borderRadius: '20px',

                overflow: 'hidden',

                transition: '0.3s',

                boxShadow:
                  '0 0 20px rgba(0,0,0,0.4)'

              }}

            >

              <img

                src={
  movie.poster ||

  "https://via.placeholder.com/300x450?text=Movie+Poster"
}

                alt={movie.title}

                style={{

                  width: '100%',

                  height: '350px',

                  objectFit: 'cover'

                }}

              />

              <div
                style={{
                  padding: '15px'
                }}
              >

                <h2
                  style={{
                    marginBottom: '10px'
                  }}
                >
                  {movie.title}
                </h2>

                <p>
                  🎭 {movie.genre}
                </p>

                <p>
                  🌐 {movie.language}
                </p>

                <p>
                  ⭐ {movie.rating}
                </p>

                <button

                  onClick={() =>
                    navigate(
                      `/movie/${movie._id}`
                    )
                  }

                  style={{

                    width: '100%',

                    padding: '12px',

                    background: '#ff004f',

                    color: 'white',

                    border: 'none',

                    borderRadius: '10px',

                    marginTop: '15px',

                    cursor: 'pointer',

                    fontSize: '16px',

                    fontWeight: 'bold'

                  }}

                >
                  Book Tickets
                </button>

              </div>

            </div>

          ))

        }

      </div>

    </div>
</>
  );

}

export default Home;
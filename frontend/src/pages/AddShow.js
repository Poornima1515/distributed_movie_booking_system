import React, {

  useEffect,

  useState

} from 'react';
import Navbar from '../components/Navbar';
import API from '../api';

function AddShow() {

  const [movies, setMovies] =
    useState([]);

  const [theatres, setTheatres] =
    useState([]);

  const [show, setShow] =
    useState({

      movie: '',

      theatre: '',

      showTime: '',

      price: ''

    });

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      const moviesRes =
        await API.get('/movies');

      const theatresRes =
        await API.get(
          '/admin/theatres'
        );

      setMovies(moviesRes.data);

      setTheatres(
        theatresRes.data
      );

    } catch (error) {

      console.log(error);

    }

  };

  const handleChange = (e) => {

    setShow({

      ...show,

      [e.target.name]:
      e.target.value

    });

  };

  const addShow = async () => {

    try {

      await API.post(

        '/admin/show',

        show

      );

      alert(
        'Show Added Successfully'
      );

    } catch (error) {

      alert(
        error.response?.data?.message
      );

    }

  };

  return (
<>
  <Navbar />
    <div
      style={{
        background: '#0f172a',
        minHeight: '100vh',
        padding: '30px',
        color: 'white'
      }}
    >

      <h1>
        Add Show
      </h1>

      <div
        style={{
          maxWidth: '500px',
          marginTop: '30px'
        }}
      >

        <select

          name="movie"

          onChange={handleChange}

          style={{

            width: '100%',

            padding: '12px',

            marginBottom: '15px'

          }}

        >

          <option>
            Select Movie
          </option>

          {

            movies.map((movie) => (

              <option

                key={movie._id}

                value={movie._id}

              >
                {movie.title}
              </option>

            ))

          }

        </select>

        <select

          name="theatre"

          onChange={handleChange}

          style={{

            width: '100%',

            padding: '12px',

            marginBottom: '15px'

          }}

        >

          <option>
            Select Theatre
          </option>

          {

            theatres.map((theatre) => (

              <option

                key={theatre._id}

                value={theatre._id}

              >
                {theatre.name}
              </option>

            ))

          }

        </select>

        <input

          name="showTime"

          placeholder="Show Time"

          onChange={handleChange}

          style={{

            width: '100%',

            padding: '12px',

            marginBottom: '15px'

          }}

        />

        <input

          name="price"

          placeholder="Price"

          onChange={handleChange}

          style={{

            width: '100%',

            padding: '12px',

            marginBottom: '15px'

          }}

        />

        <button

          onClick={addShow}

          style={{

            width: '100%',

            padding: '15px',

            background: 'red',

            border: 'none',

            borderRadius: '10px',

            color: 'white',

            fontSize: '18px'

          }}

        >
          Add Show
        </button>

      </div>

    </div>
</>
  );

}

export default AddShow;
import React, {

  useState

} from 'react';

import API from '../api';
import Navbar from '../components/Navbar';
function AddMovie() {

  const [movie, setMovie] =
    useState({

      title: '',

      language: '',

      genre: '',

      duration: '',

      rating: '',

      poster: '',

      description: ''

    });

  const handleChange = (e) => {

    setMovie({

      ...movie,

      [e.target.name]:
      e.target.value

    });

  };

  const addMovie = async () => {

    try {

      await API.post(

        '/movies/add',

        movie

      );

      alert(
        'Movie Added Successfully'
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
        Add Movie
      </h1>

      <div
        style={{
          maxWidth: '500px',
          marginTop: '30px'
        }}
      >

        {

          Object.keys(movie).map((key) => (

            <input

              key={key}

              name={key}

              placeholder={key}

              onChange={handleChange}

              style={{

                width: '100%',

                padding: '12px',

                marginBottom: '15px',

                borderRadius: '10px',

                border: 'none'

              }}

            />

          ))

        }

        <button

          onClick={addMovie}

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
          Add Movie
        </button>

      </div>

    </div>
</>
  );

}

export default AddMovie;
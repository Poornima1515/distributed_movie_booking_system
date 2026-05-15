import React, {

  useEffect,

  useState

} from 'react';

import Navbar from '../components/Navbar';

import API from '../api';

import {

  useNavigate

} from 'react-router-dom';

function AdminDashboard() {

  const navigate =
    useNavigate();

  const [movies, setMovies] =
    useState([]);

  const [bookings, setBookings] =
    useState([]);

  const [theatres, setTheatres] =
    useState([]);

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData =
    async () => {

      try {

        const moviesRes =
          await API.get(
            '/movies'
          );

        const bookingsRes =
          await API.get(
            '/bookings'
          );

        const theatresRes =
          await API.get(
            '/admin/theatres'
          );

        setMovies(
          moviesRes.data
        );

        setBookings(
          bookingsRes.data
        );

        setTheatres(
          theatresRes.data
        );

      } catch (error) {

        console.log(error);

      }

    };

  const totalRevenue =
    bookings.reduce(

      (sum, booking) =>

        sum +
        booking.totalAmount,

      0

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

        <h1
          style={{
            marginBottom: '30px'
          }}
        >

          CineVerse Admin Dashboard

        </h1>



        {/* ACTION BUTTONS */}

        <div
          style={{

            display: 'flex',

            gap: '20px',

            marginBottom: '40px'

          }}
        >

          <button

            onClick={() =>
              navigate(
                '/admin/add-movie'
              )
            }

            style={buttonStyle}

          >

            Add Movie

          </button>

          <button

            onClick={() =>
              navigate(
                '/admin/add-show'
              )
            }

            style={buttonStyle}

          >

            Add Show

          </button>

        </div>



        {/* STATS */}

        <div
          style={{

            display: 'grid',

            gridTemplateColumns:
              'repeat(3,1fr)',

            gap: '20px'

          }}
        >

          <div style={cardStyle}>

            <h2>Total Movies</h2>

            <h1>
              {movies.length}
            </h1>

          </div>

          <div style={cardStyle}>

            <h2>Total Bookings</h2>

            <h1>
              {bookings.length}
            </h1>

          </div>

          <div style={cardStyle}>

            <h2>Total Revenue</h2>

            <h1>
              ₹ {totalRevenue}
            </h1>

          </div>

        </div>



        {/* THEATRES */}

        <h2
          style={{
            marginTop: '40px'
          }}
        >

          Theatre List

        </h2>

        {

          theatres.map(

            (theatre) => (

              <div

                key={
                  theatre._id
                }

                style={{

                  background:
                    '#1e293b',

                  padding:
                    '20px',

                  borderRadius:
                    '12px',

                  marginTop:
                    '15px'

                }}

              >

                <h3>
                  {theatre.name}
                </h3>

                <p>
                  {theatre.city}
                </p>

                <p>

                  Screens:
                  {theatre.screens}

                </p>

              </div>

            )

          )

        }

      </div>

    </>

  );

}

const cardStyle = {

  background: '#1e293b',

  padding: '25px',

  borderRadius: '15px'

};

const buttonStyle = {

  padding: '15px 25px',

  background: '#ff004f',

  border: 'none',

  borderRadius: '10px',

  color: 'white',

  fontSize: '16px',

  cursor: 'pointer',

  fontWeight: 'bold'

};

export default AdminDashboard;
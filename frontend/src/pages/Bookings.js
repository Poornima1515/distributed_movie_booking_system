import React, {

  useEffect,

  useState

} from 'react';

import API from '../api';

import Navbar from '../components/Navbar';

function Bookings() {

  const [bookings,
    setBookings] = useState([]);

  const user =

    JSON.parse(
      localStorage.getItem('user')
    );

  useEffect(() => {

    fetchBookings();

  }, []);

  const fetchBookings =
    async () => {

      try {

        const res =
          await API.get(
            '/bookings'
          );

        const myBookings =

          res.data.filter(

            (booking) =>

              booking.user ===
              user._id ||

              booking.user?._id ===
              user._id

          );

        setBookings(
          myBookings
        );

      } catch (error) {

        console.log(error);

      }

    };

  return (

    <>

      <Navbar />

      <div
        style={{

          minHeight: '100vh',

          background: '#0f172a',

          color: 'white',

          padding: '30px'

        }}
      >

        <h1>
          My Bookings
        </h1>

        {

          bookings.length === 0

          ? (

            <h2>
              No bookings found
            </h2>

          )

          : (

            bookings.map(

              (booking) => (

                <div

                  key={
                    booking._id
                  }

                  style={{

                    background:
                      '#1e293b',

                    padding:
                      '20px',

                    borderRadius:
                      '15px',

                    marginTop:
                      '20px'

                  }}

                >

                  <h2>

                    {

                      booking.movie
                      ?.title

                    }

                  </h2>

                  <p>

                    Theatre:

                    {

                      booking.theatre
                      ?.name

                    }

                  </p>

                  <p>

                    Seats:

                    {

                      booking.seats
                      ?.join(', ')

                    }

                  </p>

                  <p>

                    Amount:

                    ₹{

                      booking.totalAmount

                    }

                  </p>

                  <p>

                    Booking ID:

                    {

                      booking.bookingId

                    }

                  </p>

                </div>

              )

            )

          )

        }

      </div>

    </>

  );

}

export default Bookings;
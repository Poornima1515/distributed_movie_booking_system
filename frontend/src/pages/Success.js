import React from 'react';

import {

  useLocation,

  useNavigate

} from 'react-router-dom';

import QRCode from 'react-qr-code';

import Navbar from '../components/Navbar';

function Success() {

  const location =
    useLocation();

  const navigate =
    useNavigate();

  const booking =
    location.state?.booking;

  if (!booking) {

    return (
      <h1>
        No Booking Found
      </h1>
    );

  }

  const qrData = `

Booking ID:
${booking.bookingId}

Seats:
${booking.seats.join(', ')}

Amount:
₹${booking.totalAmount}

`;

  return (

    <>

      <Navbar />

      <div
        style={{
          background: '#0f172a',
          minHeight: '100vh',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '30px'
        }}
      >

        <div
          style={{
            background: '#1e293b',
            padding: '40px',
            borderRadius: '20px',
            width: '500px',
            textAlign: 'center'
          }}
        >

          <h1
            style={{
              color: 'lime'
            }}
          >
            Booking Confirmed
          </h1>

          <div
            style={{
              background: 'white',
              padding: '20px',
              marginTop: '20px',
              display: 'inline-block'
            }}
          >

            <QRCode
              value={qrData}
              size={180}
            />

          </div>

          <p
            style={{
              marginTop: '25px'
            }}
          >
            Booking ID:
            {booking.bookingId}
          </p>

          <p>
            Seats:
            {
              booking.seats.join(', ')
            }
          </p>

          <p>
            Amount:
            ₹ {booking.totalAmount}
          </p>

          <button

            onClick={() =>
              navigate('/bookings')
            }

            style={{

              width: '100%',

              padding: '15px',

              marginTop: '30px',

              background: '#ff004f',

              border: 'none',

              borderRadius: '10px',

              color: 'white',

              cursor: 'pointer',

              fontSize: '16px'

            }}

          >
            View My Bookings
            <button

  onClick={() =>
    navigate('/home')
  }

  style={{

    width: '100%',

    padding: '15px',

    marginTop: '15px',

    background: '#111827',

    border: 'none',

    borderRadius: '10px',

    color: 'white',

    cursor: 'pointer',

    fontSize: '16px'

  }}

>

  Go To Home

</button>
          </button>

        </div>

      </div>

    </>

  );

}

export default Success;
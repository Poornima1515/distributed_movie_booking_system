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

import axios from "axios";

import { io } from 'socket.io-client';

const socket =
  io('http://localhost:5000');

function Seats() {

  const { showId } =
    useParams();

  const navigate =
    useNavigate();

  const [show, setShow] =
    useState(null);

  const [lockedSeats,
    setLockedSeats] =
    useState([]);

  const [seatOwners,
    setSeatOwners] =
    useState({});

  const [bookedSeats,
    setBookedSeats] =
    useState([]);

  const [timeLeft,
    setTimeLeft] =
    useState(120);

  const currentUserId =

    JSON.parse(
      localStorage.getItem('user')
    )._id;



  // FETCH SHOW
  const fetchShow =
    async () => {

      try {

        const res =
          await API.get(
            '/admin/shows'
          );

        const selectedShow =
          res.data.find(
            (s) => s._id === showId
          );

        setShow(selectedShow);

        setBookedSeats(
          selectedShow.bookedSeats || []
        );

      } catch (error) {

        console.log(error);

      }

    };



  // FETCH LOCKS
  const fetchLockedSeats =
    async () => {

      try {

        const res =
          await API.get(

            `/bookings/locks/${showId}`

          );

        setLockedSeats(
          res.data.lockedSeats || []
        );

        setSeatOwners(
          res.data.seatOwners || {}
        );

      } catch (error) {

        console.log(error);

      }

    };



  // INITIAL LOAD
  useEffect(() => {

    fetchShow();

    fetchLockedSeats();

  }, []);




  // SOCKET EVENTS
  useEffect(() => {

    socket.on(

      'seatLocked',

      (data) => {

        if (
          data.showId === showId
        ) {

          setLockedSeats((prev) => [

            ...new Set([

              ...prev,

              ...data.seats

            ])

          ]);

          setSeatOwners((prev) => {

            const updated = {
              ...prev
            };

            data.seats.forEach((seat) => {

              updated[seat] =
                data.userId;

            });

            return updated;

          });

        }

      }

    );

    socket.on(

      'seatUnlocked',

      (data) => {

        if (
          data.showId === showId
        ) {

          setLockedSeats((prev) =>

            prev.filter(
              (s) => s !== data.seat
            )

          );

        }

      }

    );

    socket.on(

      'bookingConfirmed',

      (data) => {

        if (
          data.showId === showId
        ) {

          setBookedSeats((prev) => [

            ...new Set([

              ...prev,

              ...data.seats

            ])

          ]);

        }

      }

    );

    return () => {

      socket.off('seatLocked');

      socket.off('seatUnlocked');

      socket.off('bookingConfirmed');

    };

  }, []);




  // TIMER
  useEffect(() => {

    if (
      lockedSeats.length === 0
    ) return;

    const timer =
      setInterval(() => {

        setTimeLeft((prev) => {

          if (prev <= 1) {

            clearInterval(timer);

            return 0;

          }

          return prev - 1;

        });

      }, 1000);

    return () =>
      clearInterval(timer);

  }, [lockedSeats]);




  // MY SEATS
  const mySeats =

    lockedSeats.filter(

      (seat) =>

        String(seatOwners[seat]) ===
        String(currentUserId)

    );




  // TOGGLE SEAT
  const toggleSeat =
    async (seat) => {

      if (
        bookedSeats.includes(seat)
      ) return;

      const ownerId =
        String(seatOwners[seat]);

      const isMine =
        ownerId ===
        String(currentUserId);

      if (

        lockedSeats.includes(seat)

        && !isMine

      ) {

        alert(
          `${seat} already locked`
        );

        return;

      }



      // UNLOCK
      if (isMine) {

        await API.post(

          '/bookings/unlock',

          {

            showId,

            seat

          }

        );

        socket.emit(

          'seatUnlocked',

          {

            showId,

            seat

          }

        );

        setLockedSeats((prev) =>

          prev.filter(
            (s) => s !== seat
          )

        );

        return;

      }



      // LOCK
      try {

        await API.post(

          '/bookings/lock',

          {

            showId,

            seats: [seat],

            userId:
              currentUserId

          }

        );

        setLockedSeats((prev) => [

          ...new Set([

            ...prev,

            seat

          ])

        ]);

        setSeatOwners((prev) => ({

          ...prev,

          [seat]: currentUserId

        }));

        socket.emit(

          'seatLocked',

          {

            showId,

            seats: [seat],

            userId:
              currentUserId

          }

        );

      } catch (error) {

        alert(
          error.response?.data?.message
        );

      }

    };




  // PAYMENT
  const handlePayment =
    async () => {

      try {

        const totalPrice =
          mySeats.length * 200;

        const { data: order } =
          await axios.post(

            "http://localhost:5000/api/payment/create-order",

            {
              amount: totalPrice
            }

          );

        const options = {

          key:
            "rzp_test_SouWI5KXK5cZAk",

          amount:
            order.amount,

          currency:
            order.currency,

          name:
            "CineVerse",

          description:
            "Movie Ticket Booking",

          order_id:
            order.id,

          handler:
            async function (response) {

              const verifyRes =
                await axios.post(

                  "http://localhost:5000/api/payment/verify",

                  {

                    ...response,

                    seats: mySeats,

                    showId,

                    userId:
                      currentUserId

                  }

                );

              if (
                verifyRes.data.success
              ) {

                const booking =
                  verifyRes.data.booking;

                socket.emit(

                  "bookingConfirmed",

                  {

                    showId,

                    seats: mySeats

                  }

                );

                navigate(

                  '/success',

                  {

                    state: {

                      booking

                    }

                  }

                );

              }

            },

          theme: {
            color: "#ff004f"
          }

        };

        const razorpay =
          new window.Razorpay(
            options
          );

        razorpay.open();

      } catch (error) {

        console.log(error);

        alert("Payment failed");

      }

    };




  if (!show) {

    return (
      <h1>
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

        {/* BACK BUTTON */}

        <button

          onClick={() =>
            navigate(-1)
          }

          style={{

            background: '#ff004f',

            border: 'none',

            padding: '10px 20px',

            borderRadius: '10px',

            color: 'white',

            cursor: 'pointer',

            marginBottom: '20px'

          }}

        >

          ← Go Back

        </button>



        <h1>
          Select Seats
        </h1>

        <h2>
          {show.movie?.title}
        </h2>

        <h3>
          {show.theatre?.name}
        </h3>



        {/* TIMER */}

        {

          mySeats.length > 0 && (

            <h2
              style={{
                color: 'orange'
              }}
            >

              Complete payment in:
              {Math.floor(timeLeft / 60)}:
              {(timeLeft % 60)
                .toString()
                .padStart(2, '0')}

            </h2>

          )

        }



        {/* LEGEND */}

        <div
          style={{

            display: 'flex',

            gap: '20px',

            marginTop: '20px',

            marginBottom: '20px'

          }}
        >

          <div>🟩 Yours</div>

          <div>⬛ Available</div>

          <div>⬜ Locked</div>

          <div>🟥 Booked</div>

        </div>



        {/* SCREEN */}

        <div
          style={{

            width: '70%',

            margin: '30px auto',

            background: '#cbd5e1',

            color: '#111827',

            textAlign: 'center',

            padding: '12px',

            borderRadius: '10px',

            fontWeight: 'bold'

          }}
        >

          SCREEN THIS WAY

        </div>



        {/* SEATS */}

        <div
          style={{

            display: 'grid',

            gridTemplateColumns:
              'repeat(10,1fr)',

            gap: '12px',

            marginTop: '40px'

          }}
        >

          {

            show.seats.map((seat) => {

              const isLocked =
                lockedSeats.includes(seat);

              const isBooked =
                bookedSeats.includes(seat);

              const ownerId =
                String(seatOwners[seat]);

              const isMine =
                ownerId ===
                String(currentUserId);

              return (

                <button

                  key={seat}

                  onClick={() =>
                    toggleSeat(seat)
                  }

                  style={{

                    padding: '18px',

                    border: 'none',

                    borderRadius: '12px',

                    fontWeight: 'bold',

                    transition: '0.3s',

                    background:

                      isBooked
                      ? '#ff0000'

                      : isLocked

                      ? isMine
                        ? '#00b300'
                        : '#64748b'

                      : '#1e293b',

                    color: 'white',

                    cursor:

                      isBooked
                      ? 'not-allowed'
                      : 'pointer'

                  }}

                >

                  {seat}

                </button>

              );

            })

          }

        </div>



        {/* SUMMARY */}

        <div
          style={{
            marginTop: '40px'
          }}
        >

          <h2>

            Selected Seats:

            {

              mySeats.length > 0

              ? mySeats.join(', ')

              : 'None'

            }

          </h2>

          <h2>

            Total Price:
            ₹{mySeats.length * 200}

          </h2>

        </div>



        {/* PAYMENT */}

        <button

          disabled={
            mySeats.length === 0
          }

          onClick={handlePayment}

          style={{

            marginTop: '30px',

            padding: '16px 35px',

            background:

              mySeats.length === 0

              ? 'gray'

              : '#ff004f',

            border: 'none',

            borderRadius: '12px',

            color: 'white',

            fontSize: '18px',

            cursor: 'pointer',

            fontWeight: 'bold'

          }}

        >

          Proceed To Payment

        </button>

      </div>

    </>

  );

}

export default Seats;
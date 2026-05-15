import React from 'react';

import {

  useNavigate,

  useLocation

} from 'react-router-dom';

function Navbar() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const user =

    JSON.parse(

      localStorage.getItem('user')

    );

  const logout = () => {

    localStorage.clear();

    navigate('/login');

  };

  const isActive = (path) =>

    location.pathname === path;

  return (

    <div
      style={{

        background: '#111827',

        padding: '15px 30px',

        display: 'flex',

        justifyContent: 'space-between',

        alignItems: 'center',

        boxShadow:
          '0 2px 10px rgba(0,0,0,0.3)',

        position: 'sticky',

        top: 0,

        zIndex: 1000

      }}
    >

      <div
        style={{

          display: 'flex',

          alignItems: 'center',

          gap: '25px'

        }}
      >

        <h1
          style={{

            color: '#ff004f',

            cursor: 'pointer'

          }}

          onClick={() =>
            navigate('/home')
          }

        >

          CineVerse

        </h1>

        <button

          onClick={() =>
            navigate('/home')
          }

          style={{

            ...buttonStyle,

            color:

              isActive('/home')

              ? '#ff004f'

              : 'white'

          }}

        >

          Home

        </button>

        <button

          onClick={() =>
            navigate('/bookings')
          }

          style={{

            ...buttonStyle,

            color:

              isActive('/bookings')

              ? '#ff004f'

              : 'white'

          }}

        >

          My Bookings

        </button>

        {

          user?.role === 'admin' && (

            <button

              onClick={() =>
                navigate('/admin')
              }

              style={{

                ...buttonStyle,

                color:

                  isActive('/admin')

                  ? '#ff004f'

                  : 'white'

              }}

            >

              Admin Dashboard

            </button>

          )

        }

      </div>

      <div
        style={{

          display: 'flex',

          alignItems: 'center',

          gap: '20px'

        }}
      >

        <span
          style={{
            color: 'white'
          }}
        >

          Welcome,
          {user?.name}

        </span>

        <button

          onClick={logout}

          style={{

            background: '#ff004f',

            color: 'white',

            border: 'none',

            padding: '10px 18px',

            borderRadius: '8px',

            cursor: 'pointer',

            fontWeight: 'bold'

          }}

        >

          Logout

        </button>

      </div>

    </div>

  );

}

const buttonStyle = {

  background: 'transparent',

  border: 'none',

  fontSize: '15px',

  cursor: 'pointer',

  transition: '0.3s'

};

export default Navbar;
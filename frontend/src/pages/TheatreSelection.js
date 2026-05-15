import React from 'react';

import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
function TheatreSelection() {

  const navigate = useNavigate();

  const theatres = [

    {
      name: 'PVR Cinemas',
      timing: '10:00 AM'
    },

    {
      name: 'INOX',
      timing: '1:00 PM'
    },

    {
      name: 'Cinepolis',
      timing: '6:00 PM'
    }

  ];

  return (
<>
  <Navbar />
    <div
      style={{
        background: '#0f172a',
        minHeight: '100vh',
        color: 'white',
        padding: '40px'
      }}
    >

      <h1
        style={{
          fontSize: '50px',
          marginBottom: '40px'
        }}
      >
        Select Theatre
      </h1>

      {theatres.map((theatre, index) => (

        <div
          key={index}
          style={{
            background: '#1e293b',
            padding: '30px',
            borderRadius: '20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >

          <div>

            <h2
              style={{
                fontSize: '30px'
              }}
            >
              {theatre.name}
            </h2>

            <p
              style={{
                marginTop: '10px',
                color: 'lightgray'
              }}
            >
              Show Time: {theatre.timing}
            </p>

          </div>

          <button
            onClick={() => navigate('/seats')}
            style={{
              background: 'red',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '10px',
              fontSize: '18px'
            }}
          >
            Select
          </button>

        </div>

      ))}

    </div>
</>
  );

}

export default TheatreSelection;
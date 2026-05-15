import React, {
  useState
} from 'react';

import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import API from '../api';

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({

    name: '',
    email: '',
    password: ''

  });

  const handleChange = (e) => {

    setForm({

      ...form,

      [e.target.name]:
      e.target.value

    });

  };

  const registerUser = async () => {

    try {

      await API.post(

        '/auth/register',

        {

          ...form,

          role: 'user'

        }

      );

      alert(
        'Registration Successful'
      );

      navigate('/login');

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
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >

      <div
        style={{
          background: '#1e293b',
          padding: '40px',
          borderRadius: '20px',
          width: '400px'
        }}
      >

        <h1
          style={{
            color: 'red',
            textAlign: 'center',
            marginBottom: '30px'
          }}
        >
          Register
        </h1>

        <input
          name="name"
          placeholder="Name"
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '15px'
          }}
        />

        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '15px'
          }}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px'
          }}
        />

        <button
          onClick={registerUser}
          style={{
            width: '100%',
            padding: '12px',
            background: 'red',
            color: 'white',
            border: 'none',
            borderRadius: '10px'
          }}
        >
          Register
        </button>

      </div>

    </div>
</>
  );

}

export default Register;
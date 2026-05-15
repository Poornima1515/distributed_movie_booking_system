import React from 'react';

import {

  BrowserRouter,

  Routes,

  Route

} from 'react-router-dom';

import Login from './pages/Login';

import Register from './pages/Register';

import Home from './pages/Home';

import MovieDetails from './pages/MovieDetails';

import Seats from './pages/Seats';

import Payment from './pages/Payment';

import Success from './pages/Success';

import Bookings from './pages/Bookings';

import AdminDashboard from './pages/AdminDashboard';

import AddMovie from './pages/AddMovie';

import AddShow from './pages/AddShow';

import AdminRoute from './components/AdminRoute';

import ProtectedRoute
from './components/ProtectedRoute';

function App() {

  return (

    <BrowserRouter>

      <Routes>

        {/* LOGIN & REGISTER */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />



        {/* USER PROTECTED ROUTES */}

        <Route

          path="/home"

          element={

            <ProtectedRoute>

              <Home />

            </ProtectedRoute>

          }

        />

        <Route

          path="/movie/:id"

          element={

            <ProtectedRoute>

              <MovieDetails />

            </ProtectedRoute>

          }

        />

        <Route

          path="/seats/:showId"

          element={

            <ProtectedRoute>

              <Seats />

            </ProtectedRoute>

          }

        />

        <Route

          path="/payment"

          element={

            <ProtectedRoute>

              <Payment />

            </ProtectedRoute>

          }

        />

        <Route

          path="/success"

          element={

            <ProtectedRoute>

              <Success />

            </ProtectedRoute>

          }

        />

        <Route

          path="/bookings"

          element={

            <ProtectedRoute>

              <Bookings />

            </ProtectedRoute>

          }

        />



        {/* ADMIN ROUTES */}

        <Route

          path="/admin"

          element={

            <AdminRoute>

              <AdminDashboard />

            </AdminRoute>

          }

        />

        <Route

          path="/admin/add-movie"

          element={

            <AdminRoute>

              <AddMovie />

            </AdminRoute>

          }

        />

        <Route

          path="/admin/add-show"

          element={

            <AdminRoute>

              <AddShow />

            </AdminRoute>

          }

        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
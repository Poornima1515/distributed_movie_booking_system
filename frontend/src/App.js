import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

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
import EditMovie from './pages/EditMovie';
import AddShow from './pages/AddShow';
import AddTheatre from './pages/AddTheatre';

import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* USER PROTECTED */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/movie/:id" element={<ProtectedRoute><MovieDetails /></ProtectedRoute>} />
        <Route path="/seats/:showId" element={<ProtectedRoute><Seats /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/success" element={<ProtectedRoute><Success /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />

        {/* ADMIN PROTECTED */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/add-movie" element={<AdminRoute><AddMovie /></AdminRoute>} />
        <Route path="/admin/edit-movie/:id" element={<AdminRoute><EditMovie /></AdminRoute>} />
        <Route path="/admin/add-show" element={<AdminRoute><AddShow /></AdminRoute>} />
        <Route path="/admin/add-theatre" element={<AdminRoute><AddTheatre /></AdminRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

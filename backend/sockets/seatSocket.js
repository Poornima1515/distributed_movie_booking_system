module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    socket.on('joinShow', (showId) => {
      socket.join(showId);
    });

    socket.on('leaveShow', (showId) => {
      socket.leave(showId);
    });

    socket.on('joinAdmin', () => {
      socket.join('admin-room');
    });

    socket.on('leaveAdmin', () => {
      socket.leave('admin-room');
    });

    socket.on('seatLocked', (data) => {
      socket.to(data.showId).emit('seatLocked', data);
    });

    socket.on('seatUnlocked', (data) => {
      socket.to(data.showId).emit('seatUnlocked', data);
    });

    socket.on('bookingConfirmed', (data) => {
      socket.to(data.showId).emit('bookingConfirmed', data);
      io.to('admin-room').emit('newBookingActivity', {
        type: 'BOOKING',
        userName: data.userName || 'A user',
        seats: data.seats,
        movieTitle: data.movieTitle || 'a movie',
        theatreName: data.theatreName || '',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('bookingCancelled', (data) => {
      socket.to(data.showId).emit('seatReopened', data);
      io.to('admin-room').emit('newBookingActivity', {
        type: 'CANCELLATION',
        userName: data.userName || 'A user',
        seats: data.seats,
        movieTitle: data.movieTitle || 'a movie',
        theatreName: data.theatreName || '',
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected:', socket.id);
    });
  });
};
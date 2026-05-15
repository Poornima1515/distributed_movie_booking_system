module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User Connected:', socket.id);

    // JOIN SHOW ROOM for isolated real-time sync
    socket.on('joinShow', (showId) => {
      socket.join(showId);
      console.log(`Socket ${socket.id} joined show room: ${showId}`);
    });

    socket.on('leaveShow', (showId) => {
      socket.leave(showId);
    });

    socket.on('seatLocked', (data) => {
      // Broadcast to all others in the same show room
      socket.to(data.showId).emit('seatLocked', data);
    });

    socket.on('seatUnlocked', (data) => {
      socket.to(data.showId).emit('seatUnlocked', data);
    });

    socket.on('bookingConfirmed', (data) => {
      socket.to(data.showId).emit('bookingConfirmed', data);
    });

    socket.on('disconnect', () => {
      console.log('User Disconnected:', socket.id);
    });
  });
};

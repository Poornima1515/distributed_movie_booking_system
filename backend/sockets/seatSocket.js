module.exports = (io) => {

  io.on('connection', (socket) => {

    console.log('User Connected');

    socket.on(

      'seatLocked',

      (data) => {

        socket.broadcast.emit(

          'seatLocked',

          data

        );

      }

    );

    socket.on(

      'seatUnlocked',

      (data) => {

        socket.broadcast.emit(

          'seatUnlocked',

          data

        );

      }

    );

    socket.on(

      'bookingConfirmed',

      (data) => {

        socket.broadcast.emit(

          'bookingConfirmed',

          data

        );

      }

    );

    socket.on('disconnect', () => {

      console.log('User Disconnected');

    });

  });

};
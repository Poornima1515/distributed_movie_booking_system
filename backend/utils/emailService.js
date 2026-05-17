const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendTicketEmail = async ({ to, booking, movie, theatre, show }) => {
  const seatList = booking.seats.join(', ');
  const showTime = show?.showTime || 'N/A';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8"/>
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: #0a0f1e; margin: 0; padding: 0; }
      .wrapper { max-width: 600px; margin: 0 auto; background: #0a0f1e; }
      .header { background: linear-gradient(135deg, #ff004f, #cc0040); padding: 32px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 2px; }
      .header p  { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
      .ticket { background: #111827; margin: 0; padding: 32px; }
      .movie-title { color: white; font-size: 24px; font-weight: 900; margin: 0 0 4px; }
      .badge { display: inline-block; background: rgba(255,0,79,0.15); border: 1px solid rgba(255,0,79,0.3); color: #ff004f; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
      .divider { border: none; border-top: 1px dashed rgba(255,255,255,0.1); margin: 20px 0; }
      .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
      .label { color: #64748b; font-size: 13px; }
      .value { color: white; font-size: 13px; font-weight: 600; text-align: right; }
      .amount { color: #10b981; font-size: 22px; font-weight: 900; }
      .booking-id { font-family: monospace; color: #94a3b8; font-size: 12px; word-break: break-all; }
      .qr-note { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; text-align: center; margin-top: 20px; }
      .qr-note p { color: #94a3b8; font-size: 13px; margin: 0; }
      .footer { background: #0a0f1e; padding: 20px; text-align: center; color: #334155; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
      .seats-box { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; padding: 12px 16px; margin: 16px 0; }
      .seats-box span { color: #10b981; font-weight: 700; font-size: 16px; }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>🎬 CineVerse</h1>
        <p>Your booking is confirmed!</p>
      </div>
      <div class="ticket">
        <p class="movie-title">${movie?.title || 'Movie'}</p>
        <span class="badge">BOOKING CONFIRMED ✓</span>
        <hr class="divider"/>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td class="label">🏛️ Theatre</td><td class="value">${theatre?.name || 'N/A'}</td></tr>
          <tr><td class="label">🕐 Show Time</td><td class="value">${showTime}</td></tr>
          <tr><td class="label">📅 Booked On</td><td class="value">${new Date().toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</td></tr>
        </table>
        <div class="seats-box">
          <p style="color:#64748b;font-size:12px;margin:0 0 4px;">YOUR SEATS</p>
          <span>${seatList}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td class="label">💰 Total Amount</td><td class="value amount">₹${booking.totalAmount}</td></tr>
          <tr><td class="label">🎟️ Booking ID</td><td class="value booking-id">${booking.bookingId}</td></tr>
        </table>
        <div class="qr-note">
          <p>📱 Show your Booking ID at the theatre entrance or use the QR code in the app</p>
        </div>
      </div>
      <div class="footer">
        © 2025 CineVerse — Distributed Movie Booking System<br/>
        This is an automated email. Please do not reply.
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"CineVerse 🎬" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎟️ Booking Confirmed — ${movie?.title || 'Your Movie'} | ${seatList}`,
    html
  });
};

module.exports = { sendTicketEmail };
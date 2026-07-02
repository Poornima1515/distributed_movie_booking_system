const nodemailer = require('nodemailer');

// ─── SETUP ────────────────────────────────────────────────────────────────────
// Gmail App Password setup instructions:
// 1. Enable 2-Factor Authentication on your Google account
// 2. Go to https://myaccount.google.com/apppasswords
// 3. Select "Mail" and "Windows Computer" (or any device)
// 4. Copy the 16-character App Password generated
// 5. Set EMAIL_USER=youraddress@gmail.com in .env
// 6. Set EMAIL_PASS=xxxx xxxx xxxx xxxx (the 16-char App Password, spaces optional)
// ─────────────────────────────────────────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── BOOKING CONFIRMATION ─────────────────────────────────────────────────────
const sendTicketEmail = async ({ to, booking, movie, theatre, show }) => {
  const seatList = booking.seats.join(', ');
  const showTime = show?.showTime || 'N/A';

  // Generate PDF attachment
  let pdfAttachment = null;
  try {
    const { generateTicketPDF } = require('../utils/pdfTicket');
    const pdfBuffer = await generateTicketPDF(booking, movie, theatre, show);
    pdfAttachment = {
      filename: `CineVerse-Ticket-${booking.bookingId?.slice(0,8)}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf'
    };
  } catch (err) {
    console.error('PDF attachment generation failed:', err.message);
  }

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
      .label { color: #64748b; font-size: 13px; padding: 8px 0; }
      .value { color: white; font-size: 13px; font-weight: 600; text-align: right; padding: 8px 0; }
      .amount { color: #10b981; font-size: 22px; font-weight: 900; }
      .booking-id { font-family: monospace; color: #94a3b8; font-size: 12px; word-break: break-all; }
      .qr-note { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; text-align: center; margin-top: 20px; }
      .qr-note p { color: #94a3b8; font-size: 13px; margin: 0; }
      .footer { background: #0a0f1e; padding: 20px; text-align: center; color: #334155; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
      .seats-box { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); border-radius: 10px; padding: 12px 16px; margin: 16px 0; }
      .seats-box span { color: #10b981; font-weight: 700; font-size: 16px; }
      .points-box { background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2); border-radius: 10px; padding: 12px 16px; margin: 16px 0; text-align: center; }
      .points-box span { color: #818cf8; font-weight: 700; font-size: 15px; }
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
          <tr><td class="label">📅 Booked On</td><td class="value">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
        </table>
        <div class="seats-box">
          <p style="color:#64748b;font-size:12px;margin:0 0 4px;">YOUR SEATS</p>
          <span>${seatList}</span>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td class="label">💰 Total Amount</td><td class="value amount">₹${booking.totalAmount}</td></tr>
          ${booking.mealsTotal > 0 ? `<tr><td class="label">🍿 Meals Total</td><td class="value" style="color:#f59e0b;">₹${booking.mealsTotal}</td></tr>` : ''}
          <tr><td class="label">🎟️ Booking ID</td><td class="value booking-id">${booking.bookingId}</td></tr>
        </table>
        ${booking.loyaltyPointsEarned ? `
        <div class="points-box">
          <p style="color:#64748b;font-size:12px;margin:0 0 4px;">LOYALTY POINTS EARNED</p>
          <span>+${booking.loyaltyPointsEarned} points 🌟</span>
        </div>` : ''}
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
    html,
    attachments: pdfAttachment ? [pdfAttachment] : []
  });
};

// ─── CANCELLATION EMAIL ───────────────────────────────────────────────────────
const sendCancellationEmail = async ({ to, booking, movie, theatre }) => {
  const seatList = (booking.seats || []).join(', ');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8"/>
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: #0a0f1e; margin: 0; padding: 0; }
      .wrapper { max-width: 600px; margin: 0 auto; background: #0a0f1e; }
      .header { background: linear-gradient(135deg, #ef4444, #b91c1c); padding: 32px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 2px; }
      .header p  { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
      .ticket { background: #111827; margin: 0; padding: 32px; }
      .movie-title { color: white; font-size: 22px; font-weight: 900; margin: 0 0 4px; }
      .badge { display: inline-block; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #ef4444; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
      .divider { border: none; border-top: 1px dashed rgba(255,255,255,0.1); margin: 20px 0; }
      .label { color: #64748b; font-size: 13px; padding: 8px 0; }
      .value { color: white; font-size: 13px; font-weight: 600; text-align: right; padding: 8px 0; }
      .refund-box { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.2); border-radius: 10px; padding: 16px; margin: 16px 0; text-align: center; }
      .footer { background: #0a0f1e; padding: 20px; text-align: center; color: #334155; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>🎬 CineVerse</h1>
        <p>Your booking has been cancelled</p>
      </div>
      <div class="ticket">
        <p class="movie-title">${movie?.title || 'Movie'}</p>
        <span class="badge">BOOKING CANCELLED ✕</span>
        <hr class="divider"/>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td class="label">🏛️ Theatre</td><td class="value">${theatre?.name || 'N/A'}</td></tr>
          <tr><td class="label">💺 Seats</td><td class="value">${seatList}</td></tr>
          <tr><td class="label">📅 Cancelled On</td><td class="value">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
          <tr><td class="label">💰 Original Amount</td><td class="value">₹${booking.totalAmount}</td></tr>
          <tr><td class="label">🎟️ Booking ID</td><td class="value" style="font-family:monospace;font-size:12px;">${booking.bookingId}</td></tr>
        </table>
        ${booking.refundAmount > 0 ? `
        <div class="refund-box">
          <p style="color:#64748b;font-size:12px;margin:0 0 6px;">REFUND AMOUNT</p>
          <p style="color:#f59e0b;font-size:24px;font-weight:900;margin:0;">₹${booking.refundAmount}</p>
          <p style="color:#64748b;font-size:12px;margin:6px 0 0;">Will be processed within 5-7 business days</p>
        </div>` : ''}
        <p style="color:#64748b;font-size:13px;text-align:center;margin-top:20px;">
          We hope to see you again at CineVerse!
        </p>
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
    subject: `✕ Booking Cancelled — ${movie?.title || 'Your Movie'} | Refund ₹${booking.refundAmount}`,
    html
  });
};

// ─── WAITLIST NOTIFICATION EMAIL ──────────────────────────────────────────────
const sendWaitlistEmail = async ({ to, userName, movie, theatre, show }) => {
  const showTime = show?.showTime || 'N/A';

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8"/>
    <style>
      body { font-family: 'Segoe UI', sans-serif; background: #0a0f1e; margin: 0; padding: 0; }
      .wrapper { max-width: 600px; margin: 0 auto; background: #0a0f1e; }
      .header { background: linear-gradient(135deg, #10b981, #059669); padding: 32px; text-align: center; }
      .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 2px; }
      .header p  { color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px; }
      .content { background: #111827; margin: 0; padding: 32px; }
      .badge { display: inline-block; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #10b981; border-radius: 20px; padding: 4px 14px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
      .label { color: #64748b; font-size: 13px; padding: 8px 0; }
      .value { color: white; font-size: 13px; font-weight: 600; text-align: right; padding: 8px 0; }
      .cta { background: linear-gradient(135deg, #ff004f, #cc0040); border-radius: 12px; padding: 16px 24px; text-align: center; margin: 24px 0; }
      .cta a { color: white; font-size: 16px; font-weight: 700; text-decoration: none; }
      .footer { background: #0a0f1e; padding: 20px; text-align: center; color: #334155; font-size: 12px; border-top: 1px solid rgba(255,255,255,0.05); }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="header">
        <h1>🎬 CineVerse</h1>
        <p>Great news! Seats are available!</p>
      </div>
      <div class="content">
        <p style="color:white;font-size:18px;font-weight:700;margin:0 0 8px;">Hi ${userName || 'there'}! 👋</p>
        <span class="badge">SEAT AVAILABLE 🎉</span>
        <p style="color:#94a3b8;font-size:14px;">A seat has just opened up for a show you're waitlisted for. Book quickly before someone else grabs it!</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td class="label">🎬 Movie</td><td class="value">${movie?.title || 'N/A'}</td></tr>
          <tr><td class="label">🏛️ Theatre</td><td class="value">${theatre?.name || 'N/A'}</td></tr>
          <tr><td class="label">🕐 Show Time</td><td class="value">${showTime}</td></tr>
        </table>
        <div class="cta">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/home">Book Now →</a>
        </div>
        <p style="color:#64748b;font-size:12px;text-align:center;">This notification expires soon. Seats are first-come, first-served.</p>
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
    subject: `🎉 Seat Available! — ${movie?.title || 'Your Waitlisted Movie'} at ${theatre?.name || 'the theatre'}`,
    html
  });
};

module.exports = { sendTicketEmail, sendCancellationEmail, sendWaitlistEmail };

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ─── BOOKING CONFIRMATION (HTML first, PDF follow-up) ────────────────────────
const sendTicketEmail = async ({ to, booking, movie, theatre, show }) => {
  const seatList = (booking.seats || []).join(', ');
  const showTime = show?.showTime || 'N/A';

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <style>
    body{font-family:'Segoe UI',sans-serif;background:#0a0f1e;margin:0;padding:0;}
    .wrap{max-width:600px;margin:0 auto;background:#0a0f1e;}
    .hdr{background:linear-gradient(135deg,#ff004f,#cc0040);padding:32px;text-align:center;}
    .hdr h1{color:white;margin:0;font-size:28px;letter-spacing:2px;}
    .hdr p{color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;}
    .body{background:#111827;padding:32px;}
    .title{color:white;font-size:22px;font-weight:900;margin:0 0 4px;}
    .badge{display:inline-block;background:rgba(255,0,79,0.15);border:1px solid rgba(255,0,79,0.3);color:#ff004f;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:20px;}
    .lbl{color:#64748b;font-size:13px;padding:8px 0;}
    .val{color:white;font-size:13px;font-weight:600;text-align:right;padding:8px 0;}
    .seats{background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.2);border-radius:10px;padding:12px 16px;margin:16px 0;}
    .seats span{color:#10b981;font-weight:700;font-size:16px;}
    .amt{color:#10b981;font-size:22px;font-weight:900;}
    .pts{background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.2);border-radius:10px;padding:12px 16px;margin:16px 0;text-align:center;}
    .pts span{color:#818cf8;font-weight:700;}
    .note{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:16px;text-align:center;margin-top:20px;}
    .note p{color:#94a3b8;font-size:13px;margin:0;}
    .ftr{background:#0a0f1e;padding:20px;text-align:center;color:#334155;font-size:12px;}
  </style></head><body>
  <div class="wrap">
    <div class="hdr"><h1>🎬 CineVerse</h1><p>Your booking is confirmed!</p></div>
    <div class="body">
      <p class="title">${movie?.title || 'Movie'}</p>
      <span class="badge">BOOKING CONFIRMED ✓</span>
      <hr style="border:none;border-top:1px dashed rgba(255,255,255,0.1);margin:20px 0;"/>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td class="lbl">🏛️ Theatre</td><td class="val">${theatre?.name || 'N/A'}</td></tr>
        <tr><td class="lbl">🕐 Show Time</td><td class="val">${showTime}</td></tr>
        <tr><td class="lbl">📅 Booked On</td><td class="val">${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</td></tr>
      </table>
      <div class="seats"><p style="color:#64748b;font-size:12px;margin:0 0 4px;">YOUR SEATS</p><span>${seatList}</span></div>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td class="lbl">💰 Total Amount</td><td class="val amt">₹${booking.totalAmount}</td></tr>
        ${booking.mealsTotal > 0 ? `<tr><td class="lbl">🍿 Meals</td><td class="val" style="color:#f59e0b;">₹${booking.mealsTotal}</td></tr>` : ''}
        <tr><td class="lbl">🎟️ Booking ID</td><td class="val" style="font-family:monospace;font-size:12px;">${booking.bookingId}</td></tr>
      </table>
      ${booking.loyaltyPointsEarned ? `<div class="pts"><p style="color:#64748b;font-size:12px;margin:0 0 4px;">LOYALTY POINTS EARNED</p><span>+${booking.loyaltyPointsEarned} points 🌟</span></div>` : ''}
      <div class="note"><p>📱 Show Booking ID at the theatre entrance. PDF ticket will follow in a separate email.</p></div>
    </div>
    <div class="ftr">© 2025 CineVerse — Distributed Movie Booking System<br/>This is an automated email. Please do not reply.</div>
  </div></body></html>`;

  // Send HTML email first — guaranteed
  await transporter.sendMail({
    from: `"CineVerse 🎬" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎟️ Booking Confirmed — ${movie?.title || 'Your Movie'} | ${seatList}`,
    html
  });

  // Try PDF as a second email — best effort, won't break anything if it fails
  try {
    const { generateTicketPDF } = require('./pdfTicket');
    const pdfBuffer = await generateTicketPDF(booking, movie, theatre, show);
    await transporter.sendMail({
      from: `"CineVerse 🎬" <${process.env.EMAIL_USER}>`,
      to,
      subject: `📄 PDF Ticket — ${movie?.title || 'Your Movie'}`,
      html: `<div style="font-family:sans-serif;padding:24px;background:#0a0f1e;color:white;"><h2 style="color:#ff004f">📄 Your PDF Ticket</h2><p>Your ticket for <strong>${movie?.title}</strong> is attached.</p><p style="color:#64748b;font-size:13px;">Booking ID: ${booking.bookingId}</p></div>`,
      attachments: [{ filename: `CineVerse-Ticket-${(booking.bookingId||'').slice(0,8)}.pdf`, content: pdfBuffer, contentType: 'application/pdf' }]
    });
    console.log('PDF ticket email sent to:', to);
  } catch (pdfErr) {
    console.error('PDF email failed (HTML already sent):', pdfErr.message);
  }
};

// ─── CANCELLATION EMAIL ───────────────────────────────────────────────────────
const sendCancellationEmail = async ({ to, booking, movie, theatre }) => {
  const seatList = (booking.seats || []).join(', ');

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <style>
    body{font-family:'Segoe UI',sans-serif;background:#0a0f1e;margin:0;padding:0;}
    .wrap{max-width:600px;margin:0 auto;background:#0a0f1e;}
    .hdr{background:linear-gradient(135deg,#ef4444,#b91c1c);padding:32px;text-align:center;}
    .hdr h1{color:white;margin:0;font-size:28px;}
    .hdr p{color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;}
    .body{background:#111827;padding:32px;}
    .title{color:white;font-size:22px;font-weight:900;margin:0 0 4px;}
    .badge{display:inline-block;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#ef4444;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:20px;}
    .lbl{color:#64748b;font-size:13px;padding:8px 0;}
    .val{color:white;font-size:13px;font-weight:600;text-align:right;padding:8px 0;}
    .refund{background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.2);border-radius:10px;padding:16px;margin:16px 0;text-align:center;}
    .ftr{background:#0a0f1e;padding:20px;text-align:center;color:#334155;font-size:12px;}
  </style></head><body>
  <div class="wrap">
    <div class="hdr"><h1>🎬 CineVerse</h1><p>Your booking has been cancelled</p></div>
    <div class="body">
      <p class="title">${movie?.title || 'Movie'}</p>
      <span class="badge">BOOKING CANCELLED ✕</span>
      <hr style="border:none;border-top:1px dashed rgba(255,255,255,0.1);margin:20px 0;"/>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td class="lbl">🏛️ Theatre</td><td class="val">${theatre?.name || 'N/A'}</td></tr>
        <tr><td class="lbl">💺 Seats</td><td class="val">${seatList}</td></tr>
        <tr><td class="lbl">📅 Cancelled On</td><td class="val">${new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}</td></tr>
        <tr><td class="lbl">💰 Original Amount</td><td class="val">₹${booking.totalAmount}</td></tr>
        <tr><td class="lbl">🎟️ Booking ID</td><td class="val" style="font-family:monospace;font-size:12px;">${booking.bookingId}</td></tr>
      </table>
      ${booking.refundAmount > 0 ? `<div class="refund"><p style="color:#64748b;font-size:12px;margin:0 0 6px;">REFUND AMOUNT</p><p style="color:#f59e0b;font-size:24px;font-weight:900;margin:0;">₹${booking.refundAmount}</p><p style="color:#64748b;font-size:12px;margin:6px 0 0;">Will be processed within 5-7 business days</p></div>` : ''}
      <p style="color:#64748b;font-size:13px;text-align:center;margin-top:20px;">We hope to see you again at CineVerse!</p>
    </div>
    <div class="ftr">© 2025 CineVerse — Distributed Movie Booking System<br/>This is an automated email.</div>
  </div></body></html>`;

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

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <style>
    body{font-family:'Segoe UI',sans-serif;background:#0a0f1e;margin:0;padding:0;}
    .wrap{max-width:600px;margin:0 auto;background:#0a0f1e;}
    .hdr{background:linear-gradient(135deg,#10b981,#059669);padding:32px;text-align:center;}
    .hdr h1{color:white;margin:0;font-size:28px;}
    .hdr p{color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;}
    .body{background:#111827;padding:32px;}
    .badge{display:inline-block;background:rgba(16,185,129,0.15);border:1px solid rgba(16,185,129,0.3);color:#10b981;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;margin-bottom:20px;}
    .lbl{color:#64748b;font-size:13px;padding:8px 0;}
    .val{color:white;font-size:13px;font-weight:600;text-align:right;padding:8px 0;}
    .cta{background:linear-gradient(135deg,#ff004f,#cc0040);border-radius:12px;padding:16px 24px;text-align:center;margin:24px 0;}
    .cta a{color:white;font-size:16px;font-weight:700;text-decoration:none;}
    .ftr{background:#0a0f1e;padding:20px;text-align:center;color:#334155;font-size:12px;}
  </style></head><body>
  <div class="wrap">
    <div class="hdr"><h1>🎬 CineVerse</h1><p>A seat just opened up!</p></div>
    <div class="body">
      <p style="color:white;font-size:18px;font-weight:700;margin:0 0 8px;">Hi ${userName || 'there'}! 👋</p>
      <span class="badge">SEAT AVAILABLE 🎉</span>
      <p style="color:#94a3b8;font-size:14px;">A seat opened for a show you're waitlisted for. Book quickly!</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <tr><td class="lbl">🎬 Movie</td><td class="val">${movie?.title || 'N/A'}</td></tr>
        <tr><td class="lbl">🏛️ Theatre</td><td class="val">${theatre?.name || 'N/A'}</td></tr>
        <tr><td class="lbl">🕐 Show Time</td><td class="val">${showTime}</td></tr>
      </table>
      <div class="cta"><a href="${process.env.FRONTEND_URL || 'https://distributed-movie-booking-system.vercel.app'}/home">Book Now →</a></div>
    </div>
    <div class="ftr">© 2025 CineVerse — This is an automated email.</div>
  </div></body></html>`;

  await transporter.sendMail({
    from: `"CineVerse 🎬" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎉 Seat Available — ${movie?.title || 'Your Waitlisted Show'}`,
    html
  });
};

module.exports = { sendTicketEmail, sendCancellationEmail, sendWaitlistEmail };

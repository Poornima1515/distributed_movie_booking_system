const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

const generateTicketPDF = async (booking, movie, theatre, show) => {
  // Generate QR code as PNG buffer first
  const qrData = JSON.stringify({
    bookingId: booking.bookingId,
    seats: booking.seats,
    amount: booking.totalAmount
  });
  const qrBuffer = await QRCode.toBuffer(qrData, {
    type: 'png',
    width: 140,
    margin: 1,
    color: { dark: '#000000', light: '#ffffff' }
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [400, 680], margin: 0 });
    const buffers = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const W = 400, H = 680;
    const red = '#ff004f';
    const dark = '#0a0f1e';
    const card = '#111827';
    const muted = '#64748b';
    const white = '#ffffff';
    const green = '#10b981';

    // BACKGROUND
    doc.rect(0, 0, W, H).fill(dark);

    // TOP HEADER BAND
    doc.rect(0, 0, W, 90).fill(red);
    doc.font('Helvetica-Bold').fontSize(24).fillColor(white)
       .text('CineVerse', 0, 18, { align: 'center', width: W });
    doc.font('Helvetica').fontSize(10).fillColor('rgba(255,255,255,0.85)')
       .text('OFFICIAL TICKET  |  BOOKING CONFIRMED', 0, 52, { align: 'center', width: W });
    doc.font('Helvetica').fontSize(9).fillColor('rgba(255,255,255,0.6)')
       .text('Distributed Movie Booking System', 0, 68, { align: 'center', width: W });

    // MOVIE TITLE SECTION
    doc.rect(0, 90, W, 72).fill(card);
    doc.font('Helvetica-Bold').fontSize(18).fillColor(white)
       .text(movie?.title || 'Movie', 20, 104, { width: W - 40 });
    doc.font('Helvetica').fontSize(10).fillColor(muted)
       .text((movie?.genre || '') + '  |  ' + (movie?.language || '') + '  |  ' + (movie?.duration || ''), 20, 130, { width: W - 40 });

    // DASHED DIVIDER
    doc.save();
    doc.dash(4, { space: 4 });
    doc.moveTo(20, 170).lineTo(W - 20, 170).stroke(muted);
    doc.undash();
    doc.restore();

    // DETAILS (left column)
    const details = [
      { label: 'THEATRE',   value: theatre?.name || 'N/A' },
      { label: 'SHOW TIME', value: show?.showTime || 'N/A' },
      { label: 'SEATS',     value: (booking.seats || []).join(', ') || 'N/A' },
      { label: 'AMOUNT',    value: 'Rs. ' + booking.totalAmount },
      { label: 'DATE',      value: new Date(booking.bookedAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) },
    ];

    let y = 182;
    details.forEach(({ label, value }) => {
      doc.font('Helvetica-Bold').fontSize(8).fillColor(muted).text(label, 20, y);
      doc.font('Helvetica-Bold').fontSize(12)
         .fillColor(label === 'AMOUNT' ? green : white)
         .text(value, 20, y + 12, { width: 220 });
      y += 44;
    });

    // DASHED DIVIDER 2
    doc.save();
    doc.dash(4, { space: 4 });
    doc.moveTo(20, y + 2).lineTo(W - 20, y + 2).stroke(muted);
    doc.undash();
    doc.restore();

    // BOOKING ID
    y += 14;
    doc.font('Helvetica-Bold').fontSize(8).fillColor(muted).text('BOOKING ID', 20, y);
    doc.font('Helvetica').fontSize(9).fillColor('#94a3b8')
       .text(booking.bookingId || 'N/A', 20, y + 12, { width: W - 40 });

    // QR CODE — white background box
    const qrX = W - 160;
    const qrY = 182;
    const qrSize = 130;
    doc.rect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16).fill(white);
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });
    doc.font('Helvetica').fontSize(8).fillColor(muted)
       .text('Scan at entrance', qrX - 8, qrY + qrSize + 10, { width: qrSize + 16, align: 'center' });

    // FOOTER
    doc.rect(0, H - 44, W, 44).fill('#0d1424');
    doc.font('Helvetica').fontSize(9).fillColor(muted)
       .text('Present this ticket at the theatre entrance', 0, H - 30, { align: 'center', width: W });
    doc.font('Helvetica').fontSize(8).fillColor('#334155')
       .text('2025 CineVerse', 0, H - 14, { align: 'center', width: W });

    doc.end();
  });
};

module.exports = { generateTicketPDF };
import logoDefault from '@/assets/LOGO DINAS KAB TEGAL.png';

const DEFAULT_HEADER = {
  title: 'UPT LABORATORIUM PERINDUSTRIAN\nKABUPATEN TEGAL',
  subtitle: 'Dinas Perindustrian, Transmigrasi dan Tenaga Kerja Kabupaten Tegal',
  address: 'Komplek LIK TAKARU,Jalan Raya Dampyak KM 4, Kec. Kramat, Kab. Tegal, Jawa Tengah 52181',
  contact: 'Telepon (0283) 357311 • Email uptlab@tegal.go.id',
};

export function buildPermintaanPrintHtml(row, type = 'request', options = {}) {
  const baseTitle =
    type === 'invoice'
      ? 'Invoice Pembayaran Permintaan'
      : 'Form Permintaan Pengujian';
  const docTitle =
    typeof options.title === 'string' && options.title.trim()
      ? options.title
      : baseTitle;
  const titleLines = Array.isArray(options.titleLines)
    ? options.titleLines.filter(Boolean)
    : String(docTitle)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
  const header = { ...DEFAULT_HEADER, ...(options.header || {}) };
  const logoSrc = options.logoSrc || logoDefault;
  const titleForHead = titleLines.join(' ') || 'Dokumen Permintaan';
  const titleMarkup = (titleLines.length ? titleLines : [titleForHead])
    .map((line) => `<span>${sanitize(line)}</span>`)
    .join('<br />');

  const styles = `
    <style>
      @page { margin: 6mm 12mm 16mm; }
      body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 0; color: #1f2937; }
      .page { padding: 6px 6px 0; }
      .letterhead { display: flex; gap: 16px; align-items: center; padding-bottom: 12px; border-bottom: 2px solid #e5e7eb; margin-bottom: 16px; }
      .letterhead img { width: 72px; height: 72px; object-fit: contain; }
      .letterhead h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; }
      .letterhead p { margin: 2px 0; font-size: 12px; color: #4b5563; }
      h2 { margin-top: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.08em; color: #111827; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
      .info-table td { padding: 4px 6px; vertical-align: top; }
      .info-table td:first-child { width: 32%; color: #6b7280; font-weight: 600; }
      .items-table th, .items-table td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
      .items-table th { background: #f3f4f6; text-transform: uppercase; font-size: 11px; color: #374151; }
      .totals { margin-top: 12px; width: 50%; float: right; border: 1px solid #d1d5db; border-collapse: collapse; }
      .totals td { padding: 8px; border: 1px solid #d1d5db; }
      .totals td:first-child { background: #f9fafb; font-weight: 600; width: 60%; }
      .notes { clear: both; margin-top: 32px; font-size: 12px; }
      .signature { margin-top: 48px; display: flex; justify-content: flex-end; font-size: 12px; }
      .signature div { text-align: center; }
    </style>
  `;

  const letterheadTitle = toLineMarkup(header.title);
  const letterheadSubtitle = toLineMarkup(header.subtitle);
  const letterhead = `
    <header class="letterhead">
      <img src="${logoSrc}" alt="Logo Dinas Kabupaten Tegal" />
      <div>
        <h1>${letterheadTitle}</h1>
        <p>${letterheadSubtitle}</p>
        <p>${sanitize(header.address)}</p>
        <p>${sanitize(header.contact)}</p>
      </div>
    </header>
  `;

  const infoTable = buildInfoTable(row, type);
  const itemsTable = buildItemsTable(row);
  const totalsSection = type === 'invoice' ? buildTotalsSection(row) : '';
  const notesSection = buildNotes(type);
  const signature = `
    <div class="signature">
      <div>
        <p>Tegal, ${formatFullDate(row.entryDate)}</p>
        <p>Kepala UPT Lab</p>
        <br /><br /><br />
        <p><strong>___________________________</strong></p>
      </div>
    </div>
  `;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${sanitize(titleForHead)}</title>
        ${styles}
      </head>
      <body>
        <div class="page">
        ${letterhead}
        <h2>${titleMarkup}</h2>
        ${infoTable}
        ${itemsTable}
        ${totalsSection}
        ${notesSection}
        ${signature}
        </div>
      </body>
    </html>
  `;
}

function buildInfoTable(row, type) {
  const info = [
    ['ID Order', row.idOrder || '-'],
    ['Nomor Order', formatOrderNumber(row)],
    ['Tanggal Masuk', formatFullDate(row.entryDate)],
    ['Nama Customer', row.customerName || '-'],
    ['Kontak', row.phoneNumber || '-'],
    ['Alamat', row.address || '-'],
  ];
  if (type === 'invoice') {
    info.push(['Status Pembayaran', translateStatus(row.status)]);
  }
  return `
    <table class="info-table">
      ${info
        .map(
          ([label, value]) => `
            <tr>
              <td>${label}</td>
              <td>${sanitize(value)}</td>
            </tr>
          `,
        )
        .join('')}
    </table>
  `;
}

function buildItemsTable(row) {
  const items = row.testItems || [];
  if (!items.length) {
    return `<p>Tidak ada data pengujian.</p>`;
  }
  return `
    <table class="items-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Jenis Pengujian</th>
          <th>Objek Uji</th>
          <th>Qty</th>
          <th>Tarif (Rp)</th>
          <th>Subtotal (Rp)</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map((item, idx) => {
            const quantity = Math.max(1, Number(item.quantity) || 1);
            const price = Math.max(0, Number(item.price) || 0);
            const subtotal = quantity * price;
            return `
              <tr>
                <td>${idx + 1}</td>
                <td>${sanitize(item.testName || '-')}</td>
                <td>${sanitize(item.objectName || '-')}</td>
                <td>${quantity}</td>
                <td>${formatNumber(price)}</td>
                <td>${formatNumber(subtotal)}</td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

function buildTotalsSection(row) {
  const items = row.testItems || [];
  const total = items.reduce((sum, item) => {
    const quantity = Math.max(1, Number(item.quantity) || 1);
    const price = Math.max(0, Number(item.price) || 0);
    return sum + quantity * price;
  }, 0);
  const paid = Number(row.paymentInfo?.amountPaid || 0);
  const outstanding = Math.max(0, total - paid);

  return `
    <table class="totals">
      <tr>
        <td>Total Tagihan</td>
        <td>${formatNumber(total)}</td>
      </tr>
      <tr>
        <td>Pembayaran Diterima</td>
        <td>${formatNumber(paid)}</td>
      </tr>
      <tr>
        <td>Sisa Pembayaran</td>
        <td>${formatNumber(outstanding)}</td>
      </tr>
    </table>
  `;
}

function buildNotes(type) {
  if (type === 'invoice') {
    return `
      <section class="notes">
        <strong>Catatan:</strong>
        <p>Setelah pembayaran diterima, mohon kirimkan bukti pembayaran kepada admin. Sample uji harap dikirim ke Laboratorium UPT Lab di Jalan Raya Dampyak KM 4, Kec. Kramat, Kabupaten Tegal 52181 untuk proses kaji ulang.</p>
      </section>
    `;
  }
  return `
    <section class="notes">
      <strong>Catatan:</strong>
      <p>Form permintaan ini menjadi dasar pelaksanaan pengujian. Pastikan data pengujian dan objek uji telah sesuai dengan kebutuhan lapangan.</p>
    </section>
  `;
}

function formatOrderNumber(row) {
  if (!row || !row.orderNumber) return '-';
  const year =
    row.orderYear ||
    (row.entryDate ? new Date(row.entryDate).getFullYear() : '');
  return year ? `${row.orderNumber}/${year}` : String(row.orderNumber);
}

export function formatCurrency(value) {
  return `Rp ${formatNumber(value)}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('id-ID');
}

export function formatFullDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function translateStatus(status) {
  switch (status) {
    case 'pending_payment':
      return 'Menunggu Pembayaran';
    case 'payment_pending_review':
      return 'Menunggu Review Pembayaran';
    case 'payment_verified':
      return 'Pembayaran Terverifikasi';
    case 'payment_review_rejected':
      return 'Bukti Pembayaran Ditolak';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return 'Draft';
  }
}

function sanitize(value) {
  if (value === null || value === undefined) return '-';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toLineMarkup(value) {
  const lines = String(value || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) {
    return sanitize(value);
  }
  return lines.map((line) => `<span>${sanitize(line)}</span>`).join('<br />');
}

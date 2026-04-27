// GatepassTemplate.js
// Generates an HTML string for expo-print

export const generateGatepassHTML = ({ visitor, qrCodeDataUrl, photoDataUrl }) => {
  const formatDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  };

  const photoSection = photoDataUrl
    ? `<img src="${photoDataUrl}" alt="Visitor Photo" class="photo" />`
    : `<div class="photo-placeholder">No Photo</div>`;

  const qrSection = qrCodeDataUrl
    ? `<img src="${qrCodeDataUrl}" alt="QR Code" class="qr" />`
    : `<div class="qr-placeholder">QR</div>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Visitor Gatepass – ${visitor.gatepassNumber}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    background: #f0f4f8;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 24px;
  }
  .pass {
    background: #ffffff;
    width: 720px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(29, 78, 216, 0.15);
    border: 1px solid #dbeafe;
  }
  .header {
    background: linear-gradient(135deg, #1D4ED8 0%, #1e40af 100%);
    padding: 24px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .company-brand { color: #fff; }
  .company-name { font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
  .company-sub { font-size: 11px; opacity: 0.75; margin-top: 2px; letter-spacing: 2px; text-transform: uppercase; }
  .pass-label {
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px;
    padding: 8px 18px;
    text-align: center;
  }
  .pass-label-title { color: #fff; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8; }
  .pass-label-num { color: #BFDBFE; font-size: 14px; font-weight: 700; margin-top: 2px; letter-spacing: 1px; }

  .body { display: flex; padding: 28px 32px; gap: 28px; }

  .left { display: flex; flex-direction: column; align-items: center; gap: 16px; min-width: 160px; }
  .photo {
    width: 140px; height: 160px;
    border-radius: 10px;
    object-fit: cover;
    border: 3px solid #BFDBFE;
    box-shadow: 0 2px 8px rgba(29,78,216,0.12);
  }
  .photo-placeholder {
    width: 140px; height: 160px;
    border-radius: 10px;
    background: #EFF6FF;
    border: 2px dashed #93C5FD;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #93C5FD;
    font-size: 13px;
  }
  .qr { width: 110px; height: 110px; border-radius: 8px; border: 2px solid #E5E7EB; }
  .qr-placeholder {
    width: 110px; height: 110px;
    background: #F3F4F6;
    border-radius: 8px;
    border: 2px dashed #D1D5DB;
    display: flex; align-items: center; justify-content: center;
    color: #9CA3AF; font-size: 12px;
  }
  .qr-label { font-size: 10px; color: #6B7280; text-align: center; letter-spacing: 1px; text-transform: uppercase; }

  .right { flex: 1; }
  .visitor-name { font-size: 26px; font-weight: 800; color: #111827; margin-bottom: 4px; }
  .visitor-company { font-size: 14px; color: #3B82F6; font-weight: 600; margin-bottom: 16px; }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .info-item {}
  .info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9CA3AF; margin-bottom: 3px; }
  .info-value { font-size: 13px; color: #1F2937; font-weight: 600; }

  .purpose-box {
    background: #EFF6FF;
    border-left: 4px solid #1D4ED8;
    border-radius: 0 8px 8px 0;
    padding: 10px 14px;
    margin-bottom: 16px;
  }
  .purpose-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #6B7280; margin-bottom: 3px; }
  .purpose-value { font-size: 13px; color: #1D4ED8; font-weight: 600; }

  .status-badge {
    display: inline-block;
    background: #D1FAE5;
    color: #065F46;
    border: 1px solid #6EE7B7;
    border-radius: 20px;
    padding: 4px 14px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .footer {
    background: #F8FAFC;
    border-top: 2px dashed #DBEAFE;
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .footer-col { }
  .footer-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #9CA3AF; margin-bottom: 3px; }
  .footer-value { font-size: 12px; color: #374151; font-weight: 600; }

  .disclaimer {
    background: #1D4ED8;
    color: rgba(255,255,255,0.7);
    text-align: center;
    font-size: 10px;
    padding: 8px;
    letter-spacing: 0.5px;
  }
</style>
</head>
<body>
<div class="pass">
  <div class="header">
    <div class="company-brand">
      <div class="company-name">🏢 CorpGuard VMS</div>
      <div class="company-sub">Visitor Management System</div>
    </div>
    <div class="pass-label">
      <div class="pass-label-title">Gatepass No.</div>
      <div class="pass-label-num">${visitor.gatepassNumber}</div>
    </div>
  </div>

  <div class="body">
    <div class="left">
      ${photoSection}
      ${qrSection}
      <div class="qr-label">Scan at Exit</div>
    </div>
    <div class="right">
      <div class="visitor-name">${visitor.name}</div>
      <div class="visitor-company">${visitor.company}</div>

      <div class="purpose-box">
        <div class="purpose-label">Purpose of Visit</div>
        <div class="purpose-value">${visitor.purpose}</div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Host Name</div>
          <div class="info-value">${visitor.host}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Department</div>
          <div class="info-value">${visitor.department}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Phone</div>
          <div class="info-value">${visitor.phone}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Visitor ID</div>
          <div class="info-value">${visitor.id}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Check-In Time</div>
          <div class="info-value">${formatDate(visitor.checkInAt)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value"><span class="status-badge">✓ On Premises</span></div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-col">
      <div class="footer-label">Pre-Registered</div>
      <div class="footer-value">${formatDate(visitor.preRegisteredAt)}</div>
    </div>
    <div class="footer-col">
      <div class="footer-label">Checked In</div>
      <div class="footer-value">${formatDate(visitor.checkInAt)}</div>
    </div>
    <div class="footer-col">
      <div class="footer-label">Valid For</div>
      <div class="footer-value">Single Day Entry</div>
    </div>
    <div class="footer-col">
      <div class="footer-label">Issued By</div>
      <div class="footer-value">Security Desk</div>
    </div>
  </div>

  <div class="disclaimer">
    This pass is property of the issuing organization. Please wear it visibly at all times. Unauthorized use is prohibited.
  </div>
</div>
</body>
</html>
  `;
};
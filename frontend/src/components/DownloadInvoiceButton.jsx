import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DownloadInvoiceButton = ({ invoice }) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    setLoading(true);

    try {
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '800px';
      printContainer.style.background = '#ffffff';
      printContainer.style.color = '#1e293b';
      printContainer.style.fontFamily = '"Poppins", sans-serif';
      printContainer.style.padding = '40px';
      printContainer.style.boxSizing = 'border-box';

      printContainer.innerHTML = `
        <div style="border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="color: #2563EB; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.5px;">TRACKFLOW</h1>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 10px; font-weight: 800; text-transform: uppercase;">Logistics & Courier Delivery Portal</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 700;">INVOICE</h2>
            <p style="margin: 4px 0 0 0; color: #64748b; font-size: 14px; font-weight: 700;"># ${invoice.invoiceId}</p>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; line-height: 1.6;">
          <div>
            <h4 style="margin: 0 0 8px 0; color: #2563EB; font-weight: 700; text-transform: uppercase; font-size: 12px;">Billed To:</h4>
            <strong>${invoice.customer?.name || 'Jane Customer'}</strong><br/>
            Email: ${invoice.customer?.email || 'customer@tracknow.com'}<br/>
            Address: ${invoice.billingAddress?.text || 'Whitefield, Bengaluru'}<br/>
          </div>
          <div style="text-align: right;">
            <h4 style="margin: 0 0 8px 0; color: #2563EB; font-weight: 700; text-transform: uppercase; font-size: 12px;">Invoice Details:</h4>
            Date: ${new Date(invoice.date).toLocaleDateString()}<br/>
            Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}<br/>
            Status: <span style="font-weight: 700; color: ${invoice.status === 'Paid' ? '#10B981' : invoice.status === 'Pending' ? '#F59E0B' : '#EF4444'};">${invoice.status}</span><br/>
            Payment Method: ${invoice.paymentMethod}<br/>
          </div>
        </div>

        <div style="margin-bottom: 30px; font-size: 14px; line-height: 1.6;">
          <h4 style="margin: 0 0 8px 0; color: #2563EB; font-weight: 700; text-transform: uppercase; font-size: 12px;">Delivery Destination:</h4>
          Address: ${invoice.deliveryAddress?.text || 'N/A'}<br/>
          Tracking Reference ID: ${invoice.trackingId || 'N/A'}<br/>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
          <thead>
            <tr style="border-bottom: 2px solid #cbd5e1; text-align: left; font-weight: 700; color: #2563EB;">
              <th style="padding: 12px 8px;">Description</th>
              <th style="padding: 12px 8px; text-align: center;">Qty</th>
              <th style="padding: 12px 8px; text-align: right;">Unit Price</th>
              <th style="padding: 12px 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 8px;">
                <strong>Logistics Shipping Services</strong><br/>
                <span style="font-size: 11px; color: #64748b;">Route Distance Manifest Delivery Package</span>
              </td>
              <td style="padding: 12px 8px; text-align: center;">1</td>
              <td style="padding: 12px 8px; text-align: right;">$${Number(invoice.subtotal).toFixed(2)}</td>
              <td style="padding: 12px 8px; text-align: right;">$${Number(invoice.subtotal).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; justify-content: flex-end;">
          <table style="width: 300px; font-size: 14px; line-height: 2;">
            <tr>
              <td style="color: #64748b;">Subtotal:</td>
              <td style="text-align: right; font-weight: 600;">$${Number(invoice.subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">Delivery Charge:</td>
              <td style="text-align: right; font-weight: 600;">$${Number(invoice.deliveryCharge).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="color: #64748b;">GST / Tax:</td>
              <td style="text-align: right; font-weight: 600;">$${Number(invoice.tax).toFixed(2)}</td>
            </tr>
            ${invoice.discount > 0 ? `
            <tr>
              <td style="color: #EF4444;">Discount (${invoice.couponCode || 'Promo'}):</td>
              <td style="text-align: right; font-weight: 600; color: #EF4444;">-$${Number(invoice.discount).toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr style="border-top: 2px solid #cbd5e1; font-size: 16px; font-weight: 800;">
              <td style="padding-top: 8px; color: #2563EB;">Total Amount:</td>
              <td style="padding-top: 8px; text-align: right; color: #2563EB;">$${Number(invoice.totalAmount).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div style="margin-top: 50px; border-top: 1px dashed #cbd5e1; padding-top: 20px; text-align: center; color: #64748b; font-size: 12px;">
          <p style="margin: 0 0 6px 0;">Thank you for doing business with <strong>TrackFlow</strong>.</p>
          <p style="margin: 0;">For billing disputes, contact support@trackflow.com</p>
        </div>
      `;

      document.body.appendChild(printContainer);

      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(printContainer);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice_${invoice.invoiceId}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF invoice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DownloadIcon />}
      disabled={loading}
      onClick={handleDownloadPDF}
      sx={{
        fontWeight: 700,
        textTransform: 'none',
        borderRadius: '8px'
      }}
    >
      {loading ? 'Downloading...' : 'Download PDF'}
    </Button>
  );
};

export default DownloadInvoiceButton;

const crypto = require('crypto');

function buildMockPixCharge({ amount, description, payerEmail, paymentId }) {
  const externalReference = `startfit-${paymentId}-${Date.now()}`;
  const qrCode = `00020126580014br.gov.bcb.pix0136startfit-demo-${paymentId}520400005303986540${amount.toFixed(2).replace('.', '')}5802BR5910STARTFIT6009SAOPAULO62070503***6304DEMO`;
  return {
    provider: 'mock',
    externalReference,
    status: 'action_required',
    statusDetail: 'waiting_transfer',
    amount,
    payerEmail,
    ticketUrl: '',
    qrCode,
    qrCodeBase64: '',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    instructions: `Pix de demonstracao gerado para ${description}. Configure MERCADO_PAGO_ACCESS_TOKEN para cobranca real.`,
    createdAt: new Date(),
  };
}

async function createPixCharge({ amount, description, payerEmail, paymentId }) {
  const accessToken = (process.env.MERCADO_PAGO_ACCESS_TOKEN || '').trim();

  if (!accessToken) {
    return buildMockPixCharge({ amount, description, payerEmail, paymentId });
  }

  const idempotencyKey = crypto.randomUUID();
  const externalReference = `startfit-${paymentId}-${Date.now()}`;
  const response = await fetch('https://api.mercadopago.com/v1/orders', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      'X-Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify({
      type: 'online',
      total_amount: amount.toFixed(2),
      external_reference: externalReference,
      processing_mode: 'automatic',
      transactions: {
        payments: [
          {
            amount: amount.toFixed(2),
            payment_method: { id: 'pix', type: 'bank_transfer' },
            expiration_time: 'PT30M',
          },
        ],
      },
      payer: { email: payerEmail },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.message || data?.error || 'Falha ao criar cobranca Pix.';
    throw new Error(message);
  }

  const payment = data?.transactions?.payments?.[0];
  return {
    provider: 'mercado_pago',
    externalReference,
    orderId: data.id,
    status: payment?.status || data.status,
    statusDetail: payment?.status_detail || data.status_detail,
    amount,
    payerEmail,
    ticketUrl: payment?.payment_method?.ticket_url || '',
    qrCode: payment?.payment_method?.qr_code || '',
    qrCodeBase64: payment?.payment_method?.qr_code_base64 || '',
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    instructions: 'Escaneie o QR Code ou copie o codigo Pix para concluir o pagamento.',
    createdAt: new Date(),
  };
}

module.exports = { createPixCharge };

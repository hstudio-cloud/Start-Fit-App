const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true },
    referenceMonth: { type: Number, required: true }, // 1-12
    referenceYear: { type: Number, required: true },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date, default: null },
    status: { type: String, enum: ['pendente', 'pago', 'vencido', 'cancelado'], default: 'pendente' },
    paymentMethod: { type: String, enum: ['dinheiro', 'pix', 'cartao', 'boleto'], default: 'pix' },
    notes: { type: String, default: '' },
    pixCharge: {
      provider: { type: String, default: '' },
      externalReference: { type: String, default: '' },
      orderId: { type: String, default: '' },
      status: { type: String, default: '' },
      statusDetail: { type: String, default: '' },
      ticketUrl: { type: String, default: '' },
      qrCode: { type: String, default: '' },
      qrCodeBase64: { type: String, default: '' },
      instructions: { type: String, default: '' },
      expiresAt: { type: Date, default: null },
      createdAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Auto-update status based on due date
paymentSchema.pre('save', function (next) {
  if (this.status === 'pendente' && new Date() > this.dueDate) {
    this.status = 'vencido';
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

const mongoose = require('mongoose');

const paymentSchema = mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    user_type: {type: String, required: true}, // serviceProvider / firmOwner
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    payments: {type: [{
        month: Number,
        year: Number,
        amount: Number,
        due: Number,
        pay_date: Date
    }]},
  },
  { collection: 'Payment' }
);


module.exports = mongoose.model('Payment', paymentSchema);

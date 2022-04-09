const mongoose = require('mongoose');

const servicetasksSchema = mongoose.Schema(
  {
    task_id: { type: String, required: true, unique: true },
    task_name: { type: String, required: true },
    description: { type: String },
    service_category: { type: String, required: true },
    rate: { type: Number, required: true },
    rate_type: { type: String, required: true },
    pay_on_meet: { type: Boolean, required: true, default: false },
    image_01: { type: String },
    image_02: { type: String },
    image_03: { type: String },
    user_id: { type: String, ref: 'Merchant', required: true }, // foreign key reference
  },
  { collection: 'Service' }
);

module.exports = mongoose.model('Service', servicetasksSchema);

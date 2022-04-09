const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const customerSchema = mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    user_type: {type: String, required: true},
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    profile_pic: { type: String },
    email: { type: String, required: true, unique: true },
    contact_no: { type: String, required: true },
    address_line1: { type: String, required: true },
    address_line2: { type: String },
    gender: {type: String, required: true},
    reg_date: { type: String, required: true },
  },
  { collection: 'Customer' }
);

customerSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Customer', customerSchema);

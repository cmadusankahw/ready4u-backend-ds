const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const serviceproviderSchema = mongoose.Schema(
  {
    user_id: { type: String, required: true, unique: true },
    user_type: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    profile_pic: { type: String },
    nic: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contact_no: { type: String, required: true },
    rating: {type: Number},
    service_category: { type: String, required: true }, //nested tasks  service order
    address_line1: { type: String, required: true },
    address_line2: { type: String },
    district: { type: String, required: true },
    gender: { type: String, required: true, default: 'none' },
    date_of_birth: { type: String },
    reg_date: { type: String, required: true },
    tasks: { type: [{
      id: String,
      task: String,
      rate:  Number,
      rate_type: String,
      rating: Number
    }], required: true },
    isavailable: { type: Boolean, required: true, default: true },
    location: {type: {
      latitude: Number,
      longtitude: Number,
      town: String
    }},
    firm: { type : {
      owner: Boolean,
      firm_id: String,
      firm_name: String
    }}
  },
  { collection: 'ServiceProvider' }
);

serviceproviderSchema.plugin(uniqueValidator);

module.exports = mongoose.model('ServiceProvider', serviceproviderSchema);

const mongoose = require('mongoose');
const { stringify } = require('querystring');

const orderSchema = mongoose.Schema(
  {
    order_id:  {type: String, required: true},
    ordered_time:  {type: Date, required: true},
    service_category:  {type: String, required: true},
    description: {type: String },
    image1:  {type:String},
    image2:  {type: String},
    image3:  {type: String},
    task:{type : {
        id: String,
        task: String,
        rate: Number,
        rate_type: String,
        rating: Number,
    }, required: true},
    state:  {type: String, required: true},
    total_amount_charged: {type: Number, required: true},
    service_provider: { type:{
        user_id: String,
        firm_id: String,
        service_provider_name: String,
        email: String,
        profile_pic: String,
    }, required: true},
    customer:{ type:  { 
        user_id: String,
        customer_name: String,
        email: String,
        profile_pic: String,
    }, required: true}
},
  { collection: 'Order' }
);

module.exports = mongoose.model('Order', orderSchema);


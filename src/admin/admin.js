//model imports
const ServicemCategory = require('../../models/services/s_categories.model');
const Order = require ('../../models/services/order.model');
const ServiceProvider = require('../../models/auth/serviceprovider.model');
const Customer = require('../../models/auth/customer.model');
const FirmOwner = require('../../models/auth/firmowner.model');
const Payment = require('../../models/admin/payments.model');
const checkAuth = require('../../middleware/auth-check');

//dependency imports
const express = require('express');
const bodyParser = require('body-parser');
const cron = require("node-cron"); 

//express app declaration
const admin = express();
const multer = require ("multer");


// multer setup for image upload
const MIME_TYPE_MAP = {
    'image/png' : 'png',
    'image/jpeg' : 'jpg',
    'image/jpg' : 'jpg',
    'image/gif' : 'gif'
  };
  const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
      const isValid = MIME_TYPE_MAP[file.mimetype];
      let error= new Error("Invalid Image");
      if(isValid){
        error=null;
      }
      cb(error,"src/assets/images");
    },
    filename: (req, file, cb) => {
      const name = file.originalname.toLowerCase().split(' ').join('-');
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, name + '-' + Date.now() + '.' + ext);
    }
  });
  
  

//middleware
admin.use(bodyParser.json());
admin.use(bodyParser.urlencoded({ extended: false }));

// get user data
admin.get('/get/userdata', checkAuth, (req, res, next) => {

var q1 = ServiceProvider.countDocuments();
var q2 = FirmOwner.countDocuments();
var q3 = Customer.countDocuments();

var userData = {
    customers: 0,
    serviceProviders: 0,
    firmOwners: 0
}
q1.exec().then ( (sproviders) => {
    userData.serviceProviders = sproviders;
    q2.exec().then( (firmowners) => {
        userData.firmowners = firmowners;
        q3.exec().then( (customers) => {
            userData.customers = customers;
            res.status(200).json(
                {
                  message: ' userdata recieved successfully!',
                  userData: userData
                }
              );
            }).catch ( err => {
                console.log(err);
                res.status(500).json(
                    {
                      message: ' User Data retrival uncussedssfull!',
                    }
                  );
            });
        }).catch ( err => {
            console.log(err);
            res.status(500).json(
                {
                  message: ' User Data  retrival uncussedssfull!',
                }
              );
        });    
        }).catch ( err => {
            console.log(err);
            res.status(500).json(
                {
                  message: ' User Data  retrival uncussedssfull!',
                }
              );
        });
    });

    // get overall payuments
    
admin.get('/get/payments', checkAuth, (req, res, next) => {
    Payment.find().then ( (payments) => {
        res.status(200).json(
            {
              message: ' Payments List recieved successfully!',
              payments: payments
            }
          );
    }).catch ( err => {
        console.log(err);
        res.status(500).json(
            {
              message: ' Payments List retrival uncussedssfull!',
            }
          );
    });
});

    
// get user payments only
admin.get('/get/userpay', checkAuth, (req, res, next) => {
  Payment.findOne({user_id: req.userData.user_id}).then ( (payment) => {
      res.status(200).json(
          {
            message: ' Payment details recieved successfully!',
            payment: payment
          }
        );
  }).catch ( err => {
      console.log(err);
      res.status(500).json(
          {
            message: ' Payment details retrival uncussedssfull! Please try again',
          }
        );
  });
});



    
// get order data
admin.get('/get/orderdata', checkAuth, (req, res, next) => {

    var q1 = Order.countDocuments({state: 'ongoing'});
    var q2 = Order.countDocuments({state: 'completed'});
    var q3 = Order.countDocuments({state: 'cancelled'});
    
    var orderData = {
        ongoing: 0,
        completed: 0,
        cancelled: 0
    }
    
    q1.exec().then ( (on) => {
        orderData.ongoing = on;
        q2.exec().then( (com) => {
            orderData.completed = com;
            q3.exec().then( (can) => {
                orderData.cancelled = can;
                res.status(200).json(
                    {
                      message: ' orderData recieved successfully!',
                      orderData: orderData
                    }
                  );
                }).catch ( err => {
                    console.log(err);
                    res.status(500).json(
                        {
                          message: ' orderData retrival uncussedssfull!',
                        }
                      );
                });
            }).catch ( err => {
                console.log(err);
                res.status(500).json(
                    {
                      message: 'orderData  retrival uncussedssfull!',
                    }
                  );
            });    
            }).catch ( err => {
                console.log(err);
                res.status(500).json(
                    {
                      message: ' orderData  retrival uncussedssfull!',
                    }
                  );
            });
        });
    
// create a payment by user
   
// get firm member orders
admin.post('/add/userpay', checkAuth, (req, res, next) => {
  var pay;
  var payIndex = -1;
  Payment.findOne({user_id: req.userData.user_id}).then ( (payment) => {
    pay = payment;
      for (let p of pay.payments) {
        payIndex++;
      }
      pay.payments[payIndex].due -= req.body.payment;
      pay.payments[payIndex].amount  += req.body.payment;
      pay.payments[payIndex].paid_date = new Date().toISOString();
      console.log('final payments :',pay.payments);
      // saving final payment
      const newPay = new Payment(pay);
      newPay.save().then( result => {
        res.status(200).json(
          {
            message: ' Payment added successfully!',
          }
        );
      }).catch ( err => {
        console.log(err);
        res.status(500).json(
            {
              message: ' Payments adding was unsuccesssfull!',
            }
          );
    }); 
  }).catch ( err => {
      console.log(err);
      res.status(500).json(
          {
            message: ' Payments adding was unsuccesssfull!',
          }
        );
  });
});



// deduct user subscription fee on a scheduled way
cron.schedule("* * 28 * *", function() {

  Payment.find().then( result => {
    var pays = result;
    var mI = 0;
    var pI = 0;
    var due = 0;
    var month;
    var year;
    for(let m of pays) {
        for(let p of pays.payments) {
              due += p.due;
              month = p.month;
              year = p.year;
              pI++;
            }
            // deduct due amount and pass to the latest month
            for (let i =0; i< pI; i++){
              pays[i].due = 0;
            }
            // create new entry to hold updated payment details
            pays.payments[pI]= {
              due: due,
              amount: 0,
              pay_date: null,
              year: year,
              month: month +1,
            }
            mI++;
      }
    console.log(pays);
    Payment.update({},{
      pays
    }).then ( (res2) => {
      console.log(res2);
    }).catch ( err => {
      console.log(err);
    })
  }).catch( err => {
    console.log(err);
  })
});





module.exports = admin;

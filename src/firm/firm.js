//model imports
const Order = require ('../../models/services/order.model');
const ServiceProvider = require('../../models/auth/serviceprovider.model');
const FirmOwner = require('../../models/auth/firmowner.model');
const checkAuth = require('../../middleware/auth-check');

//dependency imports
const express = require('express');
const bodyParser = require('body-parser');

//express app declaration
const firm = express();
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
firm.use(bodyParser.json());
firm.use(bodyParser.urlencoded({ extended: false }));

// get firm member orders
firm.get('/get/orders', checkAuth, (req, res, next) => {
  FirmOwner.findOne({user_id: req.userData.user_id}).then( (fowner) => {
    Order.find({'service_provider.firm_id': fowner.firm.firm_id}).then ( (sproviders) => {
      res.status(200).json(
          {
            message: 'Orders List recieved successfully!',
            orders: sproviders
          }
        );
  }).catch ( err => {
      console.log(err);
      res.status(500).json(
          {
            message: ' Orders List retrival uncussedssfull!',
          }
        );
  });
  }).catch ( err => {
    console.log(err);
    res.status(500).json(
        {
          message: ' Orders List retrival uncussedssfull!',
        }
      );
});
});


  firm.get('/get/order/:id', (req, res, next) => {
    Order.findOne({order_id: req.params.id} ,function (err, order) {
      console.log(order);
      if (err) return handleError(err => {
          console.log(err);
        res.status(500).json(
          { message: 'No  Orders Found! Please try again!'}
          );
      });
      res.status(200).json(
        {
          message: ' Order recieved successfully!',
          order: order
        }
      );
    });
  });

  // get list of service providers names
  firm.get('/get/spnames', checkAuth, (req, res, next) => {
    FirmOwner.findOne({user_id: req.userData.user_id}).then( (fowner) => {
        ServiceProvider.find({'firm.firm_id': fowner.firm.firm_id}).select('first_name last_name').then ( (sproviders) => {
            res.status(200).json(
                {
                  message: ' Service Provider List recieved successfully!',
                  spnames: sproviders
                }
              );
        }).catch ( err => {
            console.log(err);
            res.status(500).json(
                {
                  message: ' Service Provider List retrival uncussedssfull!',
                }
              );
        });
      }).catch ( err => {
        console.log(err);
        res.status(500).json(
            {
              message: ' Service Provider List retrival uncussedssfull!',
            }
          );
    });    
  });

  // get list of service providers
  firm.get('/get/sproviders/:id', checkAuth, (req, res, next) => {
        ServiceProvider.find({'firm.firm_id': req.params.id}).then ( (sproviders) => {
            res.status(200).json(
                {
                  message: ' Service Provider List recieved successfully!',
                  serviceproviders: sproviders
                }
              );
        }).catch ( err => {
            console.log(err);
            res.status(500).json(
                {
                  message: ' Service Provider List retrival uncussedssfull!',
                }
              );
        });
     
    });



module.exports = firm;

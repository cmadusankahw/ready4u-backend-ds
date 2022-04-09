//model imports
const ServiceCategory = require('../../models/services/s_categories.model');
const Order = require ('../../models/services/order.model');
const Customer = require ('../../models/auth/customer.model.js');
const ServiceProvider = require ('../../models/auth/serviceprovider.model');
const checkAuth = require('../../middleware/auth-check');

//dependency imports
const express = require('express');
const bodyParser = require('body-parser');

//express app declaration
const service = express();
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
service.use(bodyParser.json());
service.use(bodyParser.urlencoded({ extended: false }));


// get servuice categories
service.get('/cat', (req, res, next) => {
    ServiceCategory.find(function (err, services) {
      console.log(services);
      if (err) return handleError(err => {
          console.log(err);
        res.status(500).json(
          { message: 'No Service Categories Found! Please try again!'}
          );
      });
      res.status(200).json(
        {
          message: 'Categories list recieved successfully!',
          categories: services
        }
      );
    });
  });

  // get a specific order
  service.get('/order/get/:id',checkAuth, (req, res, next) => {
    Order.findOne({order_id: req.params.id}).then ( (order) => {
      console.log(order);
      res.status(200).json(
        {
          message: ' Order recieved successfully!',
          order: order
        }
      );
    }).catch ( err => {
      console.log(err);
      res.status(500).json(
        { message: 'No  Orders Found! Please try again!'}
        );
    })
  });

  // get all orders of service provider
  service.get('/orders/get',checkAuth, (req, res, next) => {
    Order.find({'service_provider.user_id': req.userData.user_id}).then (( resorders) => {
      console.log(resorders);
      res.status(200).json(
        {
          message: ' Order recieved successfully!',
          orders: resorders
        }
      );
    }).catch ( err => {
      console.log(err);
      res.status(500).json(
        { message: 'No  Orders Found! Please try again!'}
        );
    })
  });


    // get all orders of customer
    service.get('/orders/cust',checkAuth, (req, res, next) => {
      Order.find({'customer.user_id': req.userData.user_id}).then (( resorders) => {
        console.log(resorders);
        res.status(200).json(
          {
            message: ' Order recieved successfully!',
            orders: resorders
          }
        );
      }).catch ( err => {
        console.log(err);
        res.status(500).json(
          { message: 'No  Orders Found! Please try again!'}
          );
      })
    });
  
 // get current order !!!! realtime
  service.get('/order/current', checkAuth, (req, res, next) => {
    Order.findOne({'service_provider.user_id': req.userData.user_id, state: 'ongoing'}).then( (order) => {
      console.log(order);
      res.status(200).json(
        {
          message: ' Order recieved successfully!',
          order: order
        }
      );
    }).catch ( err => {
      console.log(err);
      res.status(500).json(
        { message: 'Order not Found! Please try again!'}
        );
    })
  });

   
 // change order state to cancelled, if rejected
 service.post('/order/update', checkAuth, (req, res, next) => {
  Order.updateOne({'service_provider.user_id': req.userData.user_id, state: 'ongoing'} , {
    state: req.body.state
  }).then( () => {
      ServiceProvider.updateOne({'user_id': req.userData.user_id}, {
        isavailable : true
      }).then( () => {
        res.status(200).json(
          {
            message: ' Order cancelled!',
          });
    }).catch ( err => {
      console.log(err);
      res.status(500).json(
        { message: 'Error in cancellation! Please try again!'}
        );
    });
  }).catch ( err => {
    console.log(err);
    res.status(500).json(
      { message: 'Error in cancellation! Please try again!'}
      );
  });
});

 // change order state to cancelled, if rejected
 service.post('/order/complete', checkAuth, (req, res, next) => {
  Order.updateOne({'service_provider.user_id': req.userData.user_id, state: 'ongoing'} , {
    state: req.body.state,
    total_amount_charged: req.body.amount
  }).then( () => {
      ServiceProvider.updateOne({'user_id': req.userData.user_id}, {
        isavailable : true
      }).then( () => {
        res.status(200).json(
          {
            message: ' Order completed!',
          });
    }).catch ( err => {
      console.log(err);
      res.status(500).json(
        { message: 'Error in completion! Please try again!'}
        );
    });
  }).catch ( err => {
    console.log(err);
    res.status(500).json(
      { message: 'Error in completion! Please try again!'}
      );
  });
});



// add new order
service.post('/order/add',checkAuth, (req, res, next) => {
  var lid;
  var reqOrder = req.body;
  Order.find(function (err, services) {
    if(services.length){
      lid = services[services.length-1].order_id;
    } else {
      lid= 'ORDER0';
    }
    let mId = +(lid.slice(5));
    ++mId;
    lid = 'ORDER' + mId.toString();
    console.log(lid);
    if (err) return handleError(err => {
      console.log(err);
      res.status(500).json({
        message: 'Error occured while getting order ID!'
      });
    });
    reqOrder['order_id']= lid;
  }).then( () => {
    Customer.findOne({user_id: req.userData.user_id}).then ( cust => {    
        reqOrder['customer']= {
          user_id: req.userData.user_id,
          customer_name: cust.first_name + ' ' + cust.last_name,
          email: req.userData.email,
        }
        const newOrder = new Order(reqOrder);
        console.log(newOrder);
        newOrder.save()
        .then(result => {
            res.status(200).json({
              message: 'order added successfully!',
              result: result
            });
          })
          .catch(err=>{
            console.log(err);
            res.status(500).json({
              message: 'Order was unsuccessfull! Please try Again!'
            });
          });
    }).catch(err=>{
      console.log(err);
      res.status(500).json({
        message: 'Order was unsuccessfull! Please try Again!'
      });
    });
  
  }).catch(err=>{
    console.log(err);
    res.status(500).json({
      message: 'Order was unsuccessfull! Please try Again!'
    });
  });
});

// add order images
service.post('/order/img',checkAuth, multer({storage:storage}).array("images[]"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  let imagePaths = [];
  for (let f of req.files){
    imagePaths.push(url+ "/images/" + f.filename);
  }
  res.status(200).json({imagePaths: imagePaths});

});

// manage service categories
service.post('/cat/create', (req, res, next) => {
  var category = new ServiceCategory(req.body);
  category.save().then(  (category)=> {
    console.log(category);
    res.status(200).json(
      {
        message: 'service category added successfully!',
      }
    );
  }).catch((err) => {
    console.log(err);
    res.status(500).json({ message: "service category was not added! Please try again!" });
  })
});

// remove event category
service.get('/cat/remove/:id',checkAuth, (req, res, next) => {
  ServiceCategory.deleteOne({'id': req.params.id}).then(
    result => {
      console.log(result);
      res.status(200).json({ message: "service category removed!" });
    }
  ).catch((err) => {
    console.log(err);
    res.status(500).json({ message: "service category was not removed! Please try again!" });
  })
});


module.exports = service;

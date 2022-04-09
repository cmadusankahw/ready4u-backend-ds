
const User = require('../../models/auth/user.model');
const Customer = require('../../models/auth/customer.model');
const Admin = require('../../models/admin/admin.model');
const ServiceProvider = require('../../models/auth/serviceprovider.model');
const FirmOwner = require('../../models/auth/firmowner.model');
const checkAuth = require('../../middleware/auth-check');

const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require ("multer");
const nodemailer = require("nodemailer");

const auth = express();

// multer setup 
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


auth.use(bodyParser.json());
auth.use(bodyParser.urlencoded({ extended: false }));


auth.post('/signup/user', (req, res, next) => {
  bcrypt.hash(req.body.password, 10).then((hash) => {
    const user = new User({
      user_id: req.body.user_id,
      email: req.body.email,
      user_type: req.body.user_type,
      password: hash,
      state: req.body.state,
    });
    console.log(user);
    user
      .save()
      .then((result) => {
        res.status(200).json({
          message: 'user added successfully!',
          result: result,
        });
      })
      .catch((err) => {
        res.status(500).json({
          message: 'User signup was not successfull! Please try again!',
        });
      });
  });
});


auth.post('/signup/sprovider', (req, res, next) => {
  const serviceprovider = new ServiceProvider(req.body);
  console.log(serviceprovider);
  serviceprovider
    .save()
    .then((result) => {
      res.status(200).json({
        message: 'Service provider added successfully!',
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message:
          'Service provider sign up was not successfull! Please try again!',
      });
    });
});

auth.post('/signup/firmMember',checkAuth, (req, res, next) => {
  const serviceprovider = req.body;
  console.log(serviceprovider);
  var Query = FirmOwner.findOne({user_id: req.userData.user_id}).select('firm');
  Query.exec().then ( (result) => {
    serviceprovider.firm = result.firm;
    serviceprovider.firm.owner = false;
    const sProvider = new ServiceProvider(serviceprovider);
    sProvider
    .save()
    .then((result) => {
      res.status(200).json({
        message: 'Firm Member added successfully!',
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message:
          'Firm Member sign up was not successfull! Please try again!',
      });
    });
  }).catch((err) => {
    console.log(err);
    res.status(500).json({
      message:
        'Firm Member sign up was not successfull! Please try again!',
    });
  });
});

auth.post('/signup/firmOwner', (req, res, next) => {
  const firmOwner = new FirmOwner(req.body);
  firmOwner
    .save()
    .then((result) => {
      res.status(200).json({
        message: 'Firm Owner added successfully!',
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message:
          'Firm Owner sign up was not successfull! Please try again!',
      });
    });
});



auth.post('/signup/customer', (req, res, next) => {
  const customer = new Customer(req.body);
  console.log(customer);
  customer
    .save()
    .then((result) => {
      res.status(200).json({
        message: 'Customer added successfully!',
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Customer Signup was not successful! Please try again!',
      });
    });
});



auth.post('/profile/img',checkAuth, multer({storage:storage}).array("images[]"), (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  imagePath = url+ "/images/" +  req.files[0].filename;
  res.status(200).json({
    profilePic: imagePath
  });
});



//edit merchant
auth.post('/customer/edit',checkAuth, (req, res, next) => {
  Customer.updateOne({ user_id: req.userData.user_id}, {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    user_type: req.body.user_type,
    profile_pic: req.body.profile_pic,
    email: req.body.email,
    contact_no: req.body.contact_no,
    address_line1: req.body.address_line1,
    address_line2: req.body.address_line2,
    gender: req.body.gender,
    location: req.body.location,
  })
  .then((result) => {
    console.log(result);
    res.status(200).json({
      message: 'customer updated successfully!',
    });
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json({
      message: 'Profile Details update unsuccessfull!'
    });
  });
});



//edit admin
auth.post('/admin/edit',checkAuth, (req, res, next) => {
  Admin.updateOne({ user_id: req.userData.user_id}, {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    profile_pic: req.body.profile_pic,
    email: req.body.email,
    contact_no: req.body.contact_no,
    address_line1: req.body.address_line1,
    address_line2: req.body.address_line2,
    gender: req.body.gender,
  })
  .then((result) => {
    console.log(result);
    res.status(200).json({
      message: 'admin updated successfully!',
    });
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json({
      message: 'Profile Details update unsuccessfull!'
    });
  });
});



//edit event planner
auth.post('/sprovider/edit',checkAuth, (req, res, next) => {
  ServiceProvider.updateOne({ user_id: req.userData.user_id}, {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    profile_pic: req.body.profile_pic,
    nic: req.body.nic,
    email: req.body.email,
    contact_no: req.body.contact_no,
    address_line1: req.body.address_line1,
    address_line2: req.body.address_line2,
    district: req.body.district,
    gender: req.body.gender,
    date_of_birth: req.body.date_of_birth,
    tasks: req.body.tasks,
  })
  .then((result) => {
    res.status(200).json({
      message: 'event planner updated successfully!',
    });
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json({
      message: 'Profile Details update unsuccessfull! Please Try Again!'
    });
  });
});



//edit event planner
auth.post('/firmOwner/edit',checkAuth, (req, res, next) => {
  FirmOwner.updateOne({ user_id: req.userData.user_id}, {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    profile_pic: req.body.profile_pic,
    email: req.body.email,
    contact_no: req.body.contact_no,
    address_line1: req.body.address_line1,
    address_line2: req.body.address_line2,
    district: req.body.district,
    gender: req.body.gender,
    date_of_birth: req.body.date_of_birth,
  })
  .then((result) => {
    res.status(200).json({
      message: 'Firm Owner Profile updated successfully!',
    });
  })
  .catch(err=>{
    console.log(err);
    res.status(500).json({
      message: 'Profile Details update unsuccessfull! Please Try Again!'
    });
  });
});

auth.post('/signin', (req, res, next) => {
  let fetchedUser;
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        res.status(401).json({
          message: 'Invalid username or password!',
        });
      }
      fetchedUser = user;
      console.log(user);
      return bcrypt.compare(req.body.password, user.password);
    })
    .then((result) => {
      if (!result) {
        res.status(401).json({
          message: 'Invalid username or password!',
        });
      }
      const token = jwt.sign(
        {
          email: fetchedUser.email,
          user_id: fetchedUser.user_id,
          user_type: fetchedUser.user_type,
        },
        'secret_long_text_asdvBBGH##$$sdddgfg567$33',
        { expiresIn: '1h' }
      );
      res.status(200).json({
        message: 'user authentication successfull!',
        token: token,
        expiersIn: 7200,
        user_type: fetchedUser.user_type,
      });
    })
    .catch((err) => {
      res.status(401).json({
        message: 'Invalid username or password!',
      });
    });
});


auth.get('/last', (req, res, next) => {
  User.find(function (err, users) {
    var lastid;
    if (users.length) {
      lastid = users[users.length - 1].user_id;
    } else {
      lastid = 'U0';
    }
    console.log(lastid);
    if (err) return handleError(err);
    res.status(200).json({
      lastid: lastid,
    });
  });
});


auth.get('/get/sprovider', checkAuth, (req, res, next) => {
  console.log(req.userData);
  ServiceProvider.findOne({ user_id: req.userData.user_id }, function (
    err,
    serviceprovider
  ) {
    if (err)
      return handleError((err) => {
        res.status(500).json({
          message:
            "Couldn't recieve service provider Details! Please check your connetion",
        });
      });
    res.status(200).json({
      message: 'service provider recieved successfully!',
      serviceprovider: serviceprovider,
    });
  });
});

auth.get('/get/firmOwner', checkAuth, (req, res, next) => {
  console.log(req.userData);
  FirmOwner.findOne({ user_id: req.userData.user_id }, function (
    err,
    firmOwner
  ) {
    if (err)
      return handleError((err) => {
        res.status(500).json({
          message:
            "Couldn't recieve firm owner Details! Please check your connetion",
        });
      });
    res.status(200).json({
      message: 'frim owner recieved successfully!',
      firmOwner: firmOwner,
    });
  });
});


auth.get('/get/admin', checkAuth, (req, res, next) => {

  console.log(req.userData.user_id);
  Admin.findOne({ user_id: req.userData.user_id }).then(
    resadmin =>
   {
     console.log(resadmin);
    res.status(200).json({
      message: 'admin recieved successfully!',
      admin: resadmin,
    });
  }).catch ( err => {
    console.log(err);
    res.status(500).json({
      message:
        "Couldn't recieve admin Details! Please check your connetion",
    });
  })
});

// get admin only user list
auth.get('/get/adminsp', checkAuth, (req, res, next) => {

  var q = ServiceProvider.find().select ('user_id user_type first_name last_name service_category isavilable email contact_no firm');

  q.exec().then(
    resadmin =>
   {
     console.log(resadmin);
    res.status(200).json({
      message: 'service providers details recieved successfully!',
      serviceproviders: resadmin,
    });
  }).catch ( err => {
    console.log(err);
    res.status(500).json({
      message:
        "Couldn't recieve service providers Details! Please try again!",
    });
  })
});

auth.get('/get/adminfo', checkAuth, (req, res, next) => {

  var q = FirmOwner.find().select ('user_id user_type first_name last_name email contact_no firm');

  q.exec().then(
    resadmin =>
   {
     console.log(resadmin);
    res.status(200).json({
      message: 'firm owners details recieved successfully!',
      firmOwners: resadmin,
    });
  }).catch ( err => {
    console.log(err);
    res.status(500).json({
      message:
        "Couldn't recieve firm owners Details! Please try again!",
    });
  })
});


auth.get('/get/sprovider/:id', checkAuth, (req, res, next) => {
  console.log(req.userData);
  ServiceProvider.findOne({ user_id: req.params.id}, function (
    err,
    serviceprovider
  ) {
    if (err)
      return handleError((err) => {
        res.status(500).json({
          message:
            "Couldn't recieve service provider Details! Please check your connetion",
        });
      });
    res.status(200).json({
      message: 'service provider recieved successfully!',
      serviceprovider: serviceprovider,
    });
  });
});

// update availability and location once logged in
auth.post('/sprovider/state', checkAuth, (req, res, next) => {
  ServiceProvider.updateOne({ user_id: req.userData.user_id},{isavailable: true, 'location': req.body.location }, function (
    err,
    serviceprovider
  ) {
    if (err)
      return handleError((err) => {
        res.status(500).json({
          message:
            "Couldn't update your Availability!",
        });
      });
    res.status(200).json({
      message: 'Service Provider Availability updated!',
    });
  });
});

// change availability if an order is accepted or rejected
auth.post('/sprovider/newstate', checkAuth, (req, res, next) => {
  ServiceProvider.updateOne({ user_id: req.userData.user_id},{isavailable: req.body.state}).then  (
    ()  => {
    res.status(200).json({
      message: 'Service Provider Availability updated!',
    });
  }).catch ( err => {
    console.log(err);
    res.status(500).json({
      message:
        "Couldn't update your Availability!",
    });
  })
});

// add rating to service provider
auth.post('/rate/serviceprovider', checkAuth, (req, res, next) => {
  ServiceProvider.updateOne({ user_id: req.body.spId},{
    $inc: {rating: req.body.rating}
  }).then  (
    ()  => {
    res.status(200).json({
      message: 'Service Provider Rating updated!',
    });
  }).catch ( err => {
    console.log(err);
    res.status(500).json({
      message:
        "Couldn't update Ratings!",
    });
  })
});


auth.post('/get/sproviders', checkAuth, (req, res, next) => {
  console.log(req.body.category);
  ServiceProvider.find({ isavailable: true, service_category: req.body.category, 'location.town': req.body.town}, function (
    err,
    serviceproviders
  ) {
    if (err)
      return handleError((err) => {
        res.status(500).json({
          message:
            "Couldn't recieve service provider Details! Please retry",
        });
      });
    res.status(200).json({
      message: 'service providers recieved successfully!',
      serviceproviders: serviceproviders,
    });
  });
})


auth.get('/get/firmMembers', checkAuth, (req, res, next) => {
  console.log(req.body.category);
  var Query = FirmOwner.findOne({user_id: req.userData.user_id}).select('firm');

  Query.exec().then ( (result) => {
    ServiceProvider.find({'firm.firm_id': result.firm.firm_id}).then (
      serviceproviders => {
      res.status(200).json({
        message: 'service providers recieved successfully!',
        serviceproviders: serviceproviders,
      });
    }).catch ( err => {
      res.status(500).json({
        message:
          "Couldn't recieve service provider Details! Please retry",
      });
    });
  }).catch ( err => {
    res.status(500).json({
      message:
        "Couldn't recieve service provider Details! Please retry",
    });
  });
})


auth.get('/get/customer', checkAuth, (req, res, next) => {
  Customer.findOne({ user_id: req.userData.user_id }, function (err, customer) {
    if (err)
      return handleError((err) => {
        res.status(500).json({
          message:
            "Couldn't recieve customer Details! Please check your connetion",
        });
      });
    res.status(200).json({
      message: 'customer  recieved successfully!',
      customer: customer,
    });
  });
});

// remove a firm member
auth.post('/remove/firmMember', checkAuth, (req, res, next) => {
  ServiceProvider.findOne({ user_id: req.body.firmMemberId }).then( (result) => {
    res.status(200).json({
      message: 'firm member removed!',
    });
  }).catch ( err => {
    res.status(500).json({
      message:
        "Couldn't remove firm member. Please try again",
    });
  })
});

auth.get('/get/firmId', checkAuth, (req, res, next) => {
  FirmOwner.findOne({ user_id: req.userData.user_id }).select('firm.firm_id').exec().then ( (result) => {
    res.status(200).json({
      message: 'firm Id  recieved successfully!',
      firmId: result.firm_id,
    });
  }).catch ( err => {
    res.status(500).json({
      message:
        "Couldn't recieve Firm Id! Please check your connetion",
    });})
});


auth.get('/get/head', checkAuth, (req, res, next) => {
      res.status(200).json({
        user_type: req.userData.user_type,
        email: req.userData.email,
        user_id: req.userData.user_id
      });
});

// send bill as a mail to cutomer
auth.post("/mail", checkAuth, (req,res,next) => {
  let mail = req.body;
  console.log(mail);
  sendMail(mail, info => {
    res.status(200).json(
      {
        message: 'mail sent successfully!',
      }
    );
  }).catch(err => {
    console.log(err);
    res.status(500).json(
      {
        message: 'mail sending failed!',
      }
    );
  })
});

// nodemailer send email function
async function sendMail(mail, callback) {

  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'bvidushika95@gmail.com',
      pass: 'bingunichiran95'
    }
  });

  let mailOptions = {
    from: '"Ready4U Support "<biguni@ready4u.com>', // sender address
    to: mail.email, // list of receivers
    subject: mail.subject, // Subject line
    html: mail.html
  };

  // send mail with defined transport object
  let info = await transporter.sendMail(mailOptions);

  callback(info);
}


module.exports = auth;

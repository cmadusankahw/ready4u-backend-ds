const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();

//import app segments
const auth = require('./src/auth/auth');
const service = require('./src/service/service');
const firm = require('./src/firm/firm');
const admin = require('./src/admin/admin');


mongoose
  .connect('mongodb+srv://admin:admin1234@cluster0.69yxf.mongodb.net/ready_4u?retryWrites=true&w=majority'
  , {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to monogodb database..');
  })
  .catch(() => {
    console.log('Connection to database failed!');
  });

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb',extended: false }));
app.use("/images",express.static(path.join("src/assets/images/")));

//Allow CROS
app.use( (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-Width, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS");
  next();
});

//functions here
app.use('/api/auth', auth);
app.use('/api/service', service);
app.use('/api/firm', firm);
app.use('/api/admin', admin);

module.exports = app;

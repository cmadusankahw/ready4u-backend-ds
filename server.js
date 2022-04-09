const app = require('./app');
const debug = require('debug')('node-angular');
const http = require('http');
const socketIO = require('socket.io');

const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof port === 'string' ? 'pipe ' + port : 'port ' + port;
  debug('Listening on ' + bind);
};

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

const server = http.createServer(app);
server.on('error', onError);
server.on('listening', onListening);


const io = socketIO(server);

// use socket-io to recieve messages
io.on('connection',(socket)=>{

  console.log('new user connected...');


  socket.on('join', function(data){
    //joining
    socket.join(data.room);

    console.log(data.user + 'joined the room : ' + data.room);

    socket.broadcast.to(data.room).emit('new user joined', {user:data.user, message:'has joined this room.'});
  });


  socket.on('leave', function(data){

    console.log(data.user + 'left the room : ' + data.room);

    socket.broadcast.to(data.room).emit('left room', {user:data.user, message:'has left this room.'});

    socket.leave(data.room);
  });

  socket.on('message',function(data){

    io.in(data.room).emit('new message', {user:data.user, message:data.message});
  })

  socket.on('order-accepted',function(data){

    io.emit('order accepted', {latitude:data.latitude, longitude: data.longitude});
  })

  socket.on('order-placed',function(data){

    io.emit('order placed', {placed: data.placed});
  })

  socket.on('cust-location',function(data){

    io.emit('cust location', {latitude:data.latitude, longitude: data.longitude});
  })

  socket.on('order-cancelled',function(data){

    io.emit('order cancelled', {cancelled: data.cancelled});
  })

  socket.on('destination-arrived',function(data){

    io.emit('destination arrived', {arrived: data.arrived});
  })

  socket.on('task-completed',function(data){

    io.emit('task completed', {completed: data.completed, amount: data.amount});
  })

  socket.on('amount-charged',function(data){

    io.emit('amount charged', {charged: data.charged});
  })


  socket.on('task-started',function(data){

    io.emit('task started', {started: data.started});
  })
});


server.listen(port, () => {
  console.log('Node JS Server is running on port ' + port.toString());
});

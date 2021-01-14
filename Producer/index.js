const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config();
const {
    connectQ,
    closeConnection,
    createProcessChannel,
    createTerminateChannel
} = require('./sender.js');

const {
    getConnection,
    closeConnectionDB
} = require('./ProcessStatus/prmStatus.js');

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('<H1>Welcome to atlan home</H1>');
});

const task = require('./routes/process.js');

//Mounting Routes
app.use('/api/v1/process', task);

//Starting The server
async function start()
{
    try
    {
        //Making Connections to RabbitMQ and Redis
        getConnection();
        await connectQ();
        await createProcessChannel();
        await createTerminateChannel();
    }
    catch(er)
    {
        console.error(er);
    }
    app.listen(PORT,
    console.log(`Listening at Port ${PORT}`));
};

start();

//Handling Undhandled Promise and since it can be fatal shutting the server
process.on('unhandledRejection', async (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  try{
    await closeConnection();
    closeConnectionDB();
  }
  catch(err)
  {
      console.error(err);
  }
  server.close(() => process.exit(1));
});
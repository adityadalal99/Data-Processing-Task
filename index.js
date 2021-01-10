const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
dotenv.config({path : `.confif/config.env`});
const {
    connectQ,
    createProcessChannel,
    createTerminateChannel
} = require('./sender.js');


const app = express();

const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('<H1>Welcome to atlan home</H1>');
});

const task = require('./routes/process.js');

app.use('/api/v1/process', task);

async function start()
{
    try
    {
        await connectQ();
        await require('./connection').getConnection();
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

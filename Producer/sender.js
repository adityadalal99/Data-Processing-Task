const amqp = require('amqplib');
const { resolve, reject} = require('bluebird');


let connection = null;
let channelTerminate = null;
let channelProcess = null;
let queueTerminate = null;
let queueProcess = null;

// @desc      Connecting to RabbitMQ
// @access    Public
exports.connectQ = ()=>
{
    return new Promise(async (resolve, reject) => {
        if(connection == null)
        {
            try
            {
                connection = await amqp.connect(process.env.QUEUE_URL);
                resolve(connection);
            }
            catch(error)
            {
                console.log(error);
                server.close(() => process.exit(1));
                reject(error);
            }
        }
        else
        {
            resolve(connection);
        }
    });
};

// @desc      Closing connection to RabbitMQ
// @access    Public
exports.closeConnection = async ()=>{
    if(connection !== null)
    {
        try
        {
            connection.close();
            resolve();
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        }
    }
};

// @desc      Creating a channel if does not exist to push terminate tasks 
// @access    Public
exports.createTerminateChannel = () => {
    return new Promise(async (resolve, reject) => {
        if(channelTerminate && queueTerminate)
        {
            return resolve([channelTerminate,queueTerminate]);
        }
        try
        {
            channelTerminate = await connection.createChannel();
            try
            {
                queueTerminate = process.env.QUEUE_TERMINATE;
                await channelTerminate.assertQueue(queueTerminate, {
                    durable: false
                });
                return resolve([channelTerminate,queueTerminate]);
            } 
            catch(er)
            {
                console.error(er);
                reject(er);
            }
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        }
    });
};

// @desc      Creating a channel if does not exist to push Process tasks 
// @access    Public
exports.createProcessChannel = () => {
    return new Promise(async (resolve, reject) => {
        if(channelProcess && queueProcess)
        {
            return resolve([channelProcess,queueProcess]);
        }
        try
        {
            channelProcess = await connection.createChannel();
            try
            {
                queueProcess = process.env.QUEUE_PROCESS;
                await channelProcess.assertQueue(queueProcess, {
                    durable: false
                });
                resolve([channelProcess,queueProcess]);
            }
            catch(error)
            {
                reject(error);
            }
            
        }
        catch(error)
        {
            reject(error);
        }
    });
};

// @desc      Creating Process Queue if does not exist and pushing the processObj to the Process Queue 
// @access    Public
exports.pushToProcessQueue = (queueProcesss,channelProcesss,messageProcess)=>{
    return new Promise(async (resolve,reject) => {
        try
        {
            channelProcesss.sendToQueue(queueProcesss, Buffer.from(JSON.stringify(messageProcess)));
            return resolve();
        }
        catch(ex)
        {
            console.error(ex);
            reject(ex);
        }
    });
};


// @desc      Creating Terminate Queue if does not exist and pushing the processObj to the Terminate Queue 
// @access    Public
exports.pushToTermiateQueue = (queueTerminatee,channelTerminatee,messageTerminate) => {
    return new Promise(async (resolve,reject)=>{
        try
        {
            channelTerminatee.sendToQueue(queueTerminatee, Buffer.from(JSON.stringify(messageTerminate)));
            return resolve();
        }
        catch(ex)
        {
            console.error(ex);
            reject(ex);
        }
    });
};

//To Test the module individually
// async function test(){
//     connection = await this.connectQ();
//     let resTer = await this.createTerminateChannel();
//     let resPros = this.await createProcessChannel();
//     await this.pushToProcessQueue(resPros[1],resPros[0],{message : "ProcessJob"});
//     await this.pushToTermiateQueue(resTer[1],resTer[0],{message:"TermiateJob"});
// }

// test();
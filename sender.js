const amqp = require('amqplib');
//const { resolve, reject} = require('bluebird');


let connection = null;
let channelTerminate = null;
let channelProcess = null;
let queueTerminate = null;
let queueProcess = null;

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
                reject(error);
            }
        }
        else
        {
            resolve(connection);
        }
    });
};

exports.createTerminateChannel = () => {
    return new Promise(async (resolve, reject) => {
        if(channelTerminate && queueTerminate)
        {
            resolve([channelTerminate,queueTerminate]);
        }
        try
        {
            channelTerminate = await connection.createChannel();
            try
            {
                queueTerminate = 'Terminate';
                await channelTerminate.assertQueue(queueTerminate, {
                    durable: false
                });
                resolve([channelTerminate,queueTerminate]);
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

exports.createProcessChannel = () => {
    return new Promise(async (resolve, reject) => {
        if(channelProcess && queueProcess)
        {
            resolve([channelProcess,queueProcess]);
        }
        try
        {
            channelProcess = await connection.createChannel();
            try
            {
                queueProcess = 'Process';
                await channelProcess.assertQueue(queueProcess, {
                    durable: false
                });
                //let msg = "First Message";
                // channel.sendToQueue(queue, Buffer.from(msg));
                // console.log(" [x] Sent %s", msg);
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

exports.pushToProcessQueue = (queueProcesss,channelProcesss,messageProcess)=>{
    return new Promise(async (resolve,reject) => {
        try
        {
            channelProcesss.sendToQueue(queueProcesss, Buffer.from(JSON.stringify(messageProcess)));
            resolve();
        }
        catch(ex)
        {
            console.error(ex);
            reject(ex);
        }
    });
};

exports.pushToTermiateQueue = (queueTerminatee,channelTerminatee,messageTerminate) => {
    return new Promise(async (resolve,reject)=>{
        try
        {
            channelTerminatee.sendToQueue(queueTerminatee, Buffer.from(JSON.stringify(messageTerminate)));
            resolve();
        }
        catch(ex)
        {
            console.error(ex);
            reject(ex);
        }
    });
};

// async function test(){
//     connection = await connectQ();
//     let resTer = await createTerminateChannel();
//     let resPros = await createProcessChannel();
//     await pushToProcessQueue(resPros[1],resPros[0],{message : "ProcessJob"});
//     await pushToTermiateQueue(resTer[1],resTer[0],{message:"TermiateJob"});
// }

// test();
const { response } = require('express');
const redis = require('redis');
const asyncRedis = require("async-redis");

let client = null;

// @desc      Get connection to Redis
// @access    Public
exports.getConnection = ()=>{
    if(client === null)
    {
        client = asyncRedis.createClient({
            port : (Number)(process.env.DB_PORT),
            host : process.env.DB_HOST,
            password : process.env.DB_PASSWORD
        });
        //client = asyncRedis.createClient();

        //Closing Server due to fatal error of not connecting to database
        client.on("error", function (err) {
            console.log("Error " + err);
            server.close(() => process.exit(1));
        });
    }
};

// @desc      Closing connection to Redis
// @access    Public
exports.closeConnectionDB = ()=>{
    if(client != null)
    {
        client.quit(function (err){
            console.error(err);
        });
    }
};

// @desc      Get Status of a process from redis
// @access    Public
exports.getProcessStatus = (processId)=>{
    return new Promise(async (resolve, reject)=>{
        if(client === null)
        {
            this.getConnection();
        }
        try{
            let status = await client.get(processId);
            return resolve(status);
        }
        catch(er)
        {
            console.log(er);
            return reject(er);
        }
    });

};

// @desc      setting status of a process
// @access    Public
exports.setProcessStatus = (processId, status)=>{
    return new Promise(async (resolve, reject)=>{
        if(client === null)
        {
            this.getConnection();
        }
        try{
            await client.set(processId,status);
            return resolve();
        }
        catch(er)
        {
            console.error(er);
            return reject(er);
        }
    });
};

// @desc      If the process was paused getting the number of rows processed
// @access    Public
exports.getPauseProcessRowNumber = (processId)=>{
    return new Promise(async (resolve,rejects)=>{
        if(client === null)
        {
            this.getConnection();
        }
        try{
            let rowNumber = await client.get(processId + require('../ProcessStatus/statusValue').pausedAT);
            return resolve(rowNumber);
        }
        catch(er)
        {
            console.error(er);
            return reject(er);
        }
    });
};

//For testin connection to redis
// async function  test(){
//     try{
//         await this.setProcessStauts("gdhsgdh","Processed");
//         console.log(await this.getProcessStatus("gdhsgdh"));
//     }
//     catch(er)
//     {
//         console.log(er);
//     }
// }

// test();
const { rejects } = require("assert");
const { resolve } = require("path");
const { start } = require("repl");
const {
    createProcessChannel,
    createTerminateChannel,
    pushToProcessQueue,
    pushToTermiateQueue,
} = require('../sender.js');
const {
    getProcessStatus,
    setProcessStatus,
    getPauseProcessRowNumber
} = require('../ProcessStatus/prmStatus');
const processStatus = require('../ProcessStatus/statusValue.js');
const { promises } = require("fs");


// @desc      Starting a Process by pushing obj to RabbitMQ and setting appropriate status in Redis DB 
// @route     GET /api/v1/process/start
// @access    Public
exports.startProcess = (processObj) =>{
    return new Promise(async (resolve,reject) => {
        let res = [];
        res = await createProcessChannel();
        const channelProcess = res[0];
        const queueProcess = res[1];
        let messageProcess = {
            processId : processObj.processId,
            filePath : processObj.filePath
        };
        try{
            let process_status = await getProcessStatus(processObj.processId);
            if(process_status != null && (process_status === processStatus.Queued || process_status === processStatus.Processing))
            {
                resolve([{resCode :409},{body:{message:"Process Already Started"}}]);
            }
            await pushToProcessQueue(queueProcess,channelProcess,messageProcess);
            await setProcessStatus(processObj.processId,processStatus.Processing);
            resolve([{resCode : 202},{body:{message: "Your File is being Processed"}}]);
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        } 
    });
};


// @desc      Stopping the process by pushing it to rabbitmq and status update in Redis DB 
// @route     GET /api/v1/process/stop
// @access    Public
exports.stopProcess = (processObj) =>{
    return new Promise(async (resolve,reject) => {
        let res = [];
        res = await createTerminateChannel();
        const channelTerminate = res[0];
        const queueTerminate = res[1]; 
        let messageTerminate = {
            processId : processObj.processId,
            type : processObj.type
        };
        try
        {
            let process_status = getProcessStatus(processObj.processId);
            if(process_status === null)
            {
                resolve([{resCode : 401},{body:{message : "No such Process found"}}]);
            }
            if(process_status === processStatus.Terminate)
            {
                resolve({resCode : 409},{body:{message:"Process is Already Terminated"}});
            }
            if(process_status === processStatus.Queued)
            {
                await setProcessStatus(processObj.processId, processStatus.Terminate);
                resolve({resCode : 202},{body :{message:"Process is Terminated"}});
            }
            if(process_status === processStatus.Processing)
            {
                await setProcessStatus(processObj.processId, processStatus.Terminate);
            }
            if(process_status === processStatus.Pause)
            {
                await setProcessStatus(processObj.processId, processStatus.Rollback);
            }
            await pushToTermiateQueue(queueTerminate,channelTerminate,messageTerminate);

            resolve({resCode : 202},{body :{message:"Process is Terminated"}});
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        } 
    });
};

// @desc      Pausing a Process by pushing obj to RabbitMQ and setting appropriate status in Redis DB 
// @route     GET /api/v1/process/pause
// @access    Public
exports.pauseProcess = (processObj)=>{
    return new Promise(async (resolve,reject)=>{
        let res = [];
        res = await createTerminateChannel();
        const channelTerminate = res[0];
        const queueTerminate = res[1]; 
        let messageTerminate = {
            processId : processObj.processId,
            type : processObj.type
        };
        try{
            let process_status = getProcessStatus(processObj.processId);
            if(process_status === null)
            {
                resolve({resCode : 401},{body:{message : "No such Process found"}});
            }
             if(process_status === processStatus.Queued)
            {
                await setProcessStatus(processObj.processId, processStatus.Terminate);
                resolve({resCode : 202},{body:{message:"Process Paused"}});
            }
            await pushToTermiateQueue(queueTerminate,channelTerminate,messageTerminate);
            await setProcessStatus(processObj.processId, processStatus.Terminate);
            resolve({resCode : 202},{body:{message:"Process Paused"}});
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        }
    });
};

// @desc      Resuming a Process by pushing obj to RabbitMQ and setting appropriate status in Redis DB 
// @route     GET /api/v1/process/start
// @access    Public
exports.resumeProcess = (processObj)=>{
    return new Promise(async (resolve,reject)=>{
        let res = [];
        res = await createProcessChannel();
        const channelProcess = res[0];
        const queueProcess = res[1];
        let messageProcess = {
            processId : processObj.processId,
        };
        try{
            let process_status = getProcessStatus(processObj.processId);
            if(process_status === null)
            {
                resolve({resCode : 401},{body:{message : "No such Process found"}});
            }
             if(process_status === processStatus.Queued)
            {
                resolve({resCode : 202},{body:{message:"Process Resumed"}});
            }
            if(process_status === processStatus.Processed)
            {
                resolve({resCode : 409},{body:{message : "Process ALready Finished"}});
            }
            if(process_status === processStatus.Processing)
            {
                await pushToProcessQueue(queueProcess,channelProcess,messageProcess);
                await setProcessStatus(processObj.processId, processStatus.Queued);
                let rowNumber = getPauseProcessRowNumber(processObj.processId + processStatus.pausedAT);
                resolve({resCode : 202},{body:{message:`Process Resumed from ${rowNumber}`}});
            }
            else
            {
                resolve({resCode : 501},{body:{message:"Something Went Wrong Please Try Again Later"}});
            }
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        }
    });
};
const { rejects } = require("assert");
const { resolve } = require("path");
const { start } = require("repl");
const {
    connectQ,
    createProcessChannel,
    createTerminateChannel,
    pushToProcessQueue,
    pushToTermiateQueue
} = require('../sender.js');
const {
    getProcessStatus,
    setProcessStatus,
    setProcessPause
} = require('../ProcessStatus/prmStatus');
const { promises } = require("fs");


exports.startProcess = async (processId,filePath) =>{
    return new Promise(async (resolve,reject) => {
        let res = [];
        res = await createProcessChannel();
        const channelProcess = res[0];
        const queueProcess = res[1];
        let messageProcess = {
            processId : processId,
            filePath : filePath
        };
        try{
            let process_status = await getProcessStatus(processId);
            if(process_status.length > 0 && process_status[0].status === process.env.PROCESS_STATUS_QUEUED)
            {
                resolve({body:{message:"Process Already Queued"}});
            }
            if(process_status.length > 0 && process_status[0].status === process.env.PROCESS_STATUS_PROCESSING)
            {
                resolve({body:{message:"Process is Already being exectued"}});
            }
            await pushToProcessQueue(queueProcess,channelProcess,messageProcess);
            resolve();
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        } 
    });
};

exports.stopProcess = async (processObj) =>{
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
            let process_status = await getProcessStatus(processObj.processId);
            if(process_status.length === 0)
            {
                resolve({body:{message : "No such Process found"}});
            }
            if(process_status[0].status === process.env.PROCESS_STATUS_QUEUED)
            {
                await setProcessStatus(processId, process.env.PROCESS_STATUS_TERMINATE);
                resolve();
            }
            await pushToTermiateQueue(queueTerminate,channelTerminate,messageTerminate);
            resolve();
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        } 
    });
};

exports.pauseProcess = async (processObj)=>{
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
            let process_status = await getProcessStatus(processObj.processId);
            if(process_status.length === 0)
            {
                resolve({body:{message : "No such Process found"}});
            }
             if(process_status[0].status === process.env.PROCESS_STATUS_QUEUED)
            {
                await setProcessStatus(processId, process.env.PROCESS_STATUS_TERMINATE);
                resolve();
            }
            await pushToTermiateQueue(queueTerminate,channelTerminate,messageTerminate);
            resolve();
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        }
    });
};

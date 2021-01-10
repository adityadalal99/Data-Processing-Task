const { response } = require('express');

const db_connection = require('../connection').getConnection();

exports.getProcessStatus = (processId)=>{
    return new Promise(async (resolve,reject)=>{
        try{
            let process_status = await db_connection.any("SELECT process_id,status FROM process_status WHERE process_id = <?processIdd>",{
                    process_id : processId
                });
            resolve(process_status);
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        }
    });
};

exports.setProcessStatus = (processId, newStatus) => {
    return new Promise(async (resolve,reject)=>{
        try{
            await db_connection.none("UPDATE process_status SET status = <?new_status>  WHERE process_id = <?processId>",{
                new_status : process.newStatus,
                processId : processId
            });
            resolve();
        }
        catch(er)
        {
            console.error(er);
            reject(er);
        }        
    });
};

exports.setProcessPause = (processId, newStatus) => {
    return new Promise(async (resolve,reject)=>{
        try{
            await db_connection.none("UPDATE process_status SET status = <?new_status> status_stopped_at = <?rowNumber> WHERE process_id = <?processId> ",{
                new_status : process.newStatus,
                processId : processId,
                rowNumber : rowNumber
            });
        }
        catch(er)
        {
            console.error(er);
        }
    });
};
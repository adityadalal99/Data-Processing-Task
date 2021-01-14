//Enum For States of A Process
const processStatus = Object.freeze({"Processing":"PROCESSING","Processed":"PROCESSED", "Queued":"QUEUED", "Terminate":"TERMINATE", "Pause":"PAUSED","pausedAT":"PAUSED AT","Rollback":"Rollback"});

module.exports = processStatus;
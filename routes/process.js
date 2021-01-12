const { Router } = require('express');
const express = require('express');
const router = express.Router();
const {
    startProcess,
    stopProcess,
    pauseProcess,
    resumeProcess
} = require('../controllers/process.js');


router.post("/start",async (req,res) => {
    try
    {
        let resObj = await startProcess(req.body.processObj);
        return res.status(resObj[0].resCode).json(resObj[1]);
    }
    catch(er)
    {
        return res.status(501).json({
            errors : { body : [ 'Could No Begin Process Now. Try Later', er.message]}
        });
    }
});

router.post("/stop", async (req,res) => {
    try
    {
        let resObj = await stopProcess(req.body.processObj);
        return res.status(resObj[0].resCode).json(resObj[1]);
    }
    catch(er)
    {
        return res.status(501).json({
            errors : { body : [ 'Could Not Stop Process Now. Try Later', er.message]}
        });
    }
});

router.post("/pause", async (req,res)=>{
    try
    {
        let resObj = await pauseProcess(req.body.processObj);
        return res.status(resObj[0].resCode).json(resObj[1]);  
    }
    catch(er)
    {
        return res.status(501).json({
            errors : { body : [ 'Could Not Stop Process Now. Try Later', er.message]}
        });
    }
});

router.post("/resume", async (req,res)=>{
    try{
        let resObj = await resumeProcess(req.body.processObj);
        return res.status(resObj[0].resCode).json(resObj[1]);  
    }
    catch(er)
    {
        return res.status(501).json({
            errors : { body : [ 'Could Not Stop Process Now. Try Later', er.message]}
        });
    }
});

module.exports = router;


const { Router } = require('express');
const express = require('express');
const router = express.Router();
const {
    startProcess,
    stopProcess
} = require('../controllers/process.js');


router.post("/start",async (req,res) => {
    try
    {
        let resObj = await startProcess(req.body.processId,req.body.filePath);
        if(resObj != null)
        {
            return res.status(102).json(resObj);
        }
        return res.status(202).json({
            message : "Your File is being Processed"
        });
    }
    catch(er)
    {
        return res.status(501).json({
            errors : { body : [ 'Could No Begin Process Now. Try Later', er.message]}
        });
    }
});

router.put("/stop", async (req,res) => {
    try
    {
        let resObj = await stopProcess(req.body.processObj);
        if(resObj != null)
        {
            return res.status(401).json(resObj);
        }
        return res.status(202).json({
            message : "Your Process is being stopped"
        });
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
        if(resObj != null)
        {
            return res.status(401).json(resObj);
        }
        return res.status(202).json({
            message : "Your Process is being stopped"
        });        
    }
    catch(er)
    {
        return res.status(501).json({
            errors : { body : [ 'Could Not Stop Process Now. Try Later', er.message]}
        });
    }
});

module.exports = router;


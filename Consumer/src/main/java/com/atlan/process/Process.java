package com.atlan.process;

import java.io.*;

import com.atlan.process.redis.RedisConfig;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;

import java.util.concurrent.*;

public class Process {
    //Mapping Process Id to thread so in case of Pause or Terminate we can send an interrupt to that thread
    private final static Logger logger = LoggerFactory.getLogger(Process.class.getName());
    static ConcurrentHashMap<String, Thread> ThreadManagement;
    public static void startService()
    {
        ThreadManagement = new ConcurrentHashMap<String, Thread>();
    }
    public static void createProcess(JSONObject processObj)
    {
        Thread eachTask = new Thread(new Task(processObj, ThreadManagement));
        ThreadManagement.put((String)processObj.get("processId"),eachTask);
        eachTask.start();
    }
    public static void stopProcess(JSONObject processObj)
    {
        try {
            //Getting thread mapped to the processID to send an interrupt
            ThreadManagement.get((String) processObj.get("processId")).interrupt();
        }
        catch (NullPointerException ne)
        {
           logger.error(ne.getMessage(),ne);
        }
    }
}

class Task implements Runnable {
    private JSONObject processObj;
    private ConcurrentHashMap<String, Thread> ThreadManagement;
    private long count = 0;
    private final RedisConfig redisConf = new RedisConfig();
    private Jedis redis;
    private final Logger logger = LoggerFactory.getLogger(Task.class.getName());
    Task(JSONObject processObj, ConcurrentHashMap<String, Thread> ThreadManagement)
    {
        this.processObj = processObj;
        this.ThreadManagement = ThreadManagement;
        try{
            this.redis = redisConf.getJedis();
        }
        catch (Exception e)
        {
            logger.error(e.getMessage(),e);
        }
    }
    public void run()
    {
        try
        {
            BufferedReader br = new BufferedReader(new FileReader((String)processObj.get("filePath")));
            String process_status = (String) redis.get((String) processObj.get("processId"));
            //If the task was asked to terminate before process started we never begin the process
            if(process_status.equals("TERMINATE"))
            {
                try {
                    redis.del((String) processObj.get("processId"));
                    redisConf.returnJedis(redis);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(),e);
                }
                finally {
                    ThreadManagement.remove((String) processObj.get("processId"),Thread.currentThread());
                    br.close();
                }
                return;
            }
            //If the task was paused and then terminated we need to roll back the already processed rows
            if(process_status.equals("ROLLBACK"))
            {
                // TODO Perform Rollback Which will be task sensitive
                //Give back Resources
                try {
                    redis.del((String) processObj.get("processId"));
                    redisConf.returnJedis(redis);
                }
                catch (Exception e)
                {
                    logger.error(e.getMessage(),e);
                }
                finally {
                    ThreadManagement.remove((String) processObj.get("processId"),Thread.currentThread());
                    br.close();
                }
                return;
            }
            if(process_status.equals("PAUSED"))
            {
                //Resource already processed should start from where processing was left
                String rowNumber = redis.get((String) processObj.get("processId") + "pausedAT");
                if(rowNumber != null)
                {
                    br.lines().skip(Long.parseLong(rowNumber));
                }
            }
            String newLine;
            while((newLine = br.readLine()) != null)
            {
                //TODO Process Lines Which will be task specific
                count += newLine.length();
                //If interrupt flag is set the process needs to Terminate or Pause
                if(Thread.interrupted())
                {
                    // If it is Paused we store the char number from where we need to start begining our process
                    if(process_status.equals("PAUSE"))
                    {
                        redis.set((String) processObj.get("processID") + "PAUSED AT", Long.toString(count));
                    }
                    break;
                }
            }
            br.close();
        }
        catch(IOException fe)
        {
            logger.error(fe.getMessage(),fe);
        }
        catch(Exception e)
        {
            logger.error(e.getMessage(),e);
        }
        //Deleting key from Redis Database after Processing is done
        redis.del((String) processObj.get("processId"));
        //Removing thread object mapped to processId
        ThreadManagement.remove(processObj.get("processId"),Thread.currentThread());
        logger.info(Long.toString(count));
        System.out.println(count);
        //Returning redis connection back to the pool
        redisConf.returnJedis(redis);;
    }
}

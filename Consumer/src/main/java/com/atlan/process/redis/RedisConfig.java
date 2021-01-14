package com.atlan.process.redis;

import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;
import redis.clients.jedis.JedisPoolConfig;

import com.atlan.process.config.ProcessConfig;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;



//Redis Connection And Pool manager
public class RedisConfig {

    private static final Logger logger = LoggerFactory.getLogger(RedisConfig.class.getName());
    private JedisPool pool = null;

    //Creating a redis Pool
    private JedisPool getInstance(){

        if (pool == null) {

            if(ProcessConfig.prop == null)
            {
                new ProcessConfig().getProperties();
            }
            JedisPoolConfig config = new JedisPoolConfig();
            config.setMaxTotal(100);
            config.setMaxIdle(20);
            config.setMaxWaitMillis(10 * 1000l);
            config.setTestOnBorrow(true);
            config.setTestOnReturn(true);
            //pool = new JedisPool(config,"localhost");
            pool = new JedisPool(config, ProcessConfig.prop.getProperty("REDIS_SERVER") , Integer.parseInt(ProcessConfig.prop.getProperty("REDIS_PORT")), 30,  ProcessConfig.prop.getProperty("REDIS_PASSWORD"));
        }

        return pool;

    }

    //Returns a redis connection from the pool
    public Jedis getJedis() {

        Jedis jedis = null;

        try {
            jedis = getInstance().getResource();
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }

        return jedis;
    }

    //Gives back the connection to tthe pool
    public void returnJedis(Jedis jedis) {
        try{
            if(jedis != null){
                jedis.close();
            }
        }
        catch (Exception e)
        {
            logger.error(e.getMessage(),e);
        }
    }

}

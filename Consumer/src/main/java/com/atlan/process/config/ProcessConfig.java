package com.atlan.process.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Properties;

//Setting up Process Configuration
public class ProcessConfig {
    public static Properties prop;
    private static final Logger logger = LoggerFactory.getLogger(ProcessConfig.class.getName());

    //Opens stream to properties files
    public void getProperties() {

        InputStream inputStream = null;
        try
        {
            prop = new Properties();
            String propFileName = "config/config.properties";
            inputStream = getClass().getClassLoader().getResourceAsStream(propFileName);
            if(inputStream != null)
            {
                prop.load(inputStream);
            }
            else
            {
                throw new FileNotFoundException("Property File" + propFileName);
            }
        }
        catch (Exception e)
        {
            logger.error(e.getMessage(),e);
        }
        finally {
            try {
                inputStream.close();
            }
            catch (Exception e){
                logger.error(e.getMessage(),e);
            }
        }
    }
}

package com.atlan.process.consume;

import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;
import com.atlan.process.Process;
import org.json.simple.JSONObject;
import org.json.simple.parser.*;
import com.atlan.process.config.ProcessConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//Consumer Class Of RabbitMQ and starting point of Consumer service
public class Consumer {

    private static final Logger logger = LoggerFactory.getLogger(Consumer.class.getName());
    public static void main(String[] argv) throws Exception {
        if(ProcessConfig.prop == null)
        {
            new ProcessConfig().getProperties();
        }

        //Creating a connection factory to rabbitmq
        ConnectionFactory factory = new ConnectionFactory();
        factory.setUri(ProcessConfig.prop.getProperty("QUEUE_URL"));
        Connection connection = factory.newConnection();

        //Creating Process Channel
        Channel channelProcess = connection.createChannel();

        //Creating Termiante Channel
        Channel channelTerminate = connection.createChannel();
        try{

            //Creating Process Queue if does not exist
            channelProcess.queueDeclare(ProcessConfig.prop.getProperty("QUEUE_NAME_P"), false, false, false, null);

            //Creating Terminate Queue if does nit exist
            channelTerminate.queueDeclare(ProcessConfig.prop.getProperty("QUEUE_NAME_T"), false, false, false, null);
        }
        catch (Exception e)
        {
            logger.error(e.getMessage(),e);
        }
        logger.debug("Waiting For Queue Messages");

        //Setting up to start the process service
        Process.startService();

        //Json reader to read the data send over the queues
        JSONParser parser = new JSONParser();

        //Call Back function for when New messages is published on Process queue
        DeliverCallback deliverCallbackProcess = (consumerTagP, delivery) -> {
            String message = new String(delivery.getBody(), "UTF-8");
            logger.debug(" [x] Received" + message);
            try
            {
                Process.createProcess((JSONObject) parser.parse(message));
            }
            catch(ParseException pe)
            {
                logger.error(pe.getMessage(),pe);
            }
        };

        //Call Back function for when New messages is published on Terminate queue
        DeliverCallback deliverCallbackTerminate = (consumerTagT, delivery) -> {
            String message = new String(delivery.getBody(), "UTF-8");
            try
            {
                Process.stopProcess((JSONObject) parser.parse(message));
            }
            catch(ParseException pe)
            {
                logger.error(pe.getMessage(),pe);
            }
        };

        //Strating to consume from queues
        channelProcess.basicConsume(ProcessConfig.prop.getProperty("QUEUE_NAME_P"), true, deliverCallbackProcess, consumerTagP -> { });
        channelTerminate.basicConsume(ProcessConfig.prop.getProperty("QUEUE_NAME_T"), true, deliverCallbackTerminate, consumerTagT -> { });
    }
}

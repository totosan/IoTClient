using Microsoft.ServiceBus.Messaging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Diagnostics;

namespace IoTClient
{
    public class Device
    {
        static string eventHubName = "co2stream";
        static string connectionString = @"Endpoint=sb://iotshowcasettneur.servicebus.windows.net/;SharedAccessKeyName=readwrite;SharedAccessKey=dm9ZuB09CJe/WpSfPTYuWMrZR78ZF9Pisdr1lgcKO3c=";
        private string city;

        public Device(string city)
        {
            this.city = city;
        }


        public void Start()
        {
            var eventHubClient = EventHubClient.CreateFromConnectionString(connectionString, eventHubName);
            var partSend = eventHubClient.CreatePartitionedSender("10");
            var startValue = new Random(10);
            var ppmCnt = 0;
            var ppmValue = startValue.NextDouble() * 10.0;
            var tempValue = 20.0;

            while (true)
            {
                try
                {
                    ppmCnt++;
                    if (ppmCnt % 10 == 0)
                    {
                        ppmValue += startValue.NextDouble() * 10.0;
                    }
                    if (ppmCnt % 20 == 0)
                    {
                        tempValue = 20.0 + startValue.NextDouble() * 10.0;
                    }

                    var message = new
                    {
                        DeviceID = city,
                        Temperature = tempValue,
                        CO2 = 800.0 + ppmValue,
                        ExternalTemperature = 23.0,
                        maxCO2 = 2000.0,
                        minCO2 = 500.0,
                        minTemp = 20.0,
                        maxTemp = 30.0,
                        time = DateTime.Now.ToUniversalTime()
                    };
                    var jsonBody = JsonConvert.SerializeObject(message);
                    Debug.WriteLine($"{message.time} Send message: {jsonBody}");

                    var eventData = new EventData(Encoding.UTF8.GetBytes(jsonBody));
                    //eventHubClient.Send(eventData);
                    partSend.Send(eventData);

                    if (message.CO2 > (1200.0-startValue.NextDouble()*70.0))
                    {
                        ppmValue = startValue.NextDouble()*50.0;
                        ppmCnt = 0;
                    }
                }
                catch (Exception exception)
                {
                    Debug.WriteLine($"{DateTime.Now} > Exception: {exception.Message}", "Error");
                }
                Thread.Sleep(1000);
            }
        }
    }
}

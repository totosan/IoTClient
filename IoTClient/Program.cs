using System.Threading.Tasks;

namespace IoTClient
{
    class Program
    {

        static void Main(string[] args)
        {
            var tastFactory = new TaskFactory(TaskCreationOptions.LongRunning, TaskContinuationOptions.None);

            var devTask1 = tastFactory.StartNew(() => new Device("Stuttgart, Meitnerstr. 11").Start());
            var devTask3 = tastFactory.StartNew(() => new Device("München, Innsbrucker Ring 15").Start());
            var devTask2 = tastFactory.StartNew(() => new Device("Nenzingen, Traubenweg 7").Start());
            Task.WaitAll(devTask1, devTask2, devTask3);
        }

    }
}

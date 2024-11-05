const amqp = require("amqplib");
const dotenv = require("dotenv");

dotenv.config({ path: "../.env.tests" });

describe("RabbitMQ Integration Test", () => {
  let connection;
  let channel;
  const queue = process.env.PRODUCT_QUEUE_NAME;
  const message = { text: "Hello, RabbitMQ!" };

  beforeAll(async () => {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue(queue);
  });

  afterAll(async () => {
    await channel.close();
    await connection.close();
  });

  test("envia e recebe uma mensagem no RabbitMQ", async () => {
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    const receivedMessage = await new Promise((resolve) => {
      channel.consume(
        queue,
        (msg) => {
          if (msg !== null) {
            resolve(JSON.parse(msg.content.toString()));
            channel.ack(msg); // Remove a mensagem da fila
          }
        },
        { noAck: false }
      );
    });

    // Verifica se a mensagem recebida é igual à mensagem enviada
    expect(receivedMessage).toEqual(message);
  });
});

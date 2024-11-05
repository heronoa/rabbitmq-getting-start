const amqp = require('amqplib');

describe('RabbitMQ Integration Test', () => {
  let connection;
  let channel;
  const queue = 'test_queue';
  const message = { text: 'Hello, RabbitMQ!' };

  beforeAll(async () => {
    // Conecta ao RabbitMQ e cria um canal
    connection = await amqp.connect('amqp://guest:guest@localhost:5672');
    channel = await connection.createChannel();

    // Declara a fila para garantir que ela exista antes do teste
    await channel.assertQueue(queue);
  });

  afterAll(async () => {
    // Fecha o canal e a conexão após o teste
    await channel.close();
    await connection.close();
  });

  test('envia e recebe uma mensagem no RabbitMQ', async () => {
    // Envia a mensagem para a fila
    await channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    // Recebe a mensagem da fila
    const receivedMessage = await new Promise((resolve) => {
      channel.consume(queue, (msg) => {
        if (msg !== null) {
          resolve(JSON.parse(msg.content.toString()));
          channel.ack(msg); // Remove a mensagem da fila
        }
      }, { noAck: false });
    });

    // Verifica se a mensagem recebida é igual à mensagem enviada
    expect(receivedMessage).toEqual(message);
  });
});

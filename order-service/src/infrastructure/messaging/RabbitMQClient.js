// RabbitMQClient.ts
const amqp = require("amqplib");

class RabbitMQClient {
  static _connection = null;
  static _channel = null;

  static async connect(url) {
    try {
      if (!this._connection) {
        this._connection = await amqp.connect(url);
        this._channel = await this._connection.createChannel();
        console.log("Connected to RabbitMQ");
      }
    } catch (error) {
      console.error("Failed to connect to RabbitMQ:", error);
      throw error;
    }
  }

  // Método para enviar uma mensagem para uma fila
  static async sendToQueue(queueName, message) {
    if (!this._channel) {
      throw new Error("RabbitMQ channel is not initialized");
    }

    await this._channel.assertQueue(queueName, { durable: true });
    this._channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });
    console.log(`Message sent to queue ${queueName}:`, message);
  }

  static async consumeFromQueue(queueName, onMessage) {
    if (!this._channel) {
      throw new Error("RabbitMQ channel is not initialized");
    }

    await this._channel.assertQueue(queueName, { durable: true });

    this._channel.consume(queueName, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        console.log(`Message received from queue ${queueName}:`, content);

        onMessage(content, this);

        this._channel.ack(msg);
      }
    });
  }

  static async close() {
    try {
      await this._channel?.close();
      await this._connection?.close();
      console.log("RabbitMQ connection closed");
    } catch (error) {
      console.error("Failed to close RabbitMQ connection:", error);
    }
  }
}

module.exports = RabbitMQClient;

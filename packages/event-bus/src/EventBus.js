const NATS = require('nats');

class EventBus {
  constructor({
    name,
    url = process.env.NATS_URL || 'nats://127.0.0.1:4222',
    prefix = '',
  } = {}) {
    this.name = name;
    this.url = url;
    this.natsClient = null;
    this.prefix = prefix;
  }

  get nats() {
    if (!this.natsClient) {
      this.natsClient = new Promise((resolve, reject) => {
        const natsClient = NATS.connect({
          url: this.url,
          name: this.name,
          json: true,
        });

        natsClient.on('connect', () => resolve(natsClient));
        natsClient.once('error', error => reject(
          new Error(`Can't connecto to Event Bus: ${error.message}`),
        ));
      });
    }

    return this.natsClient;
  }

  async publish(address, event) {
    const nats = await this.nats;
    nats.publish(this.prefix + address, event);
  }

  async request(address, request, callback) {
    const nats = await this.nats;
    nats.request(this.prefix + address, request, callback);
  }

  async subscribe(address, callback) {
    const nats = await this.nats;
    return nats.subscribe(
      this.prefix + address,
      (message, reply, subject) => {
        callback({
          ...message,
          subject,
          reply: response => nats.publish(reply, response),
        });
      },
    );
  }

  async unsubscribe(subscriptionId) {
    const nats = await this.nats;
    return nats.unsubscribe(subscriptionId);
  }

  async close() {
    const nats = await this.nats;
    nats.flush(() => nats.close());
  }
}

module.exports = {
  EventBus,
};

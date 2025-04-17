import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService {
  constructor(@Inject('KAFKA_SERVICE') private readonly client: ClientKafka) {}

  async emit<T = unknown>(topic: string, data: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.emit(topic, data).subscribe({
        next: () => resolve(),
        error: (err) =>
          reject(new Error(`Failed to emit message to topic ${topic}: ${err}`)),
      });
    });
  }
}

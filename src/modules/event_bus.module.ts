import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Config } from 'src/schemas/config.schema';
import { KafkaService } from 'src/services/kafka.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        useFactory: (config: ConfigService<Config, true>) => {
          const eventBusConfig = config.get('eventBus', { infer: true });
          return {
            transport: Transport.KAFKA,
            options: {
              client: {
                clientId: eventBusConfig.client.clientId,
                brokers: eventBusConfig.client.brokers,
              },
              consumer: {
                groupId: eventBusConfig.consumer.groupId,
                retry: {
                  retries: 3,
                  initialRetryTime: 300,
                },
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class EventBusModule {}

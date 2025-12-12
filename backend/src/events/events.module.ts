// backend/src/events/events.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './schemas/event.schema';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Event.name, schema: EventSchema }])
  ],
  providers: [EventsService, EventsGateway],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { RedisService } from '@shared/services/redis.service';
import { BookingModule } from '@modules/booking/booking.module';

@Module({
  imports: [BookingModule],
  providers: [TasksService, RedisService],
})
export class TasksModule {}

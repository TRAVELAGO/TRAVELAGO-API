import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { BookingModule } from '@modules/booking/booking.module';

@Module({
  imports: [BookingModule],
  providers: [TasksService],
})
export class TasksModule {}

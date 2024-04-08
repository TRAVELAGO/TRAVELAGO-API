import { Controller, Post, Get, Body, Param, Put } from '@nestjs/common';
import { CreateFeedbackDto } from './dtos/create-feadback.dto';
import { ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.services';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  async createFeedback(@Body() feedbackData: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(feedbackData);
  }

  @Get()
  async getAllFeedbacks() {
    return this.feedbackService.getAllFeedbacks();
  }

  @Put(':id')
  async updateFeedback(
    @Param('id') id: string,
    @Body() feedbackData: CreateFeedbackDto,
  ) {
    return this.feedbackService.updateFeedback(id, feedbackData);
  }
}

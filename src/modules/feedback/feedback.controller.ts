import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.services';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @UseGuards(JwtAuthGuard)
  @Post('createFeedback')
  async createFeedback(@Body() feedbackData: CreateFeedbackDto) {
    return this.feedbackService.createFeedback(feedbackData);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllFeedbacks() {
    return this.feedbackService.getAllFeedbacks();
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateFeedback(
    @Param('id') id: string,
    @Body() feedbackData: CreateFeedbackDto,
  ) {
    return this.feedbackService.updateFeedback(id, feedbackData);
  }
}

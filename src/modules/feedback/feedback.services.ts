import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feedback } from './feedback.entity';
import { CreateFeedbackDto } from './dtos/create-feadback.dto';

@Injectable()
export class FeedbackService {
  constructor(
    @InjectRepository(Feedback)
    private feedbackRepository: Repository<Feedback>,
  ) {}

  async createFeedback(feedbackData: CreateFeedbackDto): Promise<Feedback> {
    const feedback = this.feedbackRepository.create(feedbackData);
    return await this.feedbackRepository.save(feedback);
  }

  async getAllFeedbacks(): Promise<Feedback[]> {
    return await this.feedbackRepository.find();
  }

  async updateFeedback(
    id: string,
    feedbackData: CreateFeedbackDto,
  ): Promise<Feedback> {
    const feedback = await this.feedbackRepository.findOne({
      where: { id },
    });
    if (!feedback) {
      throw new Error('Feedback not found');
    }
    Object.assign(feedback, feedbackData);
    return await this.feedbackRepository.save(feedback);
  }
}

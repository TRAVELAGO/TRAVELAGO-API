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
import { Feedback } from './feedback.entity';
import { RoleType } from '@constants/role-type';
import { Roles } from '@decorators/roles.decorator';
import { ReplyFeedbackDto } from './dtos/feedbackHotelReply.Dto';

@ApiTags('Feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) { }

  @UseGuards(JwtAuthGuard)
  @Get(':idUser')
  @Roles(RoleType.USER)
  async getAllFeedbacks(@Param('idUser') idUser: string): Promise<Feedback[]> {
    return this.feedbackService.getAllFeedbacks(idUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':idUser/replyfromHotel')
  @Roles(RoleType.USER)
  async getAllreply(@Param('idUser') idUser: string): Promise<Feedback[]> {
    return this.feedbackService.getAllReply(idUser);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @Roles(RoleType.USER)
  async updateFeedback(
    @Param('id') id: string,
    @Body() feedbackData: CreateFeedbackDto,
  ) {
    return this.feedbackService.updateFeedback(id, feedbackData);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(RoleType.USER)
  @Post(':userId/:roomId/create')
  async create(
    @Param('userId') userId: string,
    @Param('roomId') roomId: string,
    @Body() feedbackData: CreateFeedbackDto,
  ) {
    await this.feedbackService.create(userId, roomId, feedbackData);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':idHotel')
  @Roles(RoleType.HOTEL)
  async hotelGetAllFeedbacks(@Param('idHotel') idHotel: string): Promise<Feedback[]> {
    return this.feedbackService.hotelGetAllFeedbacks(idHotel);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':idHotel/reply/:feedbackId')
  @Roles(RoleType.HOTEL)
  async replyFeedback(
    @Param('feedbackId') feedbackId: string,
    @Param('hotelId') hotelId: string,
    @Body() replyFeedback: ReplyFeedbackDto,) {
    return this.feedbackService.hotelReplyFeedbacks(feedbackId, hotelId, replyFeedback);
  }

  @Get(':userId/getSuggestedRooms')
  async getSuggestedRooms(@Param('userId') userId: string) {
    const rooms = await this.feedbackService.getSuggestedRooms(userId);
    return rooms;
  }
}
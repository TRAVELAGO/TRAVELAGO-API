import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Patch,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreateFeedbackDto } from './dtos/create-feedback.dto';
import { ApiTags } from '@nestjs/swagger';
import { FeedbackService } from './feedback.services';
import { Feedback } from './feedback.entity';
import { RoleType } from '@constants/role-type';
import { Roles } from '@decorators/roles.decorator';
import { PageOptionsDto } from 'src/common/dtos/page-option.dto';
import { PageDto } from 'src/common/dtos/page.dto';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { UpdateFeedbackDto } from './dtos/update-feedback.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('Feedback')
@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('rooms/:roomId/feedbacks')
  async getFeedbacksOfRoom(
    @Param('roomId') userId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Feedback>> {
    return this.feedbackService.getFeedbacksOfRoom(userId, pageOptionsDto);
  }

  @Get('hotels/:hotelId/feedbacks')
  async getFeedbacksOfHotel(
    @Param('hotelId') hotelId: string,
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Feedback>> {
    return this.feedbackService.getFeedbacksOfHotel(hotelId, pageOptionsDto);
  }

  @Roles(RoleType.USER)
  @Post('rooms/:roomId/feedbacks')
  async create(
    @GetJwtPayload() user: JwtPayloadType,
    @Param('roomId') roomId: string,
    @Body() feedbackData: CreateFeedbackDto,
  ) {
    return await this.feedbackService.create(user.id, roomId, feedbackData);
  }

  @Patch('feedbacks/:id/report')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async reportFeedback(@Param('id') feedbackId: string) {
    await this.feedbackService.reportFeedback(feedbackId);
  }

  @Roles(RoleType.USER)
  @Patch('feedbacks/:id')
  async getFeedback(
    @Param('id') feedbackId: string,
    @GetJwtPayload() user: JwtPayloadType,
    @Body() updateFeedbackDto: UpdateFeedbackDto,
  ) {
    return this.feedbackService.updateFeedback(
      feedbackId,
      user.id,
      updateFeedbackDto,
    );
  }

  @Roles(RoleType.USER)
  @Delete('feedbacks/:id')
  async deleteFeedback(
    @Param('id') feedbackId: string,
    @GetJwtPayload() user: JwtPayloadType,
  ) {
    return this.feedbackService.deleteFeedback(feedbackId, user.id);
  }

  @Roles(RoleType.USER)
  @Get(':userId/get-suggested-rooms')
  async getSuggestedRooms(@Param('userId') userId: string) {
    const rooms = await this.feedbackService.getSuggestedRooms(userId);
    return rooms;
  }
}

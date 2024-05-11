import {
  Controller,
  Post,
  UseGuards,
  Body,
  UseInterceptors,
  Patch,
  UploadedFile,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { User } from './user.entity';
import { UserInfoDto } from './dtos/user-info.dto';
import { imageFilter } from 'src/utils/multer-file-filter';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetJwtPayload } from '@decorators/get-jwt-payload.decorator';
import { JwtPayloadType } from '@modules/auth/strategies/types/jwt-payload.type';
import { ChangePasswordDto } from './dtos/change-password.dto';

@ApiTags('User')
@Controller('user')
export class userController {
  constructor(private userService: UserService) {}

  @Patch()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', { fileFilter: imageFilter }))
  editInfo(
    @GetJwtPayload() jwtPayload: JwtPayloadType,
    @UploadedFile()
    avatar: any,
    @Body() userInfoDto: UserInfoDto,
  ): Promise<User> {
    return this.userService.editInfo(jwtPayload.id, avatar, userInfoDto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  changePassword(
    @GetJwtPayload() jwtPayload: JwtPayloadType,
    @Body()
    changePasswordDto: ChangePasswordDto,
  ): Promise<User> {
    return this.userService.changePassword(
      jwtPayload.id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}

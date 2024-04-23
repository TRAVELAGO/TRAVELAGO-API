import { Controller, Post, Param, UseGuards, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { UserService } from './user.service';
import { User } from './user.entity';
import { userInfoDto } from './dtos/userInfo.dto';
import { changePasswordDto } from './dtos/changePass.dto';

@ApiTags('User')
@Controller('user')
export class userController {
  constructor(private userService: UserService) {}

  @Post(':id/editInfo')
  @UseGuards(JwtAuthGuard)
  editInfo(
    @Param('id') idUser: string,
    @Body() userInfo: userInfoDto,
  ): Promise<User> {
    return this.userService.editInfo(idUser, userInfo);
  }

  @Post(':id/changePass')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Param('id') idUser: string,
    @Body() changePass: changePasswordDto,
  ): Promise<User> {
    return this.userService.changePassword(idUser, changePass);
  }
}

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserInfoDto } from './dtos/user-info.dto';
import * as bcrypt from 'bcrypt';
import { FilesService } from '@modules/files/files.service';
import { hashPassword } from 'src/utils/hash';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private filesService: FilesService,
  ) {}

  async editInfo(
    userId: string,
    avatar: any,
    userInfoDto: UserInfoDto,
  ): Promise<any> {
    const existedUser = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!existedUser) {
      throw new Error('User not found');
    }

    this.userRepository.merge(existedUser, userInfoDto);

    if (avatar) {
      const uploadedAvatar = await this.filesService.uploadFile(
        avatar.buffer,
        avatar.originalname,
      );
      existedUser?.avatar &&
        this.filesService.deleteFile(existedUser?.avatar?.key);
      existedUser.avatar = uploadedAvatar;
    }

    return this.userRepository.save(existedUser);
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const hashNewPassword = await hashPassword(newPassword);
    const checkOldPassword = bcrypt.compareSync(oldPassword, user.password);

    if (!checkOldPassword) {
      throw new UnauthorizedException('Password is not correct.');
    }

    await this.userRepository.update(userId, { password: hashNewPassword });
  }
}

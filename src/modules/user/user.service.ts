import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserInfoDto } from './dtos/user-info.dto';
import * as bcrypt from 'bcrypt';
import { FilesService } from '@modules/files/files.service';

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
    newPassword: string,
    passwordConfirm: string,
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    } else {
      if (newPassword === passwordConfirm) {
        const pass = await this.hashPassword(newPassword);
        const checkPass = bcrypt.compareSync(pass, user.password);
        if (checkPass) {
          try {
            await this.userRepository.update(userId, { password: pass });
          } catch {
            throw new Error('Not connect Database');
          }
        } else {
          throw new HttpException(
            'Not connect Databse',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'Password is not correct.',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }
}

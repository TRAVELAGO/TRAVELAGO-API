import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { userInfoDto } from './dtos/userInfo.dto';
import * as bcrypt from 'bcrypt';
import { changePasswordDto } from './dtos/changePass.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async editInfo(idUser: string, userInfoDto: userInfoDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: idUser },
    });
    if (!user) {
      throw new Error('User not found');
    } else {
      try {
        await this.userRepository.update(idUser, {
          phoneNumber: userInfoDto.phoneNumber,
          fullName: userInfoDto.fullName,
          avatar: userInfoDto.avatar,
        });
      } catch {
        throw new Error('Not connect Database');
      }
    }
  }

  async changePassword(
    idUser: string,
    changePass: changePasswordDto
  ): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: idUser },
    });
    if (!user) {
      throw new Error('User not found');
    } else {
      if (changePass.newPassword === changePass.oldPassword) {
        const pass = await this.hashPassword(changePass.confirmPassword);
        const checkPass = bcrypt.compareSync(pass, user.password);
        if (checkPass) {
          try {
            const newPassword = await this.hashPassword(changePass.newPassword);
            await this.userRepository.update(idUser, { password: newPassword });
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

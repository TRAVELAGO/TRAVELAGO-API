import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login-dto';
import { User } from '@modules/user/user.entity';
import { RegisterDto } from './dtos/register-dto';
import { JwtService } from '@nestjs/jwt';
import { forgotPasswordDto } from './dtos/forgotPassword.dto';
import {NodeMailer} from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const hashPassword = await this.hashPassword(registerDto.passWord);
    return await this.userRepository.save({
      ...registerDto,
      refreshTocken: 'refreshToken',
      passWord: hashPassword,
    });
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new HttpException('Email is not exsit', HttpStatus.UNAUTHORIZED);
    }

    const checkPass = bcrypt.compareSync(loginDto.passWord, user.password);
    if (!checkPass) {
      throw new HttpException(
        'Password is not correct',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { id: user.id, email: user.email };
    return this.generateToken(payload);
  }

  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const verify = await this.jwtService.verifyAsync(refreshToken, {
        secret: '1234567',
      });
      console.log(verify);
      const checkExsitToken = await this.userRepository.findOneBy({
        email: verify.email,
        refreshToken,
      });
      if (checkExsitToken) {
        return this.generateToken({ id: verify.id, email: verify.email });
      } else {
        throw new HttpException(
          'refresh token is not valid',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'refresh token is not valid',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async generateToken(payload: { id: number; email: string }) {
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: '1234567',
      expiresIn: '1d',
    });

    await this.userRepository.update(
      { email: payload.email },
      { refreshToken: refreshToken },
    );
    return { accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, salt);

    return hash;
  }

  async createForgottenPasswordToken(email: string): Promise<any> {
    var user = await this.userRepository.findOne({
      where: { email: email },
    });
    if (!user){
      throw new HttpException('RESET_PASSWORD.EMAIL_SENT_RECENTLY', HttpStatus.INTERNAL_SERVER_ERROR);
    } else {
      const updateUser = await this.userRepository.update(
        { email: email },
        { passwordToken: (Math.floor(Math.random() * (9000000)) + 1000000).toString()}); //Generate 7 digits number,
      // var forgottenPasswordModel = await this.userRepository.save(
      //   { 
      //     email: email,
      //     newPasswordToken: (Math.floor(Math.random() * (9000000)) + 1000000).toString() //Generate 7 digits number,
      //   }
      // );
      
      if(updateUser){
        return updateUser;
      } else {
        throw new HttpException('LOGIN.ERROR.GENERIC_ERROR', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async sendEmailForgotPassword(email: string): Promise<boolean> {
    var userFromDb = await this.userRepository.findOne({
      where: { email: email}
    });
    if(!userFromDb) throw new HttpException('LOGIN.USER_NOT_FOUND', HttpStatus.NOT_FOUND);

    var tokenModel = await this.createForgottenPasswordToken(email);

    if(tokenModel && tokenModel.newPasswordToken){
        let transporter = NodeMailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'maddison53@ethereal.email',
                pass: 'jn7jnAPss4f63QBp6D'
            }
        });
    
        let mailOptions = {
          from: '"Company" <' + 'TRAVELAGO' + '>', 
          to: email, // list of receivers (separated by ,)
          subject: 'Frogotten Password', 
          text: 'Forgot Password',
          html: 'Hi! <br><br> There is your code to reset your password<br><br>'+
          tokenModel.passwordToken  // html body
        };
    
        var sent = await new Promise<boolean>(async function(resolve, reject) {
          return await transporter.sendMail(mailOptions, async (error, info) => {
              if (error) {      
                console.log('Message sent: %s', error);
                return reject(false);
              }
              console.log('Message sent: %s', info.messageId);
              resolve(true);
          });      
        })

        return sent;
    } else {
      throw new HttpException('REGISTER.USER_NOT_REGISTERED', HttpStatus.FORBIDDEN);
    }
  }

  async forgotPassword(forgottenPassword: forgotPasswordDto): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { passwordToken: forgottenPassword.passwordToken },
    });

    if (!user) {
      throw new HttpException('Code is false', HttpStatus.UNAUTHORIZED);
    } else {
      console.log("user true")
    }

    if(forgottenPassword.password !== forgottenPassword.passwordComfirm) {
      new HttpException('Comfirm password is false', HttpStatus.UNAUTHORIZED);
      console.log("passwordComfirm is correct")
    } else {
      console.log(forgottenPassword.passwordToken);
      var pass = await this.hashPassword(forgottenPassword.passwordToken);
    await this.userRepository.update(
      { passwordToken: forgottenPassword.passwordToken },
      { password: pass,
        passwordToken: ''
      }
    )};
  }
}

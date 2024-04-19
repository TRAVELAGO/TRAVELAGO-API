import { TypeSubjectEmail } from '@constants/mail';
// const nodemailer = require('nodemailer');
// const { google } = require('googleapis');
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';

const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI,
);
oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

let htmlContent1 = '';
let htmlContent3 = '';
const htmlContent5 =
  '</p> <p>Cảm ơn quý khách đã tin tưởng và sử dụng dịch vụ của chúng tôi.</p>' +
  '<br> <p>Nếu quý khách không phải là người gửi yêu cầu này, hãy đổi mật khẩu tài khoản ngay lập tức để tránh việc bị truy cập trái phép.</p>' +
  '<br> <p>Nếu quý khách có bất kỳ thắc mắc nào về sản phẩm hay dịch vụ, xin vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi.</p>' +
  '<p>Hotline: 123456789</p>' +
  '<p>Email: dovanbang14082002@gmail.com</p>';
let subjectEmail = '';
let htmlContent2 = '';
let htmlContent4 = '';
subjectEmail = htmlContent2;
export async function sendMail(
  toEmail: string,
  subject: string,
  verify_code: string,
) {
  console.log(toEmail, subject, verify_code);
  try {
    const accessToken = await oAuth2Client.getAccessToken();
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'bang20020367@gmail.com',
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    switch (subject) {
      case TypeSubjectEmail.FORGETPASS:
        subjectEmail = 'Travelago: OptCode xác nhận thay đổi mật khẩu';
        htmlContent1 =
          '<h3>Travelago</h3>' +
          '<p>Kính gửi Quý khách!</p>' +
          '<p>Mã xác thực cho dịch vụ ';
        htmlContent2 = 'thay đổi mật khẩu';
        htmlContent3 = 'mã Otp của quý khách là';
        htmlContent4 =
          '<p style="padding-left: 5px; color: red; font-size: 24px; text-align: center">' +
          verify_code +
          ' </p>' +
          '<p> Mã xác thực tồn tại trong vòng 10 phút <p>';
        break;
      case TypeSubjectEmail.VERIFIEDCODE:
        subjectEmail =
          'Travelago: Tài khoản của quý khách thay đổi mật khẩu thành công';
        htmlContent1 = '';
        htmlContent2 = '';
        htmlContent3 = 'Mật khẩu hiện tại của quý khách là';
        htmlContent4 =
          '<p style="padding-left: 5px; color: red; font-size: 24px; text-align: center">' +
          verify_code +
          ' </p>';
        break;
    }

    const mailOptions = {
      from: 'Travalago <bang20020367@gmail.com>',
      to: toEmail,
      subject: subjectEmail,
      html:
        htmlContent1 +
        htmlContent2 +
        htmlContent3 +
        htmlContent4 +
        htmlContent5,
    };

    const result = await transport.sendMail(mailOptions);
    console.log(result);
    return 123;
  } catch (error) {
    return error;
  }
}

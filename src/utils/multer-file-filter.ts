import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';

export const imageFilter = (_, file, cb) => {
  if (file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestException(
        `Unsupported file type ${extname(file.originalname)}. Please select the file in .jpg, .jpeg, .png, .gif format.`,
      ),
      false,
    );
  }
};

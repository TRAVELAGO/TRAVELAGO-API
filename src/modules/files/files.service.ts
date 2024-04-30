import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import { ACLs } from '@constants/aws-s3-acl';
import { FileObject } from './types/file-object';
import { getApp, initializeApp } from 'firebase/app';
import {
  FirebaseStorage,
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} from 'firebase/storage';

@Injectable()
export class FilesService {
  private readonly s3: S3;
  private readonly cloudStorageType: string;
  private readonly storage: FirebaseStorage;

  constructor(private readonly configService: ConfigService) {
    this.cloudStorageType = configService.get<string>('CLOUD_STORAGE_TYPE');

    if (this.cloudStorageType === 'aws') {
      this.s3 = new S3({
        region: configService.get<string>('AWS_S3_BUCKET_REGION'),
        credentials: {
          accessKeyId: configService.get<string>('AWS_S3_ACCESS_KEY_ID'),
          secretAccessKey: configService.get<string>(
            'AWS_S3_SECRET_ACCESS_KEY',
          ),
        },
      });
    } else if (this.cloudStorageType === 'firebase') {
      initializeApp({
        apiKey: configService.get<string>('API_KEY'),
        authDomain: configService.get<string>('AUTH_DOMAIN'),
        projectId: configService.get<string>('PROJECT_ID'),
        storageBucket: configService.get<string>('STORAGE_BUCKET'),
        messagingSenderId: configService.get<string>('MESSAGING_SENDER_ID'),
        appId: configService.get<string>('APP_ID'),
        measurementId: configService.get<string>('MEASUREMENT_ID'),
      });
      const firebaseApp = getApp();
      this.storage = getStorage(
        firebaseApp,
        configService.get<string>('BUCKET_URL'),
      );
    }
  }

  async uploadFile(dataBuffer: Buffer, filename: string): Promise<FileObject> {
    if (this.cloudStorageType === 'aws') {
      return this.uploadFileToAws(dataBuffer, filename);
    } else if (this.cloudStorageType === 'firebase') {
      return this.uploadFileToFirebase(dataBuffer, filename);
    }
  }

  async uploadFiles(files: any[]): Promise<FileObject[]> {
    return Promise.all(
      files.map((file) => this.uploadFile(file.buffer, file.originalname)),
    );
  }

  async deleteFile(key: string): Promise<void> {
    try {
      if (this.cloudStorageType === 'aws') {
        this.deleteFileAws(key);
      } else if (this.cloudStorageType === 'firebase') {
        const desertRef = ref(this.storage, key);
        await deleteObject(desertRef);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async deleteFiles(keys: string[]): Promise<void> {
    keys.map((key) => this.deleteFile(key));
  }

  private async uploadFileToFirebase(
    dataBuffer: Buffer,
    filename: string,
  ): Promise<FileObject> {
    const storageRef = ref(this.storage, `images/${uuid()}-${filename}`);
    const uploadResult = await uploadBytes(storageRef, dataBuffer);
    const url = await getDownloadURL(storageRef);

    return { key: uploadResult.metadata.fullPath, url };
  }

  private async uploadFileToAws(
    dataBuffer: Buffer,
    filename: string,
  ): Promise<FileObject> {
    const uploadResult = await this.s3
      .upload({
        Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
        Body: dataBuffer,
        Key: `${uuid()}-${filename}`,
        ACL: ACLs.PUBLIC_READ,
      })
      .promise();

    return {
      key: uploadResult.Key,
      url: uploadResult.Location,
    };
  }

  private async deleteFileAws(key: string) {
    await this.s3
      .deleteObject({
        Bucket: this.configService.get('AWS_S3_PUBLIC_BUCKET_NAME'),
        Key: key,
      })
      .promise();
  }
}

import { FileObject } from '@modules/files/types/file-object';

export const formatFileObjects = (files: FileObject[]): string[] => {
  return files ? files.map(formatFileObject) : [];
};

export const getFileObjects = (fileRaws: string[]): FileObject[] => {
  const result: FileObject[] = [];
  fileRaws &&
    fileRaws.forEach((fileRaw) => {
      const fileObject = getFileObject(fileRaw);
      fileObject && result.push(fileObject);
    });

  return result;
};

export const formatFileObject = (file: FileObject): string =>
  file ? `${file.key}|${file.url}` : null;

export const getFileObject = (fileRaw: string): FileObject => {
  const fileRawSplit = fileRaw && fileRaw.split('|');
  if (fileRawSplit?.length === 2) {
    return {
      key: fileRawSplit?.at(0),
      url: fileRawSplit?.at(1),
    };
  }

  return null;
};

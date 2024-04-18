import { FileObject } from '@modules/files/types/file-object';

export const formatFileObjects = (files: FileObject[]): string[] => {
  return files ? files.map((file) => `${file.key}|${file.url}`) : [];
};

export const getFileObjects = (fileRaws: string[]): FileObject[] => {
  const result: FileObject[] = [];
  fileRaws &&
    fileRaws.forEach((fileRaw) => {
      const fileRawSplit = fileRaw.split('|');
      if (fileRawSplit.length === 2) {
        result.push({
          key: fileRawSplit?.at(0),
          url: fileRawSplit?.at(1),
        });
      }
    });

  return result;
};

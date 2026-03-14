import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createS3Client, getBucketConfig } from './aws-config';

const s3Client = createS3Client();
const { bucketName, folderPrefix } = getBucketConfig();

export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  isPublic = false
) {
  try {
    const timestamp = Date.now();
    const cloudStoragePath = isPublic
      ? `${folderPrefix}public/uploads/${timestamp}-${fileName}`
      : `${folderPrefix}uploads/${timestamp}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: cloudStoragePath,
      ContentType: contentType,
      ContentDisposition: isPublic ? 'attachment' : undefined
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      uploadUrl,
      cloudStoragePath
    };
  } catch (error: any) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

export async function getFileUrl(cloudStoragePath: string, isPublic = false) {
  try {
    if (isPublic) {
      const region = process.env.AWS_REGION || 'us-east-1';
      return `https://${bucketName}.s3.${region}.amazonaws.com/${cloudStoragePath}`;
    } else {
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: cloudStoragePath,
        ResponseContentDisposition: 'attachment'
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return signedUrl;
    }
  } catch (error: any) {
    console.error('Error getting file URL:', error);
    throw new Error('Failed to get file URL');
  }
}

export async function deleteFile(cloudStoragePath: string) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: cloudStoragePath
    });

    await s3Client.send(command);
    return true;
  } catch (error: any) {
    console.error('Error deleting file:', error);
    throw new Error('Failed to delete file');
  }
}

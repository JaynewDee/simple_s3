// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/

const {
  S3Client,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand
} = require('@aws-sdk/client-s3')

const fs = require('fs')
const {
  readFile
} = require('fs/promises')

const sharp = require('sharp')

class ImgBucketHandler {

  constructor(bucket, region) {
    this.bucketName = bucket
    this.client = new S3Client({
      region
    })
  }

  async listImages(maxKeys = 5) {
    const command = new ListObjectsV2Command({
      Bucket: this.bucketName,
      MaxKeys: maxKeys
    })

    try {
      const {
        Contents
      } = await this.client.send(command)
      console.log(`Images in bucket ${this.bucketName}:\n`)
      console.dir(Contents)
      return Contents
    } catch (err) {
      console.error(err)
    }
  }

  // Transform the download response body into a byte array and write to stream
  // This function is called by the downloadImage function below
  async writeStream(imageRes, key) {
    const writePath = `./output/${key}`

    // Initialize stream to write response to
    const fileStream = fs.createWriteStream(writePath);

    // Transform response body into streamable bytes
    const bytes = await imageRes.Body.transformToByteArray()

    fileStream.write(bytes)

    fileStream.on('finish', () => {
      console.log(`Image successfully written to ${writePath}`)
      fileStream.close()
    })

    fileStream.on('error', (err) => {
      console.error(`ERROR WRITING FILE ::: ${err}`)
      fileStream.close()
    })
  }

  async downloadImage(key) {
    const command = new GetObjectCommand({
      Bucket: this.bucketName, // required
      Key: key // required
    })

    // Fetch the image with matching key
    const imageRes = await this.client.send(command);

    if (imageRes['$metadata'].httpStatusCode === 200) {
      console.log(`Image data for ${key} received.\nWriting to file.`)
    }

    try {
      // Write the octet-stream as image to fs
      this.writeStream(imageRes, key)
    } catch (err) {
      console.error(err)
    }
  }

  async uploadImage(filePath) {
    // Read image from fs into Buffer
    const imageBlob = await readFile(filePath);
    // Resize / compress to minimize storage space
    const compressed = await compressUpload(imageBlob)

    const filename = filePath.split('/')
    const key = filename[filename.length - 1]

    const command = new PutObjectCommand({
      Bucket: this.bucketName, // required
      Key: key, // required
      Body: compressed
    })

    try {
      const res = await this.client.send(command);

      const resStatus = res['$metadata'].httpStatusCode
      if (resStatus === 200) {
        console.log(`Object with key ${key} uploaded successfully.`)
      }

      return res
    } catch (err) {
      console.error(err)
    }

    // Compress / resize image before upload
    async function compressUpload(blob) {
      const compressed = await sharp(blob).resize(450, 300, {
        fit: 'inside'
      }).toBuffer();

      return compressed;
    }
  }
}

module.exports = ImgBucketHandler

const {
    ImgBucketHandler
} = require("./s3Api")

require('dotenv').config()

const {
  S3_REGION,
  S3_BUCKET_NAME
} = process.env;


(async () => {
    if (process.argv.length < 3) {
        throw new Error("Invalid input arguments!")
    }

    const [_node, _script, command, path] = process.argv;

    const bucketHandler = new ImgBucketHandler(S3_BUCKET_NAME, S3_REGION)

    const cmnd = command.trim()

    if (cmnd === "list") {
       await bucketHandler.listImages()
    }


    if (path && cmnd === "upload") {
        await bucketHandler.uploadImage(path)
    }

    const key = path;
    if (key && cmnd === "download") {
        await bucketHandler.downloadImage(key)
    }
})()

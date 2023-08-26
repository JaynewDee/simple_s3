const ImgBucketHandler = require("./s3Api")

require('dotenv').config()

const {
    S3_REGION,
    S3_BUCKET_NAME
} = process.env;


(async () => {
    if (process.argv.length < 3) {
        console.error("Invalid input arguments!")
        displayHelp()
        return
    }

    const [_node, _script, command, path] = process.argv;

    const bucketHandler = new ImgBucketHandler(S3_BUCKET_NAME, S3_REGION)

    const cmnd = command.trim()

    if (cmnd === "help") {
        displayHelp()
        return;
    }

    if (cmnd === "list") {
        return await bucketHandler.listImages()
    }

    if (path && cmnd === "upload") {
        return await bucketHandler.uploadImage(path)
    }

    if (path && cmnd === "download") {
        return await bucketHandler.downloadImage(key)
    }

    displayHelp()
})()

function displayHelp() {
    console.log(
        `
        Input format ::: <executable> <command> (arg?)
        Commands:
             - list - List all bucket images
             - upload <path_to_image> - Upload an image to bucket
             - download <image_key> - Download image matching input key
    `)
}

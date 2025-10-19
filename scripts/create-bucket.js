//make sure aws is installed
const { S3Client, CreateBucketCommand } = require('@aws-sdk/client-s3');

//Create a new Storage component/client connection
const s3Client = new S3Client({
  endpoint: 'http://localhost:4566',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  forcePathStyle: true,
});

//Creates new bucket 
async function createBucket() {
  try {
    //Tells s3 client to make a new bucket if possible
    await s3Client.send(new CreateBucketCommand({ 
      Bucket: 'expense-receipts' 
    }));
    console.log('Bucket created successfully!');
  } catch (error) {
    if (error.name === 'BucketAlreadyOwnedByYou') {
      console.log('Bucket already exists');
    } else {
      console.error('Error:', error.message);
    }
  }
}

//This just runs our createBucket function
createBucket();
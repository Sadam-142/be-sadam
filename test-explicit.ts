import { v2 as cloudinary } from 'cloudinary';
cloudinary.uploader.upload_stream(
  {
    folder: 'ukm-risalah',
    cloud_name: 'didjbcinp',
    // api_key removed
    api_secret: 'fIVdPGIP_ZD4NOdYaomDNOsnYe8'
  },
  (err, res) => console.log('res:', res, 'err:', err)
).end(Buffer.from('test'));

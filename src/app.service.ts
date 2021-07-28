import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getVideo(req, res) {
    const videoPath = path.resolve(
      __dirname,
      '../files/videos/sum-preview.mp4',
    );
    const { size } = fs.statSync(videoPath);
    const headers = {
      'Content-Type': 'video/mp4',
      'Content-Length': size,
    };
    const range = req.headers.range;

    if (range) {
      const [start, end] = range.replace('bytes=', '').split('-');
      const newEnd = end || size - 1;
      headers['Content-Length'] = +newEnd - +start + 1;
      headers['Content-Range'] = `bytes ${start}-${newEnd}/${size}`;
      headers['Accept-Ranges'] = `bytes`;
      res.writeHead(206, headers);

      const stream = fs.createReadStream(videoPath, {
        start: +start,
        end: +newEnd,
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, headers);
      fs.createReadStream(videoPath).pipe(res);
    }
  }
}

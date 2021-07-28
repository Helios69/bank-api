import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getVideo(@Req() req, @Res() res) {
    return this.appService.getVideo(req, res);
  }
}

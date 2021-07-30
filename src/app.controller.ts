import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Get main video' })
  getVideo(@Req() req, @Res() res) {
    return this.appService.getVideo(req, res);
  }
}

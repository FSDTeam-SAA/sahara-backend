import {
  Body,
  Controller,
  Patch,
  Req,
  UseGuards,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request, Response } from 'express';
import { sendResponse } from '../common/utils/sendResponse';
import { FileInterceptor } from '@nestjs/platform-express';
import type { File as MulterFile } from 'multer';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @UseInterceptors(FileInterceptor('avatar'))
  async updateUser(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
    @UploadedFile() avatar?: MulterFile,
  ) {
    const userId = (req.user as any)?.userId;
    console.log("userId", userId);
    const updatedUser = await this.userService.updateUser(
      userId,
      updateUserDto,
      avatar,
    );
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  }
}

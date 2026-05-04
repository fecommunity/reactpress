import { Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { File } from './file.entity';
import { FileService } from './file.service';

@ApiTags('File')
@Controller('file')
@UseGuards(RolesGuard)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  /**
   * 上传文件
   * @param file
   */
  @ApiResponse({ status: 200, description: '上传文件', type: [File] })
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fieldSize: 5 * 1024 * 1024, // 5MB
      },
    })
  )
  @UseGuards(JwtAuthGuard)
  uploadFile(@UploadedFile() file, @Query('unique') unique) {
    return this.fileService.uploadFile(file, unique);
  }

  /**
   * 获取所有文件
   */
  @Get()
  findAll(@Query() queryParam) {
    return this.fileService.findAll(queryParam);
  }

  /**
   * 获取指定文件
   * @param id
   */
  @Get(':id')
  findById(@Param('id') id) {
    return this.fileService.findById(id);
  }

  /**
   * 删除文件
   * @param id
   */
  @Delete(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard)
  deleteById(@Param('id') id) {
    return this.fileService.deleteById(id);
  }
}

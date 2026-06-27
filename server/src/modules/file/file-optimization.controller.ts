import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import {
  ImageOptimizeReport,
  OptimizeJob,
  OptimizeRunOptions,
  RewriteContentResult,
} from './file-optimization.types';
import { FileOptimizationService } from './file-optimization.service';
import { ImageOptimizerPluginGuard } from './image-optimizer-plugin.guard';

@ApiTags('File')
@Controller('file/optimize')
@UseGuards(JwtAuthGuard, RolesGuard, ImageOptimizerPluginGuard)
@Roles('admin')
export class FileOptimizationController {
  constructor(private readonly optimizationService: FileOptimizationService) {}

  @Get('report')
  @ApiResponse({ status: 200, description: 'Analyze legacy image assets' })
  getReport(): Promise<ImageOptimizeReport> {
    return this.optimizationService.analyze();
  }

  @Post('run')
  @ApiResponse({ status: 200, description: 'Start batch image optimization job' })
  startRun(@Body() body: OptimizeRunOptions): Promise<OptimizeJob> {
    return this.optimizationService.startJob(body ?? {});
  }

  @Get('job/:id')
  @ApiResponse({ status: 200, description: 'Get optimization job status' })
  getJob(@Param('id') id: string): OptimizeJob {
    return this.optimizationService.getJob(id);
  }

  @Post('rewrite')
  @ApiResponse({ status: 200, description: 'Rewrite article/page content URLs' })
  rewrite(@Body() body: { urlMap?: Record<string, string> }): Promise<RewriteContentResult> {
    return this.optimizationService.rewriteContentUrls(body?.urlMap ?? {});
  }
}

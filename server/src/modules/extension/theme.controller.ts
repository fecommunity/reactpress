import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard } from '../auth/roles.guard';
import { ThemeService } from './theme.service';
@ApiTags('Extension')
@Controller('extension/themes')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('active/public')
  @ApiResponse({ status: 200, description: 'Current active theme for local dev / public site' })
  getActivePublic() {
    return this.themeService.getActiveThemePublic();
  }

  @Get()
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'List installed and bundled themes' })
  list() {
    return this.themeService.listThemes();
  }

  @Post('preview-session/end')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({ status: 200, description: 'Restore local dev theme to DB active theme' })
  endPreviewSession() {
    return this.themeService.endPreviewSession();
  }

  @Post(':id/preview-session')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiResponse({
    status: 200,
    description: 'Run local theme dev for preview without activating in DB',
  })
  beginPreviewSession(@Param('id') id: string) {
    return this.themeService.beginPreviewSession(id);
  }

  @Get(':id/screenshot')
  screenshot(@Param('id') id: string, @Res() res: Response) {
    const filePath = this.themeService.getScreenshotPath(id);
    if (filePath) {
      res.sendFile(filePath);
      return;
    }
    const svg = this.themeService.buildPlaceholderScreenshotSvg(id);
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.send(svg);
  }

  @Get(':id/preview')
  async preview(
    @Param('id') id: string,
    @Query('mods') modsQuery: string | undefined,
    @Res() res: Response,
  ) {
    let overrideMods: Record<string, string> = {};
    if (modsQuery) {
      try {
        overrideMods = JSON.parse(decodeURIComponent(modsQuery)) as Record<string, string>;
      } catch {
        overrideMods = {};
      }
    }
    const mods = await this.themeService.getPreviewMods(id, overrideMods);
    const html = this.themeService.buildPreviewHtml(id, mods);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get(':id')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  getOne(@Param('id') id: string) {
    return this.themeService.getTheme(id);
  }

  @Post(':id/install')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  install(@Param('id') id: string) {
    return this.themeService.installTheme(id);
  }

  @Post(':id/activate')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  activate(@Param('id') id: string) {
    return this.themeService.activateTheme(id);
  }

  @Post(':id/mods')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateMods(@Param('id') id: string, @Body() body: { mods?: Record<string, string> }) {
    return this.themeService.updateThemeMods(id, body?.mods ?? {});
  }
}

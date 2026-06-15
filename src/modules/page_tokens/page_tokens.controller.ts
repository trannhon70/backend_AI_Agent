import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PageTokensService } from './page_tokens.service';
import { CreatePageTokenDto } from './dto/create-page_token.dto';
import { UpdatePageTokenDto } from './dto/update-page_token.dto';

@Controller('page-tokens')
export class PageTokensController {
  constructor(private readonly pageTokensService: PageTokensService) {}

  @Post()
  create(@Body() createPageTokenDto: CreatePageTokenDto) {
    return this.pageTokensService.create(createPageTokenDto);
  }

  @Get()
  findAll() {
    return this.pageTokensService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pageTokensService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePageTokenDto: UpdatePageTokenDto) {
    return this.pageTokensService.update(+id, updatePageTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pageTokensService.remove(+id);
  }
}

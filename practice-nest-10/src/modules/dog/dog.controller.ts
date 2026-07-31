import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
} from '@nestjs/common';
import { DogService } from './dog.service';
import { CreateDogDto } from './dto/create-dog.dto';
import { UpdateDogDto } from './dto/update-dog.dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Controller('dog')
export class DogController {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly dogService: DogService,
  ) {}

  @Post()
  async create(@Body() createDogDto: CreateDogDto) {
    await this.cacheManager.set('test-key', new Date().getTime());

    return this.dogService.create(createDogDto);
  }

  @Get()
  findAll() {
    return this.dogService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const getFromCache = await this.cacheManager.get('test-key');
    console.log({ getFromCache });
    return this.dogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDogDto: UpdateDogDto) {
    return this.dogService.update(+id, updateDogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dogService.remove(+id);
  }
}

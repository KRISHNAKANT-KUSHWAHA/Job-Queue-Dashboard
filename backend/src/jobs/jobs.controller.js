import {
  Controller,
  Dependencies,
  Bind,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobStatusDto } from './dto/update-job-status.dto';

// Helper to validate incoming plain JavaScript request bodies against DTO classes
async function validateDto(DtoClass, rawData) {
  const instance = plainToInstance(DtoClass, rawData || {});
  const errors = await validate(instance);
  if (errors.length > 0) {
    const messages = errors.flatMap((err) =>
      Object.values(err.constraints || {})
    );
    throw new BadRequestException(messages);
  }
  return instance;
}

@Controller('jobs')
@Dependencies(JobsService)
export class JobsController {
  constructor(jobsService) {
    this.jobsService = jobsService;
  }

  @Post()
  @Bind(Body())
  async create(body) {
    const createJobDto = await validateDto(CreateJobDto, body);
    return this.jobsService.create(createJobDto);
  }

  @Get()
  @Bind(Query('status'))
  findAll(status) {
    return this.jobsService.findAll(status);
  }

  @Patch(':id/status')
  @Bind(Param('id'), Body())
  async updateStatus(id, body) {
    const updateJobStatusDto = await validateDto(UpdateJobStatusDto, body);
    return this.jobsService.updateStatus(id, updateJobStatusDto.status);
  }

  @Delete(':id')
  @Bind(Param('id'))
  remove(id) {
    return this.jobsService.remove(id);
  }
}

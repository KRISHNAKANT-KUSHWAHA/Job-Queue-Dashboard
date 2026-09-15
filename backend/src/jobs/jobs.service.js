import {
  Injectable,
  Dependencies,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JobEntity } from './job.entity';

@Injectable()
@Dependencies(getRepositoryToken(JobEntity))
export class JobsService {
  constructor(jobsRepository) {
    this.jobsRepository = jobsRepository;
  }

  // Allowed state transitions based on the business rules
  allowedTransitions = {
    pending: ['running', 'failed'],
    running: ['completed', 'failed'],
    completed: [],
    failed: [],
  };

  async findAll(status) {
    const where = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    return this.jobsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id) {
    const job = await this.jobsRepository.findOneBy({ id: Number(id) });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async create(createJobDto) {
    const job = this.jobsRepository.create({
      title: createJobDto.title.trim(),
      type: createJobDto.type.trim(),
      status: 'pending',
    });
    return this.jobsRepository.save(job);
  }

  async updateStatus(id, newStatus) {
    const job = await this.findOne(id);

    // Validate that the requested status transition is allowed
    const validNextStates = this.allowedTransitions[job.status] || [];
    if (!validNextStates.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition: cannot change job from '${job.status}' to '${newStatus}'`
      );
    }

    // Only update if the job is still in the expected current status.
    // This atomic conditional update prevents race conditions if two requests try to change the status at the same time.
    const result = await this.jobsRepository.update(
      { id: Number(id), status: job.status },
      { status: newStatus }
    );

    // If no row was affected, another request changed the status first
    if (result.affected === 0) {
      throw new ConflictException(
        'Job was already updated by another request. Please refresh and try again.'
      );
    }

    return this.findOne(id);
  }

  async remove(id) {
    const job = await this.findOne(id);
    await this.jobsRepository.delete(job.id);
    return { message: `Job #${id} deleted successfully` };
  }
}

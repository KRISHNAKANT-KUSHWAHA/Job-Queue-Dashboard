import { EntitySchema } from 'typeorm';

export class Job {
  constructor(id, title, type, status, createdAt, updatedAt) {
    this.id = id;
    this.title = title;
    this.type = type;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

export const JobEntity = new EntitySchema({
  name: 'Job',
  target: Job,
  tableName: 'jobs',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
      length: 255,
    },
    type: {
      type: 'varchar',
      length: 100,
    },
    status: {
      type: 'varchar',
      length: 50,
      default: 'pending',
    },
    createdAt: {
      type: 'datetime',
      createDate: true,
    },
    updatedAt: {
      type: 'datetime',
      updateDate: true,
    },
  },
});

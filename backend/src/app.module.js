import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from './jobs/job.entity';
import { JobsModule } from './jobs/jobs.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'database.sqlite',
      entities: [JobEntity],
      synchronize: true,
    }),
    JobsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}

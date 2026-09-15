import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateJobStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(['running', 'completed', 'failed'], {
    message: 'Status must be one of: running, completed, failed',
  })
  status;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateJobDto {
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  title;

  @IsNotEmpty({ message: 'Type is required' })
  @IsString({ message: 'Type must be a string' })
  type;
}

import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(100, { message: 'Title must not exceed 100 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MinLength(10, { message: 'Description must be at least 10 characters' })
  @MaxLength(5000, { message: 'Description must not exceed 5000 characters' })
  description: string;

  @IsOptional()
  pics?: Buffer[];

  @IsOptional()
  @IsString({ message: 'Price must be a string' })
  @Matches(/^\d+(\.\d{1,12})?$/, {
    message:
      'Price must be a valid positive number with up to 12 decimal places',
  })
  price: string;
}

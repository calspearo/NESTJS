import { IsString, IsArray, ArrayNotEmpty, IsEmail, IsNotEmpty } from 'class-validator';

class BookDto {
  @IsNotEmpty()
  @IsString()
  isbn13: string;
}

export class UserBooksDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsArray()
  @ArrayNotEmpty()
  isbn13list: BookDto[];
}
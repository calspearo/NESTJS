import { Controller, Get, Post, Body } from '@nestjs/common';
import { Param, Delete } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { BookService } from './book.service';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  @Post()
  create(@Body() createBookDto: Prisma.BookCreateInput) {
    return this.bookService.create(createBookDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookService.findOne(+id);
  }

  @Delete(':isbn13')
  remove(@Param('isbn13') isbn13: string) {
    return this.bookService.removeAssignment(isbn13);
  }

  @Get()
  findAll() {
    return this.bookService.findall();
  }
}

import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class BookService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: Prisma.BookCreateInput) {
    const bookrecord = await this.databaseService.book.findUnique({
      where: {
        isbn13: data.isbn13,
      },
    });
    if (bookrecord) {
      throw new InternalServerErrorException(`Book with isbn13:"${bookrecord.isbn13}" already exists.`);
    } else {
        try {
          return this.databaseService.book.create({
            data,
        });
      } catch (error) {
          console.error('Error adding a new book:', error);
          throw new InternalServerErrorException('Failed to add book');
      }
    }
  }

  async findOne(id: number) {
    return this.databaseService.book.findUnique({
      where: {
        id,
      },
    });
  }

  async removeAssignment(isbn13: string) {
    // To remove assignment given an isbn13, here are the steps taken:
    // 1 - Find the book_id from the Book table. 
    //    At the same time, we find if that book actually exists in the Book table. 
    // 2 - Query the BookAssignment table to get the assignment ID and at the same time, 
    //    make sure that there is in fact an assignment (i.e., a row in the BookAssignment table)
    // 3 - Remove the row in BookAssignment with the id found in step 2. 
    const bookrecord = await this.databaseService.book.findUnique({
      where: {
        isbn13: isbn13,
      },
    });
    console.log(bookrecord.id);

    if (!bookrecord){
      throw new NotFoundException(`Book with isbn13:"${bookrecord.isbn13}" not found.`);
    }
    else {
      const assignment = await this.databaseService.bookAssignment.findUnique({
        where: {
          book_id: bookrecord.id,
        },
      });
      if (!assignment){
        throw new NotFoundException(`Book with isbn13:"${bookrecord.isbn13}" has already been checked out.`);
      }
      else {
        try {
          const result = await this.databaseService.bookAssignment.delete({
            where: {
              id: assignment.id,
            },
          });
          return {
            message: `Book with isbn13:"${isbn13}" is now checked in.`,
            data: result,
          };
       
        } catch (error) {
          console.error('Error removing assignments:', error);
          throw new InternalServerErrorException('Failed to remove books from assignments');
        }
    }
   }
  }

  async findall() {
    const books = await this.databaseService.book.findMany({
      include: {
        bookAssignments: {
          include: {
            user: true, // Include the user related to the book assignment
          },
        },
      },
    });

    // Format the output so that we only display the required fields. 

    return books.map((book) => ({
      isbn13: book.isbn13,
      name: book.name,
      author: book.author,
      checkOutDate: book.bookAssignments.length ? book.bookAssignments[0].checkoutDate : null,
      userName: book.bookAssignments.length ? book.bookAssignments[0].user.name : null,
    }));
  }
}

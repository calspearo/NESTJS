import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { UserBooksDto } from './dto/create-user-books.dto';

@Injectable()
export class UserService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(data: Prisma.UserCreateInput) {
    // before we try to create a new user record, let's make sure the user does not exists. 
    const user = await this.databaseService.user.findUnique({
      where: { email: data.email },
    });
    if (user)
      throw new InternalServerErrorException(`A user with email "${user.email}" already exists.`);
    else
      try {
         return await this.databaseService.user.create({
          data,
        });
      } catch (error) {
        console.error('Error creating a new user account:', error);
        throw new InternalServerErrorException(
          'Failed to create a new user account',
        );
      }
  }

  async findAll() {
    return this.databaseService.user.findMany();
  }

  async findOne(id: number) {
    return this.databaseService.user.findUnique({
      where: {
        id,
      },
    });
  }

  async remove(id: number) {
    // before we try to delete the user, let's make sure user exists. 
    const user = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User "${id}" not found.`);
    } else
      try {
        return await this.databaseService.user.delete({
          where: {
            id,
          },
        });
      } catch (error) {
        console.error('Error removing user account from system:', error);
        throw new InternalServerErrorException('Failed to remove user account');
    }
  }

  async asignBooksToUser(userBookDto: UserBooksDto) {
    const email = userBookDto.email;
    const books = userBookDto.isbn13list;
    const bookIdentifiers = books.map((book) => book.isbn13);
    let result = {};

    const user = await this.databaseService.user.findUnique({
      where: { email },
    });

    // Iterate through the books, look up their ids, and create BooksAssignment records
    // eslint-disable-next-line no-var
    for (var book of books) {
      // first make sure that book exists in the database
      const bookRecord = await this.databaseService.book.findUnique({
        where: { isbn13: book.isbn13 },
      });

      if (!bookRecord) {
        throw new NotFoundException(`Book "${book.isbn13}" not found.`);
      } else {
        // then make sure the assignment that the assignment we want to create, doesn't exist already.
        const bookAssignment =
          await this.databaseService.bookAssignment.findFirst({
            where: {
              AND: [{ user_id: user.id }, { book_id: bookRecord.id }],
            },
          });

        if (bookAssignment) {
          throw new InternalServerErrorException(`Book isbn13:"${book.isbn13}" titled "${bookRecord.name}" has already been asigned to another user.`);
        } else {
          // if all is well create the assignment with the foreign keys from book and user
          try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
             result = await this.databaseService.bookAssignment.create({
              data: {
                user_id: user.id,
                book_id: bookRecord.id,
              },
            });
          } catch (error) {
            console.error('Error making a book assignments:', error);
            throw new InternalServerErrorException(
              'Failed to make a book assignments',
            );
          }
        }
      }
    }
    // if all books are assigned successfully return the list of books assigned
    // and the result of the last successful assignment
    return {
      message: `Books with ISBNs: "${bookIdentifiers.join(', ')}" have been checked out.`,
      data: result,
    };
  }
}

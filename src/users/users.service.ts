import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user-dto';
import { v4 as uuid4 } from "uuid";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(userDTO: CreateUserDto): Promise<Omit<User, 'password'>> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(userDTO.password, salt);
    const apiKey = uuid4();
    const userToSave = { ...userDTO, password: hashedPassword, apiKey } as User;
    try {
      const user = await this.usersRepository.save(userToSave);
      const { password, ...result } = user;
      return result;
    } catch (error) {
      if (error.code === '23505' || error.code === 'SQLITE_CONSTRAINT') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  // Find all users
  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      select: ['id', 'firstName', 'lastName', 'email'],
      relations: ['playLists'],
    });
  }

  // Find one user by ID
  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: ['id', 'firstName', 'lastName', 'email', 'twoFASecret', 'enable2FA'],
    });
  }

  async findOneByEmail(data: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email: data } });
    if (!user) {
      throw new UnauthorizedException(`Could not find User: ${data}`);
    }
    return user;
  }

  async updateSecretKey(userId: number, secret: string): Promise<UpdateResult> {
    return this.usersRepository.update(
      { id: userId },
      {
        twoFASecret: secret,
        enable2FA: true,
      },
    );
  }

  async disable2FA(userId: number): Promise<UpdateResult> {
    return this.usersRepository.update(
      { id: userId },
      {
        twoFASecret: '',
        enable2FA: false,
      },
    );
  }


}

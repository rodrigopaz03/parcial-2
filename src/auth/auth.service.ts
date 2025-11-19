import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/auth.entity';
import { CreateUserDto } from './dto/create-auth.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';



@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

    async create(createUserDto: CreateUserDto) {
      try {
        const { password, ...userData } = createUserDto;

        const user = this.userRepository.create({
          ...userData,
          password: bcrypt.hashSync(password, 10),
        });

        await this.userRepository.save(user);

    
        const { password: _removed, ...userWithoutPassword } = user;

        return userWithoutPassword; 
      } catch (error) {
        console.log(error);
        this.handleDBErrors(error);
      }
    }


  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      // violación de unique constraint
      throw new BadRequestException(error.detail);
    }

    console.log(error);
    throw new InternalServerErrorException('Please check server logs');
  }

async login(loginUserDto: LoginUserDto) {
  try {
    const user = await this.userRepository.findOne({
      where: { email: loginUserDto.email },
      select: { email: true, password: true, id: true, fullName: true, isActive: true }, 
    });

    if (!user) {
      throw new UnauthorizedException('Credentials are not valid');
    }

    const isPasswordValid = bcrypt.compareSync(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Credentials are not valid');
    }

    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      token: this.getJwtToken({ email: user.email }), // <- JWT aquí
    };
  } catch (error) {
    this.handleDBErrors(error);
  }
}


private getJwtToken(payload: JwtPayloadInterface): string {
  const token = this.jwtService.sign(payload);
  return token;
}
}

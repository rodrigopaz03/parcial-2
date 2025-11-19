import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from './entities/auth.entity';
import { JwtPayloadInterface } from './interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ){
    super({
      secretOrKey: "key ok",
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    })
  }

  async validate(payload: JwtPayloadInterface): Promise<User> {

    const{ email } = payload;

    const user = await this.userRepository.findOneBy({email});

    if(!user){
      throw new UnauthorizedException()
    }

    if(!user.isActive){
      throw new UnauthorizedException()
    }

    return user;
  }
}

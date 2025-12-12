import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(email: string, username: string, password: string) {
    const existe = await this.usersService.findByEmail(email.toLowerCase());
    if (existe) throw new BadRequestException('Email ya registrado');

    const passwordHash = await bcrypt.hash(password, 12);
    const esDemo = email.toLowerCase().includes('demo');

    const nuevoUsuario: any = await this.usersService.create({
      email: email.toLowerCase(),
      username,
      passwordHash,
      saldo: esDemo ? 100000 : 0,
      esDemo,
    });

    return {
      access_token: this.jwtService.sign({ sub: nuevoUsuario._id.toString() }),
      user: {
        id: nuevoUsuario._id.toString(),
        email: nuevoUsuario.email,
        username: nuevoUsuario.username,
        saldo: nuevoUsuario.saldo,
        esDemo: nuevoUsuario.esDemo,
      },
    };
  }

  async getUser(userId: string) {
  const user: any = await this.usersService.findOne(userId);
  if (!user) {
    throw new BadRequestException('Usuario no encontrado');
  }

  return {
    id: user._id.toString(),
    email: user.email,
    username: user.username,
    saldo: user.saldo,
    esDemo: user.esDemo,
  };
}

  async login(email: string, password: string) {
    const user: any = await this.usersService.findByEmail(email.toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new BadRequestException('Credenciales inválidas');
    }

    return {
      access_token: this.jwtService.sign({ sub: user._id.toString() }),
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        saldo: user.saldo,
        esDemo: user.esDemo,
      },
    };
  }
}
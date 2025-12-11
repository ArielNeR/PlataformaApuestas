// backend/src/auth/dto/register.dto.ts (CREAR)
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @IsString()
  @MinLength(3, { message: 'Username mínimo 3 caracteres' })
  @MaxLength(20, { message: 'Username máximo 20 caracteres' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Contraseña mínimo 6 caracteres' })
  password: string;
}
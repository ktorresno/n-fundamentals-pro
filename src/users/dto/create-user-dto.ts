import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  /**
   * The user's password.
   *
   * Required and must be a non-empty string. This value is provided at creation or when updating credentials
   * and is validated by the DTO (e.g. using IsNotEmpty and IsString). Enforce application-specific
   * complexity and length rules (for example, a minimum length of 8 and a mix of character types).
   *
   * Security notes:
   * - Never log or expose this value.
   * - Always hash the password using a secure algorithm (e.g. bcrypt, Argon2) before persisting.
   *
   * @example "Str0ngP@ssw0rd!"
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}

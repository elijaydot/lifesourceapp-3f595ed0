import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { AppRole } from '../common/roles.decorator';

@Injectable()
export class AuthService {
  constructor(private users: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, pass: string) {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(pass, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user._id.toString(), email: user.email, role: user.role as AppRole };
    return {
      access_token: await this.jwt.signAsync(payload),
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
    };
  }

  async signup(name: string, email: string, password: string, role: AppRole) {
    if (!['donor', 'recipient'].includes(role)) {
      throw new BadRequestException('Only donor or recipient can self-signup');
    }
    const exists = await this.users.findByEmail(email);
    if (exists) throw new BadRequestException('Email already registered');
    const hash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ name, email, password: hash, role });
    const payload = { sub: user._id.toString(), email: user.email, role: user.role as AppRole };
    return { access_token: await this.jwt.signAsync(payload) };
  }
}

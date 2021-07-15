import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';

@Injectable()
export class UserIsMeGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const params = request.params;

    return user.id === Number(params.id);
  }
}

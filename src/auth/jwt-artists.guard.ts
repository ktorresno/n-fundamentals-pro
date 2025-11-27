import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Observable } from "rxjs";

@Injectable()
export class JwtArtistsGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // const request = context.switchToHttp().getRequest();
        // const token = request.headers.authorization.split(' ')[1];
        // request.headers.authorization = `Bearer ${token}`;
        return super.canActivate(context);
    }

    handleRequest<TUser = any>(err, user): TUser {
        if (err || !user) {
            throw err || new UnauthorizedException();
        }
        console.log('Artist Guard: ',user);
        if (user.artistId) {
            return user;
        }
        throw err ||new UnauthorizedException();
    }
}
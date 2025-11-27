import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { authConstants } from "./auth.constants";
import { PayloadType } from "src/types/payLoad.type";

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
    constructor() {
      super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          ignoreExpiration: false,
          secretOrKey: authConstants.JWT_SECRET,
      });
    }

    async validate(payload: PayloadType) {
      return { userId: payload.userId, email: payload.email, artistId: payload.artistId };
    }
}
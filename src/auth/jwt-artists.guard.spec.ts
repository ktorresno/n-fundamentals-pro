import { JwtArtistsGuard } from './jwt-artists.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtArtistsGuard', () => {
  let guard: JwtArtistsGuard;

  beforeEach(() => {
    guard = new JwtArtistsGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user if user has artistId', () => {
      const user = { artistId: 1 };
      expect(guard.handleRequest(null, user)).toBe(user);
    });

    it('should throw UnauthorizedException if error is present', () => {
      const err = new Error('Test error');
      expect(() => guard.handleRequest(err, { artistId: 1 })).toThrow(err);
    });

    it('should throw UnauthorizedException if user is missing', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user does not have artistId', () => {
      const user = { id: 1 };
      expect(() => guard.handleRequest(null, user)).toThrow(
        UnauthorizedException,
      );
    });
  });
});

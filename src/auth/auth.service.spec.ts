import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { RoleEnum } from '../roles/roles.enum';
import { PersistedUser } from '../users/infrastructure/persistence/user-repository';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
  } as unknown as UsersService;

  const jwtServiceMock = {
    signAsync: jest.fn(),
  } as unknown as JwtService;

  const mockedCompare = compare as unknown as jest.Mock;

  const persistedUser: PersistedUser = {
    id: 1,
    email: 'user@example.com',
    password: 'hashed-password',
    role: RoleEnum.user,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new AuthService(usersServiceMock, jwtServiceMock);
  });

  it('throws for blank credentials', async () => {
    await expect(service.login('   ', 'password')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    await expect(service.login('user@example.com', '')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('throws when user is not found', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      service.login('USER@EXAMPLE.COM', 'password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersServiceMock.findByEmail).toHaveBeenCalledWith('USER@EXAMPLE.COM');
  });

  it('throws when password is invalid', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(persistedUser);
    mockedCompare.mockResolvedValue(false);

    await expect(
      service.login('user@example.com', 'wrong-password'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns token and public user for valid credentials', async () => {
    (usersServiceMock.findByEmail as jest.Mock).mockResolvedValue(persistedUser);
    mockedCompare.mockResolvedValue(true);
    (jwtServiceMock.signAsync as jest.Mock).mockResolvedValue('signed-token');

    const result = await service.login('user@example.com', 'valid-password');

    expect(result).toEqual({
      token: 'signed-token',
      user: { id: 1, email: 'user@example.com', role: RoleEnum.user },
    });
    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      id: persistedUser.id,
      role: persistedUser.role,
    });
  });

  it('throws when me receives empty id', async () => {
    await expect(service.me('')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('throws NotFoundException when me user is missing', async () => {
    (usersServiceMock.findById as jest.Mock).mockResolvedValue(null);

    await expect(service.me(999)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('returns user for me when id exists', async () => {
    const publicUser = {
      id: 1,
      email: 'user@example.com',
      role: RoleEnum.user,
    };

    (usersServiceMock.findById as jest.Mock).mockResolvedValue(publicUser);

    await expect(service.me(1)).resolves.toEqual(publicUser);
    expect(usersServiceMock.findById).toHaveBeenCalledWith(1);
  });
});

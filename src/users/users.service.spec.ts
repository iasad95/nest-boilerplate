import { ConflictException } from '@nestjs/common';
import { hash } from 'bcryptjs';
import { RoleEnum } from '../roles/roles.enum';
import {
  PaginatedResult,
  PersistedUser,
  UserRepository,
} from './infrastructure/persistence/user-repository';
import { UsersService } from './users.service';

jest.mock('bcryptjs', () => ({ hash: jest.fn() }));

const mockedHash = hash as jest.Mock;

const persistedUser: PersistedUser = {
  id: 1,
  email: 'user@example.com',
  password: 'hashed-password',
  role: RoleEnum.user,
};

const publicUser = { id: 1, email: 'user@example.com', role: RoleEnum.user };

describe('UsersService', () => {
  let service: UsersService;

  const repoMock = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
  } as unknown as UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    mockedHash.mockResolvedValue('hashed-password');
    service = new UsersService(repoMock);
  });

  describe('findAll', () => {
    it('returns paginated public users with passwords stripped', async () => {
      const paginated: PaginatedResult<PersistedUser> = {
        data: [persistedUser],
        total: 1,
        page: 1,
        limit: 20,
      };
      (repoMock.findAll as jest.Mock).mockResolvedValue(paginated);

      const result = await service.findAll({ page: 1, limit: 20 });

      expect(result.data).toEqual([publicUser]);
      expect(result.data[0]).not.toHaveProperty('password');
      expect(result.total).toBe(1);
      expect(repoMock.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('findById', () => {
    it('returns null when user is not found', async () => {
      (repoMock.findById as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).resolves.toBeNull();
    });

    it('returns public user without password when found', async () => {
      (repoMock.findById as jest.Mock).mockResolvedValue(persistedUser);

      const result = await service.findById(1);

      expect(result).toEqual(publicUser);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findByEmail', () => {
    it('normalizes email (trim + lowercase) before querying', async () => {
      (repoMock.findByEmail as jest.Mock).mockResolvedValue(persistedUser);

      await service.findByEmail('  USER@EXAMPLE.COM  ');

      expect(repoMock.findByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('returns the full persisted user including password hash', async () => {
      (repoMock.findByEmail as jest.Mock).mockResolvedValue(persistedUser);

      const result = await service.findByEmail('user@example.com');

      expect(result).toHaveProperty('password');
    });
  });

  describe('create', () => {
    it('throws ConflictException when the email is already registered', async () => {
      (repoMock.findByEmail as jest.Mock).mockResolvedValue(persistedUser);

      await expect(
        service.create({ email: 'user@example.com', password: 'pass123', role: RoleEnum.user }),
      ).rejects.toBeInstanceOf(ConflictException);

      expect(repoMock.create).not.toHaveBeenCalled();
    });

    it('hashes the password with 10 rounds before persisting', async () => {
      (repoMock.findByEmail as jest.Mock).mockResolvedValue(null);
      (repoMock.create as jest.Mock).mockResolvedValue(persistedUser);

      await service.create({ email: 'new@example.com', password: 'plain-pass', role: RoleEnum.user });

      expect(mockedHash).toHaveBeenCalledWith('plain-pass', 10);
      expect(repoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
    });

    it('normalizes email before deduplication check and persistence', async () => {
      (repoMock.findByEmail as jest.Mock).mockResolvedValue(null);
      (repoMock.create as jest.Mock).mockResolvedValue(persistedUser);

      await service.create({ email: '  NEW@EXAMPLE.COM  ', password: 'pass123', role: RoleEnum.user });

      expect(repoMock.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(repoMock.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@example.com' }),
      );
    });

    it('returns a public user without password after creation', async () => {
      (repoMock.findByEmail as jest.Mock).mockResolvedValue(null);
      (repoMock.create as jest.Mock).mockResolvedValue(persistedUser);

      const result = await service.create({
        email: 'new@example.com',
        password: 'pass123',
        role: RoleEnum.user,
      });

      expect(result).toEqual(publicUser);
      expect(result).not.toHaveProperty('password');
    });
  });
});

import { RoleEnum } from '../roles/roles.enum';
import { PaginationDto } from '../common/dto/pagination.dto';
import { User } from './domain/user';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;

  const usersServiceMock = {
    findAll: jest.fn(),
    create: jest.fn(),
  } as unknown as UsersService;

  const publicUser: User = { id: 1, email: 'user@example.com', role: RoleEnum.user };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersController(usersServiceMock);
  });

  describe('findAll', () => {
    it('delegates to usersService.findAll with the supplied pagination options', async () => {
      const pagination: PaginationDto = { page: 2, limit: 10 };
      const expected = { data: [publicUser], total: 1, page: 2, limit: 10 };
      (usersServiceMock.findAll as jest.Mock).mockResolvedValue(expected);

      const result = await controller.findAll(pagination);

      expect(usersServiceMock.findAll).toHaveBeenCalledWith(pagination);
      expect(result).toBe(expected);
    });
  });

  describe('create', () => {
    it('delegates to usersService.create and returns the created public user', async () => {
      const dto: CreateUserDto = {
        email: 'new@example.com',
        password: 'pass123',
        role: RoleEnum.user,
      };
      (usersServiceMock.create as jest.Mock).mockResolvedValue(publicUser);

      const result = await controller.create(dto);

      expect(usersServiceMock.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(publicUser);
    });
  });
});

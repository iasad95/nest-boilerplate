import { User } from '../domain/user';
import { PersistedUser } from '../infrastructure/persistence/user-repository';

export function toPublicUser(user: PersistedUser): User {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

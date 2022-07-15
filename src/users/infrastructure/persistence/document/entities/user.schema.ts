import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { RoleEnum } from '../../../../../roles/roles.enum';

export type UserDoc = HydratedDocument<UserDocument>;

@Schema({
  timestamps: true,
  collection: 'users',
})
export class UserDocument {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, type: Number, enum: [RoleEnum.admin, RoleEnum.user] })
  role: RoleEnum;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

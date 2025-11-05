import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { IUser } from './user.interface';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  //   async create(data: Partial<IUser>): Promise<IUser> {
  //     if (!data.password) throw new Error('Password is required');
  //     const hash = await bcrypt.hash(data.password, 10);
  //     return this.userModel.create({ ...data, password: hash });
  //   }

  async create(data: Partial<User>): Promise<UserDocument> {
    if (!data.password) throw new Error('Password is required');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save(); // ✅ returns a full Mongoose Document with toObject()
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async updateUser(id: string, updateData: any): Promise<IUser | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
      select: '_id name email password role',
    });

    if (updatedUser) {
      return updatedUser.toObject() as IUser; // Cast the _id property to string
    }

    return null;
  }
}

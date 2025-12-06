import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import cloudinary from '../common/cloudinary';
import type { File as MulterFile } from 'multer';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(data: Partial<User>): Promise<UserDocument> {
    if (!data.password) throw new Error('Password is required');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new this.userModel({ ...data, password: hashedPassword });
    return user.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async findById(id: string) {
    return this.userModel.findById(id);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    avatar?: MulterFile,
  ): Promise<Partial<User> | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = { ...updateUserDto };

    if (avatar) {
      const b64 = Buffer.from(avatar.buffer).toString('base64');
      const dataURI = 'data:' + avatar.mimetype + ';base64,' + b64;
      const res = await cloudinary.uploader.upload(dataURI, {
        folder: 'avatars',
      });
      updateData.avatar = res.secure_url;
    }

    console.log("updateData", updateData);

    const updatedUser = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        select:
          'firstName lastName dateOfBirth avatar gender address phoneNum email',
      },
    );

    if (!updatedUser) {
      throw new Error(`User with ID ${id} not found or could not be updated.`);
    }

    return updatedUser ? updatedUser.toObject() : null;
  }

  /**
   * Internal method for system-level updates (e.g., password reset OTP, verification fields)
   * Bypasses DTO validation for internal operations
   */
  async updateUserInternal(
    id: string,
    updateData: Record<string, any>,
  ): Promise<UserDocument | null> {
    return this.userModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
  }
}

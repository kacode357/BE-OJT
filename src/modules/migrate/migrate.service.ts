import { Model } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { CreateSettingDto, ISetting, SettingSchema } from '../setting';
import { IUser, UserSchema } from '../user';

export default class MigrateService {
    private userSchema: Model<IUser> = UserSchema;
    private settingSchema: Model<ISetting> = SettingSchema;

    public async migrateFieldsForUsers(): Promise<IUser[]> {
        const users = await this.userSchema.find({});

        // update new fields
        for (let user of users) {
            user.is_verified = true;
            user.token_version = 0;
            user.balance = 0;
            user.bank_account_no = '';
            user.bank_account_name = '';
            user.bank_name = '';
            await user.save();
        }

        const result = await this.userSchema.find({});

        return result;
    }

    public async migrateSettingDefault(): Promise<ISetting> {
        // check setting default exist
        const settingExist = await this.settingSchema.findOne({});
        if (settingExist) {
            throw new HttpException(HttpStatus.BadRequest, `Setting default is exist`);
        }
        const settingDefault = new CreateSettingDto()
        const createSetting: ISetting = await this.settingSchema.create(settingDefault);
        const result: ISetting = createSetting.toObject();
        return result;
    }
}




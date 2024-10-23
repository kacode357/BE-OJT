import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { ISetting } from './setting.interface';
import SettingSchema from './setting.model';

export default class SettingService {
    public settingSchema = SettingSchema;

    public async getSettingDefault(): Promise<ISetting> {
        const [item] = await this.settingSchema.aggregate([
            { $match: {} },
            { $unwind: '$transactions' },
            { $sort: { 'transactions.created_at': -1 } },
            {
                $group: {
                    _id: '$_id',
                    balance: { $first: '$balance' },
                    balance_total: { $first: '$balance_total' },
                    instructor_ratio: { $first: '$instructor_ratio' },
                    transactions: { $push: '$transactions' },
                    created_at: { $first: '$created_at' },
                    updated_at: { $first: '$updated_at' },
                    is_deleted: { $first: '$is_deleted' },
                },
            },
        ]);

        if (!item) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }

        return item;
    }
}

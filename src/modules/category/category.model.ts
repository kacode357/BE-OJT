import mongoose, { Schema } from 'mongoose';
import { ICategory } from './category.interface';
import { COLLECTION_NAME } from '../../core/constants';

const CategorySchemaEntity: Schema<ICategory> = new Schema({
    name: { type: String, unique: true, index: true, required: true },
    description: { type: String },
    parent_category_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.CATEGORY, default: null },
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const CategorySchema = mongoose.model<ICategory & mongoose.Document>(COLLECTION_NAME.CATEGORY, CategorySchemaEntity);
export default CategorySchema;

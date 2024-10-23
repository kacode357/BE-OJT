import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants';
import { IBlog } from './blog.interface';

const BlogSchemaEntity: Schema<IBlog> = new Schema({
    name: { type: String, index: true, required: true },
    user_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    category_id: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.CATEGORY, required: true },
    description: { type: String, required: true },
    image_url: { type: String, required: true },
    content: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    is_deleted: { type: Boolean, default: false },
});

const BlogSchema = mongoose.model<IBlog & mongoose.Document>(COLLECTION_NAME.BLOG, BlogSchemaEntity);
export default BlogSchema;

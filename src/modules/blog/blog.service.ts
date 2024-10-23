import mongoose, { Model } from 'mongoose';
import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { SearchPaginationResponseModel } from '../../core/models';
import { checkValidUrl, formatPaginationResult, isEmptyObject, itemsQuery } from '../../core/utils';
import { DataStoredInToken } from '../auth';
import { CategorySchema, ICategory } from '../category';
import { IBlog } from './blog.interface';
import BlogSchema from './blog.model';
import CreateBlogDto from './dtos/create.dto';
import SearchBlogDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateBlogDto from './dtos/update.dto';

export default class BlogService {
    private blogSchema: Model<IBlog> = BlogSchema;
    private categorySchema: Model<ICategory> = CategorySchema;

    public async create(model: CreateBlogDto, user: DataStoredInToken): Promise<IBlog> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        model.user_id = user.id;

        // check category exist
        const categoryExist = await this.categorySchema.findOne({ _id: model.category_id, is_deleted: false });
        if (!categoryExist) {
            throw new HttpException(HttpStatus.BadRequest, `Category not found!`);
        }

        // check name duplicates
        const blogExist = await this.blogSchema.findOne({
            name: { $regex: new RegExp('^' + model.name + '$', 'i') },
            is_deleted: false,
        });
        if (blogExist) {
            throw new HttpException(HttpStatus.BadRequest, `Blog with this name '${model.name}' already exists`);
        }

        if (!checkValidUrl(model.image_url)) {
            throw new HttpException(HttpStatus.BadRequest, `The URL '${model.image_url}' is not valid`);
        }

        const createdItem: IBlog = await this.blogSchema.create(model);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }

    public async getItems(model: SearchWithPaginationDto): Promise<SearchPaginationResponseModel<IBlog>> {
        const searchCondition = { ...new SearchBlogDto(), ...model.searchCondition };
        const { category_id, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};

        if (category_id) {
            query = {
                ...query,
                category_id: new mongoose.Types.ObjectId(category_id),
            };
        }

        query = itemsQuery(query, { is_deleted });

        const aggregatePipeline: any[] = [{ $match: query }];

        aggregatePipeline.push(
            { $sort: { created_at: -1 } },
            { $skip: (pageNum - 1) * pageSize },
            { $limit: pageSize },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category_id',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: '$category' },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: '$user' },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    user_id: 1,
                    user_name: '$user.name',
                    category_id: 1,
                    category_name: '$category.name',
                    image_url: 1,
                    description: 1,
                    content: 1,
                    created_at: 1,
                    updated_at: 1,
                    is_deleted: 1,
                },
            },
        );

        const aggregateQuery = this.blogSchema.aggregate(aggregatePipeline);
        const items = await aggregateQuery.exec();
        const rowCount = await this.blogSchema.find(query).countDocuments().exec();
        const data = new SearchPaginationResponseModel<IBlog>();
        const result = formatPaginationResult<IBlog>(data, items, {
            pageNum,
            pageSize,
            totalItems: rowCount,
            totalPages: 0,
        });

        return result;
    }

    public async getItemById(id: string): Promise<IBlog> {
        const detail = await this.blogSchema
            .aggregate<IBlog>([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id),
                        is_deleted: false,
                    },
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'user_id',
                        foreignField: '_id',
                        as: 'user',
                    },
                },
                {
                    $unwind: '$user',
                },
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'category_id',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                {
                    $unwind: '$category',
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        user_id: 1,
                        user_name: '$user.name',
                        category_id: 1,
                        category_name: '$category.name',
                        image_url: 1,
                        description: 1,
                        content: 1,
                        created_at: 1,
                        updated_at: 1,
                        is_deleted: 1,
                    },
                },
                { $limit: 1 },
            ])
            .exec();

        if (!detail || detail.length === 0) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }
        return detail[0];
    }

    public async updateItem(id: string, model: UpdateBlogDto): Promise<IBlog> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        // check item exist
        const detail = await this.blogSchema.findOne({ _id: id, is_deleted: false });
        if (!detail) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }

        if (model.category_id !== detail.category_id) {
            // check category exist
            const categoryExist = await this.categorySchema.findOne({ _id: model.category_id, is_deleted: false });
            if (!categoryExist) {
                throw new HttpException(HttpStatus.BadRequest, `Category not found!`);
            }
        }

        if (model.name.toLocaleLowerCase() !== detail.name.toLocaleLowerCase()) {
            // check name duplicates
            const blogExist = await this.blogSchema.findOne({
                name: { $regex: new RegExp('^' + model.name + '$', 'i') },
                is_deleted: false,
            });
            if (blogExist) {
                throw new HttpException(HttpStatus.BadRequest, `Blog with this name '${model.name}' already exists`);
            }
        }

        if (!checkValidUrl(model.image_url)) {
            throw new HttpException(HttpStatus.BadRequest, `The URL '${model.image_url}' is not valid`);
        }

        const updateData = {
            name: model.name,
            category_id: model.category_id,
            image_url: model.image_url,
            description: model.description,
            content: model.content,
            updated_at: new Date(),
        };

        const updatedItem = await this.blogSchema.updateOne({ _id: id }, updateData);

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Update item info failed!');
        }

        const result = await this.getItemById(id);
        return result;
    }

    public async deleteItem(id: string): Promise<boolean> {
        const item = await this.getItemById(id);
        if (!item || item.is_deleted) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }

        const updatedItem = await this.blogSchema.updateOne({ _id: id }, { is_deleted: true, updated_at: new Date() });

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Delete item failed!');
        }

        return true;
    }
}

import { HttpStatus } from '../../core/enums';
import { HttpException } from '../../core/exceptions';
import { IError } from '../../core/interfaces';
import { SearchPaginationResponseModel } from '../../core/models';
import { isEmptyObject } from '../../core/utils';
import { ICategory } from './category.interface';
import CategorySchema from './category.model';
import CreateCategoryDto from './dtos/create.dto';
import SearchCategoryDto from './dtos/search.dto';
import SearchWithPaginationDto from './dtos/searchWithPagination.dto';
import UpdateCategoryDto from './dtos/update.dto';

export default class CategoryService {
    public categorySchema = CategorySchema;

    public async create(model: CreateCategoryDto, userId: string): Promise<ICategory> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const errorResults: IError[] = [];

        const newModel = {
            ...model,
            parent_category_id: model.parent_category_id || null,
            description: model.description || '',
        };

        // check name valid
        const category = await this.categorySchema.findOne({
            name: { $regex: new RegExp('^' + newModel.name + '$', 'i') },
            is_deleted: false,
        });
        if (category) {
            errorResults.push({
                message: `Category with name is '${newModel.name}' already exists!`,
                field: 'name',
            });
        }

        if (model.parent_category_id) {
            const itemParent = await this.getItemById(model.parent_category_id);
            if (itemParent.parent_category_id) {
                errorResults.push({
                    message: `The selected category with name is '${itemParent.name}' cannot be used as a parent category!`,
                    field: 'parent_category_id',
                });
            }
        }

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        newModel.user_id = userId;
        const createdItem: ICategory = await this.categorySchema.create(newModel);
        if (!createdItem) {
            throw new HttpException(HttpStatus.Accepted, `Create item failed!`);
        }
        return createdItem;
    }

    public async getItems(model: SearchWithPaginationDto): Promise<SearchPaginationResponseModel<ICategory>> {
        const searchCondition = { ...new SearchCategoryDto(), ...model.searchCondition };
        const { keyword, is_parent, is_deleted } = searchCondition;
        const { pageNum, pageSize } = model.pageInfo;

        let query = {};
        if (keyword) {
            const keywordValue = keyword.toLowerCase().trim();
            query = {
                name: { $regex: keywordValue, $options: 'i' },
            };
        }

        if (is_parent) {
            query = {
                ...query,
                parent_category_id: null,
            };
        }

        query = {
            ...query,
            is_deleted,
        };

        const resultQuery = await this.categorySchema
            .find(query)
            .sort({ updated_at: -1 })
            .skip((pageNum - 1) * pageSize)
            .limit(pageSize)
            .exec();

        const rowCount = await this.categorySchema.find(query).countDocuments().exec();
        const result = new SearchPaginationResponseModel<ICategory>();
        result.pageInfo.pageNum = pageNum;
        result.pageInfo.pageSize = pageSize;
        if (rowCount > 0) {
            result.pageData = resultQuery;
            result.pageInfo.totalItems = rowCount;
            result.pageInfo.totalPages = Math.ceil(rowCount / pageSize);
        }

        return result;
    }

    public async getItemById(id: string): Promise<ICategory> {
        const detail = await this.categorySchema.findOne({ _id: id, is_deleted: false }).lean();
        if (!detail) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }
        return detail;
    }

    public async updateItem(id: string, model: UpdateCategoryDto): Promise<ICategory> {
        if (isEmptyObject(model)) {
            throw new HttpException(HttpStatus.BadRequest, 'Model data is empty');
        }

        const errorResults: IError[] = [];

        // check item exits
        const item = await this.getItemById(id);

        // check name duplicates
        if (item.name.toLowerCase() !== model.name.toLowerCase()) {
            const category = await this.categorySchema.findOne({
                name: { $regex: new RegExp('^' + model.name + '$', 'i') },
                is_deleted: false,
            });
            if (category) {
                errorResults.push({ message: `Category with name is '${model.name}' already exists!`, field: 'name' });
            }
        }

        if (model.parent_category_id) {
            const itemParent = await this.getItemById(model.parent_category_id);
            if (itemParent.parent_category_id || id === model.parent_category_id) {
                errorResults.push({
                    message: `The selected category with name is '${itemParent.name}' cannot be used as a parent category!`,
                    field: 'parent_category_id',
                });
            }
        }

        // check valid
        if (errorResults.length) {
            throw new HttpException(HttpStatus.BadRequest, '', errorResults);
        }

        const updateData = {
            name: model.name,
            description: model.description,
            parent_category_id: model.parent_category_id,
            updated_at: new Date(),
        };

        const updatedItem = await this.categorySchema.updateOne({ _id: id }, updateData);

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Update item info failed!');
        }

        const result = await this.getItemById(id);
        return result;
    }

    public async deleteItem(id: string): Promise<boolean> {
        const detail = await this.getItemById(id);
        if (!detail || detail.is_deleted) {
            throw new HttpException(HttpStatus.BadRequest, `Item is not exists.`);
        }

        // check if category is used in any child-category
        const childCategory = await this.categorySchema.findOne({ parent_category_id: id });
        if (childCategory) {
            throw new HttpException(
                HttpStatus.BadRequest,
                'The category cannot be deleted because it is being used as a parent-category for another category.',
            );
        }

        const updatedItem = await this.categorySchema.updateOne(
            { _id: id },
            { is_deleted: true, updated_at: new Date() },
        );

        if (!updatedItem.acknowledged) {
            throw new HttpException(HttpStatus.BadRequest, 'Delete item failed!');
        }

        return true;
    }
}

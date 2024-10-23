import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchCategoryDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchCategoryDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchCategoryDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchCategoryDto)
    public searchCondition!: SearchCategoryDto;
}

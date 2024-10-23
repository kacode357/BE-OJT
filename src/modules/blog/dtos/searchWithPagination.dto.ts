import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchBlogDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchBlogDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchBlogDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchBlogDto)
    public searchCondition!: SearchBlogDto;
}

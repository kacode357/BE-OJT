import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchReviewDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchReviewDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchReviewDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchReviewDto)
    public searchCondition!: SearchReviewDto;
}

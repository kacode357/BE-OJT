import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchSubscriptionDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchSubscriptionDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchSubscriptionDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchSubscriptionDto)
    public searchCondition!: SearchSubscriptionDto;
}

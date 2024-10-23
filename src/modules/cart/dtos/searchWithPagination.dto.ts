import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchCartDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchCartDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchCartDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchCartDto)
    public searchCondition!: SearchCartDto;
}

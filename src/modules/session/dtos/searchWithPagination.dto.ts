import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchSessionDto from './search.dto';


export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchSessionDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchSessionDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchSessionDto)
    public searchCondition!: SearchSessionDto;
}

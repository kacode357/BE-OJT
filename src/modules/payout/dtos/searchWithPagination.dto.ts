import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchPayoutDto from './search.dto';


export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchPayoutDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchPayoutDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchPayoutDto)
    public searchCondition!: SearchPayoutDto;
}

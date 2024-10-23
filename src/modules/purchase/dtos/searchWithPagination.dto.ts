import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchPurchaseDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchPurchaseDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchPurchaseDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchPurchaseDto)
    public searchCondition!: SearchPurchaseDto;
}

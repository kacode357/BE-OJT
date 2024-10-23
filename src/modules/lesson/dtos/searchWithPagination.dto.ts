import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchLessonDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchLessonDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchLessonDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchLessonDto)
    public searchCondition!: SearchLessonDto;
}

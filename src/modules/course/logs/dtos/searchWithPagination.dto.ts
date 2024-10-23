import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../../core/models';
import { PaginationRequestModel } from '../../../../core/models/pagination.model';
import SearchCourseLogDto from './search.dto';

export default class SearchWithPaginationDto extends SearchPaginationRequestModel<SearchCourseLogDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchCourseLogDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchCourseLogDto)
    public searchCondition!: SearchCourseLogDto;
}

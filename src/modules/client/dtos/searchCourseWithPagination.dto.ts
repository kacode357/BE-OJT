import { Type } from 'class-transformer';
import { SearchPaginationRequestModel } from '../../../core/models';
import { PaginationRequestModel } from '../../../core/models/pagination.model';
import SearchCourseDto from './searchCourse.dto';

export default class SearchCourseWithPaginationDto extends SearchPaginationRequestModel<SearchCourseDto> {
    constructor(pageInfo: PaginationRequestModel, searchCondition: SearchCourseDto) {
        super(pageInfo, searchCondition);
    }

    @Type(() => SearchCourseDto)
    public searchCondition!: SearchCourseDto;
}

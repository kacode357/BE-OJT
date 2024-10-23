import { CourseStatusEnum } from './course.enum';

export const CourseStatusList = [
    '',
    CourseStatusEnum.NEW,
    CourseStatusEnum.WAITING_APPROVE,
    CourseStatusEnum.APPROVE,
    CourseStatusEnum.REJECT,
    CourseStatusEnum.ACTIVE,
    CourseStatusEnum.INACTIVE,
];

export const VALID_STATUS_CHANGE_PAIRS = [
    [CourseStatusEnum.NEW, CourseStatusEnum.WAITING_APPROVE],
    [CourseStatusEnum.REJECT, CourseStatusEnum.WAITING_APPROVE],
    [CourseStatusEnum.WAITING_APPROVE, CourseStatusEnum.APPROVE],
    [CourseStatusEnum.WAITING_APPROVE, CourseStatusEnum.REJECT],
    [CourseStatusEnum.APPROVE, CourseStatusEnum.ACTIVE],
    [CourseStatusEnum.APPROVE, CourseStatusEnum.INACTIVE],
    [CourseStatusEnum.ACTIVE, CourseStatusEnum.INACTIVE],
    [CourseStatusEnum.INACTIVE, CourseStatusEnum.ACTIVE],
]

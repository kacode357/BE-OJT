import { IsNotEmpty } from 'class-validator';

export default class UpdateCategoryDto {
    constructor(
        name: string,
        description: string = '',
        parent_category_id: string | null = null,
        user_id: string | null = null,
    ) {
        this.name = name;
        this.parent_category_id = parent_category_id;
        this.user_id = user_id;
        this.description = description;
    }

    @IsNotEmpty()
    public name: string;

    public parent_category_id: string | null;
    public user_id: string | null;
    public description: string;
}

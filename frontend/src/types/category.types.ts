import { MenuItem } from './index';

export interface Category {
    id: string;
    name: string;
    restaurantId: string;
    createdAt: string;
    menuItems?: MenuItem[];
}

export interface CategoryResponse {
    categories: Category[];
}




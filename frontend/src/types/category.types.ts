export interface Category {
    id: string;
    name: string;
    restaurantId: string;
    createdAt: string;
}

export interface CategoryResponse {
    categories: Category[];
    total: number;
    page: number;
    limit: number;
}




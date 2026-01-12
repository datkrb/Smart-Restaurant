export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  selection_type: 'single' | 'multiple';
  required: boolean;
  options: ModifierOption[];
}

export interface MenuItemPhoto {
  id: string;
  menuItemId: string;
  url: string;
  isPrimary: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string;
  status: 'AVAILABLE' | 'UNAVAILABLE' | 'SOLD_OUT';
  isChefRecommended: boolean;
  modifierGroups: ModifierGroup[];
  photos?: MenuItemPhoto[];
  category?: Category;
}

export interface Category {
  id: string;
  name: string;
  menuItems: MenuItem[];
}

export interface CartItem extends MenuItem {
  cartItemId: string; // ID tạm để phân biệt trong giỏ (vì 1 món có thể chọn nhiều option khác nhau)
  quantity: number;
  selectedModifiers: { [groupId: string]: ModifierOption[] }; // Lưu option đã chọn
  totalPrice: number; // Giá sau khi cộng modifier
}

export interface Table {
    id: string;
    name: string;
    capacity: number;
    isActive: boolean;
    qrCodeUrl?: string;
    restaurantId: string;
}
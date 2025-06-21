import { SpecificationValue } from "./specification-value.model";

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  imageBase64?: string | null;
  categoryId: number;
  categoryName?: string;
  specifications?: SpecificationValue[];
  averageRating?: number;
  reviewCount?: number;
}

export type { SpecificationValue };

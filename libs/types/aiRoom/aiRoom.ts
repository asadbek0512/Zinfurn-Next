import { ProductCategory, ProductColor, ProductMaterial, ProductType } from '../../enums/product.enum';
import { Product } from '../product/product';

export interface RoomAnalysisInput {
	imageBase64: string;
	mimeType?: string;
	userRequest?: string;
}

export interface RoomAnalysisResult {
	roomType?: ProductCategory;
	requestedType?: ProductType;
	dominantColors: ProductColor[];
	suggestedMaterial?: ProductMaterial;
	styleNotes: string;
	matchedProducts: Product[];
}

export interface GenerateRoomImageInput {
	roomImageBase64: string;
	mimeType?: string;
	productId: string;
}

export interface GeneratedRoomImage {
	imageBase64: string;
	mimeType: string;
}

import { PropertyCategory, PropertyColor, PropertyMaterial, PropertyType } from '../../enums/property.enum';
import { Property } from '../property/property';

export interface RoomAnalysisInput {
	imageBase64: string;
	mimeType?: string;
	userRequest?: string;
}

export interface RoomAnalysisResult {
	roomType?: PropertyCategory;
	requestedType?: PropertyType;
	dominantColors: PropertyColor[];
	suggestedMaterial?: PropertyMaterial;
	styleNotes: string;
	matchedProducts: Property[];
}

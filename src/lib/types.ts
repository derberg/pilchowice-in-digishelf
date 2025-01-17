export interface DocumentMetadata {
	newspaper: string;
	newspaperTitle: string;
	year?: string;
	recordId: string;
	filename: string;
	newspaperId: string;
	keywords: string[];
	pageNumber: string;
	content: string;
	translation: {
		summary: string;
		details: string;
	};
}

export interface ArchiveData {
	lastUpdated: string;
	documents: DocumentMetadata[];
}

export interface ResourceViewMode {
	mode: "gallery" | "list";
	showTranslations: boolean;
}

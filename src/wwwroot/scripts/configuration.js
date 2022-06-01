export const configuration = {
	storageKeys: {
		cart: "cart",
		productForm: {
			imageUrls: "productForm.images",
		},
	},
	debug: location.hostname !== "localhost",
	analytics: {
		pageload: false,
		error: true,
	},
	cookies: {
		culture: "vsh_culture",
	},
	paths: {
		products: "/assets/images/products/",
		documents: "/assets/images/documents/",
		swaggerDoc: {
			main: "/swagger/v1/swagger.json",
		},
	},
	defaultParameters: {
		counterControlOptions: {
			min: undefined,
			max: undefined,
			initialCount: undefined,
			onChange: undefined,
		},
	},
	enums: {
		orderStatus: {
			IN_PROGRESS: 0,
			CANCELLED: 0,
			FAILED: 2,
			COMPLETED: 3,
			AWAITING_INVOICE: 4,
			AWAITING_VIPPS: 5,
		},
	},
};

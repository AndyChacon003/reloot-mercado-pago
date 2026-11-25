const USD_TO_MXN = 18.5;

const CATEGORY_MAP = {
    smartphones: { category: 'telefonos', categoryLabel: 'Smartphone · API' },
    laptops: { category: 'pc', categoryLabel: 'Laptop / PC · API' },
    tablets: { category: 'telefonos', categoryLabel: 'Tablet · API' },
    'mobile-accessories': { category: 'pc', categoryLabel: 'Accesorio Tech · API' }
};

export async function fetchExtraProducts() {
    const endpoints = [
        'https://dummyjson.com/products/category/smartphones?limit=4',
        'https://dummyjson.com/products/category/laptops?limit=4',
        'https://dummyjson.com/products/category/tablets?limit=2'
    ];

    const responses = await Promise.all(
        endpoints.map((url) =>
            fetch(url)
                .then((res) => (res.ok ? res.json() : { products: [] }))
                .catch(() => ({ products: [] }))
        )
    );

    const rawProducts = responses.flatMap((data) => data.products || []);

    return rawProducts.map((item) => {
        const mapped = CATEGORY_MAP[item.category] || {
            category: 'pc',
            categoryLabel: 'Hardware · API'
        };

        const priceMxn = Math.round((item.price * USD_TO_MXN) / 10) * 10;
        const discountPct = Math.max(10, Math.round(item.discountPercentage || 15));
        const oldPriceMxn = Math.round((priceMxn / (1 - discountPct / 100)) / 10) * 10;
        const mainImage = item.thumbnail || item.images?.[0] || '';

        return {
            id: `api-${item.id}`,
            name: item.title,
            category: mapped.category,
            categoryLabel: mapped.categoryLabel,
            condition: item.rating >= 4.5 ? 'Grado A+ · Verificado' : 'Grado A · Seminuevo',
            gradeType: item.rating >= 4.5 ? 'a' : 'open',
            price: priceMxn,
            oldPrice: oldPriceMxn,
            discount: `-${discountPct}%`,
            stock: item.stock ?? 3,
            specs: item.description,
            image: mainImage,
            fallbackImage:
                item.images?.[0] ||
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
            telemetry: {
                temp: 'Diagnóstico OK',
                score: `Rating ${item.rating?.toFixed(1) || '4.8'}/5`,
                warranty: '90 Días RELOOT'
            },
            isFromApi: true
        };
    });
}
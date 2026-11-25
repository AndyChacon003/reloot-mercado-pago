const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY || "";

export async function fetchProductImage(product) {
  if (!PEXELS_API_KEY) {
    return {
      url: product.fallbackImage,
      source: "curated",
      credit: null
    };
  }

  try {
    const query = encodeURIComponent(product.searchQuery || product.name);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${query}&per_page=1&orientation=landscape`,
      {
        headers: {
          Authorization: PEXELS_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error("Error en respuesta de Pexels API");
    }

    const data = await response.json();
    const photo = data.photos && data.photos[0];

    if (photo && photo.src && (photo.src.large || photo.src.medium)) {
      return {
        url: photo.src.large || photo.src.medium,
        source: "pexels-api",
        credit: photo.photographer
      };
    }
  } catch {
    return {
      url: product.fallbackImage,
      source: "curated",
      credit: null
    };
  }

  return {
    url: product.fallbackImage,
    source: "curated",
    credit: null
  };
}

// Produce Image Verified Local Catalog
export function getProduceImage(cropName, category, imageUrl) {
  if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim().length > 0) {
    const trimmed = imageUrl.trim();
    if (!trimmed.includes('photo-1615485500704') && 
        !trimmed.includes('photo-1596547609652') && 
        !trimmed.includes('photo-1598170845058') && 
        !trimmed.includes('photo-1619566636858')) {
      return trimmed;
    }
  }

  const lower = (cropName || '').toLowerCase();
  if (lower.includes('leek')) return '/images/leeks.jpg';
  if (lower.includes('carrot')) return '/images/carrots.jpg';
  if (lower.includes('chilli') || lower.includes('chili')) return '/images/chillies.jpg';
  if (lower.includes('black pepper') || lower.includes('pepper')) return '/images/pepper.jpg';
  if (lower.includes('onion')) return '/images/onions.jpg';
  if (lower.includes('potato')) return '/images/potatoes.jpg';
  if (lower.includes('banana')) return '/images/bananas.jpg';
  if (lower.includes('papaya')) return '/images/papaya.jpg';
  if (lower.includes('mango')) return '/images/papaya.jpg';
  if (lower.includes('grain') || lower.includes('rice') || lower.includes('paddy') || lower.includes('samba') || lower.includes('corn') || lower.includes('maize') || lower.includes('wheat') || lower.includes('kurakkan')) return '/images/grains.jpg';

  const cat = (category || '').toLowerCase();
  if (cat === 'fruits') return '/images/bananas.jpg';
  if (cat === 'grains') return '/images/grains.jpg';
  if (cat === 'spices') return '/images/chillies.jpg';
  if (cat === 'tubers') return '/images/potatoes.jpg';
  return '/images/leeks.jpg';
}

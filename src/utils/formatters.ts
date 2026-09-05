export function formatCurrency(amount: number, symbol: string = '₪', lang: string = 'en'): string {
  const formattedNumber = new Intl.NumberFormat(lang === 'ar' ? 'ar-PS' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount || 0);

  return lang === 'ar' ? `${formattedNumber} ${symbol}` : `${symbol}${formattedNumber}`;
}

export function formatDate(dateString: string | undefined, lang: string = 'en'): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-PS' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString: string | undefined, lang: string = 'en'): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-PS' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

// Generates an inline SVG representation of a Code128 / barcode pattern
export function generateBarcodeSvg(barcode: string, height: number = 40): string {
  if (!barcode) return '';
  const hash = Array.from(barcode).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Deterministic bar widths based on code
  let bars = '';
  let x = 10;
  for (let i = 0; i < barcode.length; i++) {
    const charCode = barcode.charCodeAt(i);
    const w1 = ((charCode * 3 + i) % 3) + 1.5;
    const w2 = ((charCode * 7 + i) % 2) + 1.2;
    const w3 = ((charCode * 5 + i) % 4) + 1;
    
    bars += `<rect x="${x}" y="0" width="${w1}" height="${height}" fill="currentColor" />`;
    x += w1 + 1.5;
    bars += `<rect x="${x}" y="0" width="${w2}" height="${height}" fill="currentColor" />`;
    x += w2 + 2;
    bars += `<rect x="${x}" y="0" width="${w3}" height="${height}" fill="currentColor" />`;
    x += w3 + 1.5;
  }

  const totalWidth = x + 10;
  return `<svg viewBox="0 0 ${totalWidth} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">${bars}</svg>`;
}

// Gerador de Código de Barras (Code 128 e padrão EAN) e QR Code para Joias e Semijoias
import QRCode from 'qrcode';

// Tabela de padrões Code 128B para gerar SVG nítido em qualquer impressora
const CODE128_PATTERNS: { [key: number]: string } = {
  0: '212222', 1: '222122', 2: '222221', 3: '121223', 4: '121322',
  5: '131222', 6: '122213', 7: '122312', 8: '132212', 9: '221213',
  10: '221312', 11: '231212', 12: '112232', 13: '122132', 14: '122231',
  15: '113222', 16: '123122', 17: '123221', 18: '223211', 19: '221132',
  20: '221231', 21: '213212', 22: '223112', 23: '312131', 24: '311222',
  25: '321122', 26: '321221', 27: '312212', 28: '322112', 29: '322211',
  30: '212123', 31: '212321', 32: '232121', 33: '111323', 34: '131123',
  35: '131321', 36: '112313', 37: '132113', 38: '132311', 39: '211313',
  40: '231113', 41: '231311', 42: '112133', 43: '112331', 44: '132131',
  45: '113123', 46: '113321', 47: '133121', 48: '313121', 49: '211331',
  50: '231131', 51: '213113', 52: '213311', 53: '213131', 54: '311123',
  55: '311321', 56: '331121', 57: '312113', 58: '312311', 59: '332111',
  60: '314111', 61: '221411', 62: '431111', 63: '111224', 64: '111422',
  65: '121124', 66: '121421', 67: '141122', 68: '141221', 69: '112214',
  70: '112412', 71: '122114', 72: '122411', 73: '142112', 74: '142211',
  75: '241211', 76: '221114', 77: '413111', 78: '241112', 79: '134111',
  80: '111242', 81: '121142', 82: '121241', 83: '114212', 84: '124112',
  85: '124211', 86: '411212', 87: '421112', 88: '421211', 89: '212141',
  90: '214121', 91: '412121', 92: '111143', 93: '111341', 94: '131141',
  95: '114113', 96: '114311', 97: '411113', 98: '411311', 99: '113141',
  100: '114131', 101: '311141', 102: '411131',
  103: '211412', // START A
  104: '211214', // START B
  105: '211232', // START C
  106: '2331112' // STOP
};

/**
 * Gera barras em formato SVG para Code 128
 */
export function generateBarcode128Svg(text: string, height = 30): string {
  // Limpar texto
  const clean = text.toUpperCase().replace(/[^A-Z0-9\-_.]/g, '');
  if (!clean) return '';

  // Start B = 104
  let checksum = 104;
  const indices: number[] = [104];

  for (let i = 0; i < clean.length; i++) {
    const charCode = clean.charCodeAt(i);
    const val = charCode - 32;
    if (val >= 0 && val <= 102) {
      indices.push(val);
      checksum += val * (i + 1);
    }
  }

  const checkIndex = checksum % 103;
  indices.push(checkIndex);
  indices.push(106); // Stop

  let patternStr = '';
  for (const idx of indices) {
    patternStr += CODE128_PATTERNS[idx] || '212222';
  }

  // Converter dígitos em barras e espaços
  let rects = '';
  let x = 4;
  let isBar = true;

  for (let i = 0; i < patternStr.length; i++) {
    const width = parseInt(patternStr[i], 10);
    if (isBar) {
      rects += `<rect x="${x}" y="0" width="${width * 1.2}" height="${height}" fill="#111" />`;
    }
    x += width * 1.2;
    isBar = !isBar;
  }

  return `
    <svg viewBox="0 0 ${x + 4} ${height}" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
      ${rects}
    </svg>
  `;
}

/**
 * Gera Data URL em Base64 para QR Code de Alta Qualidade
 */
export async function generateQrCodeDataUrl(text: string, size = 160): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#1c1917', // stone-900
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
  } catch (err) {
    console.error('Erro ao gerar QR Code:', err);
    return '';
  }
}

/**
 * Emite som de bip de leitor de código de barras profissional
 */
export function playScannerBeep() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Dois bips curtos e cristalinos (típico de leitor Honeywell / Zebra de luxo)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, ctx.currentTime); // A6 (1760 Hz)
    osc.frequency.setValueAtTime(2349, ctx.currentTime + 0.04); // D7

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch (e) {
    // Silencioso se bloqueado por autoplay policy
  }
}

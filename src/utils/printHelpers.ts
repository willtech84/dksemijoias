/**
 * Utilitários para Impressão, Download e Exportação de Recibos e Relatórios
 */

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const clean = dateStr.split('T')[0].trim();
  const parts = clean.split(/[-/]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD -> DD-MM-AAAA (ex: 2026-09-10 -> 10-09-2026)
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return `${parts[0]}-${parts[1]}-${parts[2]}`;
  }
  return dateStr;
};

/**
 * Dispara a impressão nativa do navegador com classe de formato no body
 */
export const triggerPrintDocument = (format: 'a4' | 'thermal'): void => {
  // Adiciona classes temporárias para controle fino do @page e render
  document.body.classList.add('has-print-modal');
  if (format === 'thermal') {
    document.body.classList.add('print-format-thermal-active');
  } else {
    document.body.classList.add('print-format-a4-active');
  }

  // Executa impressão
  setTimeout(() => {
    window.print();
    // Limpa após impressão ou cancelamento
    setTimeout(() => {
      document.body.classList.remove('has-print-modal');
      document.body.classList.remove('print-format-thermal-active');
      document.body.classList.remove('print-format-a4-active');
    }, 500);
  }, 100);
};

/**
 * Salva um arquivo HTML standalone autônomo com estilos embutidos
 * que pode ser aberto e impresso em qualquer dispositivo (offline) ou salvo como PDF.
 */
export const saveStandaloneHtmlDocument = (
  filename: string,
  title: string,
  bodyHtml: string,
  format: 'a4' | 'thermal' = 'a4'
): void => {
  const isThermal = format === 'thermal';

  const fullHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background: #f5f5f4;
      font-family: ${isThermal ? "'Courier New', Courier, monospace" : "'Plus Jakarta Sans', system-ui, sans-serif"};
      color: #1c1917;
      padding: 20px;
      display: flex;
      justify-content: center;
    }

    .document-container {
      background: #ffffff;
      width: 100%;
      max-width: ${isThermal ? '80mm' : '210mm'};
      padding: ${isThermal ? '5mm' : '15mm'};
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      ${isThermal ? 'font-size: 11px; line-height: 1.3;' : 'font-size: 13px; line-height: 1.5;'}
    }

    .font-serif {
      font-family: 'Cinzel', Georgia, serif;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    th, td {
      padding: ${isThermal ? '4px 2px' : '6px 8px'};
      border-bottom: 1px solid #e7e5e4;
      ${isThermal ? 'font-size: 10px;' : 'font-size: 12px;'}
    }
    th {
      background: #f5f5f4;
      font-weight: 700;
      text-align: left;
    }

    .divider-dashed {
      border-top: 1px dashed #78716c;
      margin: 8px 0;
    }

    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #d97706;
      color: white;
      border: none;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      font-family: sans-serif;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .print-btn:hover {
      background: #b45309;
    }

    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
      .document-container {
        box-shadow: none !important;
        max-width: 100% !important;
        padding: 0 !important;
      }
      .print-btn {
        display: none !important;
      }
      @page {
        size: ${isThermal ? '80mm auto' : 'A4 portrait'};
        margin: ${isThermal ? '2mm' : '10mm'};
      }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
  <div class="document-container">
    ${bodyHtml}
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.html') ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

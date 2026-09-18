import { ModeloMensagemCobranca } from '../types';

export const INITIAL_MODELOS_COBRANCA: ModeloMensagemCobranca[] = [
  {
    id: 'tpl-preventivo-suave',
    titulo: 'Lembrete Preventivo Amigável (1 a 3 dias antes)',
    tipo: 'preventivo',
    texto: `Olá, {cliente}! Tudo bem? Esperamos que esteja tendo um ótimo dia! ✨

Passando com todo carinho apenas para lembrar que a sua parcela referente às semijoias da {empresa} no valor de {valor} vence em breve, no dia {vencimento} (daqui a {dias} dias).

Facilitamos o pagamento para você:
🔑 Chave Pix: {chavePix} ({tipoPix})

Se já realizou o pagamento, pode desconsiderar esta mensagem. Muito obrigado pela confiança e preferência! 💖`
  },
  {
    id: 'tpl-vence-hoje',
    titulo: 'Lembrete de Vencimento Hoje',
    tipo: 'dia_vencimento',
    texto: `Oi, {cliente}! Bom dia! 💎

Lembramos que hoje ({vencimento}) é o dia do vencimento da sua parcela na {empresa}:
💰 Valor: {valor}
📅 Vencimento: Hoje ({vencimento})

Para sua comodidade, você pode pagar diretamente via Pix:
🔑 Chave Pix: {chavePix} ({tipoPix})

Assim que efetuar, pode nos enviar o comprovante por aqui. Tenha um excelente dia! ✨`
  },
  {
    id: 'tpl-pix-rapido',
    titulo: 'Chave Pix Rápida & Prática',
    tipo: 'pix_rapido',
    texto: `Olá, {cliente}! Seguem os dados para pagamento da sua parcela de semijoias da {empresa}:

🏷️ Parcela: {parcela}
💰 Valor: {valor}
📅 Vencimento: {vencimento}
🔑 Chave Pix: {chavePix} ({tipoPix})

Dúvidas? Estamos à disposição pelo WhatsApp {telefone}! 🌸`
  },
  {
    id: 'tpl-atraso-gentil',
    titulo: 'Lembrete com Atraso Recente',
    tipo: 'pos_vencimento',
    texto: `Olá, {cliente}! Tudo bem? Passando com carinho para lembrar sobre a sua parcela de {valor} na {empresa}, com vencimento em {vencimento} (vencida há {dias} dias).

Gostaríamos de te ajudar a manter suas contas em dia!
🔑 Chave Pix: {chavePix} ({tipoPix})

Se precisar de qualquer flexibilidade ou já tiver pago, por favor nos avise. Gratidão! 💖`
  }
];

export const preencherMensagemCobranca = (
  templateTexto: string,
  dados: {
    cliente: string;
    valor: string;
    vencimento: string;
    dias: string | number;
    chavePix: string;
    tipoPix: string;
    empresa: string;
    telefone: string;
    parcela?: string;
  }
): string => {
  return templateTexto
    .replace(/{cliente}/g, dados.cliente)
    .replace(/{valor}/g, dados.valor)
    .replace(/{vencimento}/g, dados.vencimento)
    .replace(/{dias}/g, String(dados.dias))
    .replace(/{chavePix}/g, dados.chavePix)
    .replace(/{tipoPix}/g, dados.tipoPix)
    .replace(/{empresa}/g, dados.empresa)
    .replace(/{telefone}/g, dados.telefone)
    .replace(/{parcela}/g, dados.parcela || '1');
};

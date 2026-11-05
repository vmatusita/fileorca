import type { CalcPageTexts } from '../../../../calc/types.ts';
import { homePanel } from '../../../i18n/es.ts';

export default {
  title: 'Calculadora de hipoteca a 15 o 30 años: pago e intereses de cada plazo',
  description: 'Pon una hipoteca a 15 años al lado de una a 30 años: el pago mensual, el total de intereses y cómo baja el saldo cada año, con las tasas que elijas.',
  h1: 'Calculadora de hipoteca a 15 o 30 años',
  lead: 'Lo que cuesta y ahorra el plazo corto.',
  panel: {
    fields: {
      p: homePanel.fields['p']!,
      d: homePanel.fields['d']!,
      dp: homePanel.fields['dp']!,
      // F13b (Idiomas R2-03; DECISOES § C-7): the years in the accessible description, not in the label (§ 124).
      r15: { label: 'Tasa a 15', desc: 'Tasa a 15 años', suffix: '%', error: 'Escribe una tasa de 0 a 40 %.' },
      r30: { label: 'Tasa a 30', desc: 'Tasa a 30 años', suffix: '%', error: 'Escribe una tasa de 0 a 40 %.' },
    },
    view: {
      label: 'Pago a 15 años',
      unit: '/mes',
      placard: 'pago a 15 años',
      more: '{x} más',
      less: '{x} menos',
      saves: 'ahorra {x} de intereses',
      adds: 'suma {x} de intereses',
      diff: 'B cuesta {paymentDiff} al mes y {interestEffect}.',
      principal: 'Capital',
      interestPart: 'Intereses en 15 años',
      thirty: 'Tasa fija a 30 años',
      fifteen: 'Tasa fija a 15 años',
      payment: 'Pago mensual',
      interest: 'Total de intereses',
      paidOff: 'Se termina de pagar en',
      year: 'Año',
      balance15: 'Saldo a 15 años',
      balance30: 'Saldo a 30 años',
      caption: 'Lo que aún se debe al final de cada año, con los préstamos a 15 y a 30 años',
      payment30: 'Pago a 30 años',
      interest15: 'Total de intereses a 15 años',
      interest30: 'Total de intereses a 30 años',
      loan: 'Monto del préstamo',
      compareLabel: 'Los préstamos a 30 y a 15 años, uno al lado del otro',
      scheduleHeading: 'Saldo por año en los dos plazos',
    },
    premises: [
      'Los dos préstamos son de tasa fija, con pagos mensuales iguales, por el mismo monto: el precio menos el pago inicial.',
      'Los intereses se cobran una vez al mes sobre el saldo, a la tasa anual dividida entre 12, y se redondean al centavo; el último pago cierra el saldo.',
      'Los impuestos, el seguro, el PMI y los cargos quedan fuera, porque son iguales en los dos plazos.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de hipoteca a 15 o 30 años',
  howSteps: [
    'Escribe el precio de la vivienda y el pago inicial.',
    'Escribe la tasa que te ofrecieron para cada plazo; los plazos cortos suelen tener una tasa más baja.',
    'Compara el pago y los intereses de los dos préstamos, y abre el saldo por año.',
  ],
  own: [
    {
      heading: 'Lo que cambia con el plazo corto',
      paragraphs: [
        'Devolver el mismo monto en la mitad del tiempo significa un pago más alto cada mes, pero el saldo baja mucho más rápido, así que se acumulan muchos menos intereses. Una tasa más baja en el préstamo a 15 años agranda la diferencia de intereses.',
      ],
    },
    {
      heading: 'Preguntas que puedes hacerte',
      paragraphs: [
        '¿Podrías seguir con el pago más alto si tus ingresos bajaran por un tiempo? ¿Prefieres quedarte con el pago a 30 años y pagar de más cuando puedas? La calculadora de pagos adicionales muestra ese camino intermedio con el mismo préstamo.',
      ],
    },
  ],
  worksHeading: 'Cómo se calculan los dos préstamos',
  formulaHeading: 'La fórmula',
  formula: [
    'Cada pago es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde P es el préstamo, r es la tasa anual de ese plazo dividida entre 12, y n es 180 o 360.',
    'Cada mes, intereses = saldo × r, redondeados al centavo. La diferencia de intereses es el total a 30 años menos el total a 15 años.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con cómo pedir y comparar por lo menos tres Estimaciones de Préstamo (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    { label: 'Corporación Federal de Seguro de Depósitos (FDIC), "Hipotecas", con los plazos de 15, 20 o 30 años de los préstamos de tasa fija (en español)', href: 'https://www.fdic.gov/espanol/hipotecas' },
    { label: 'CFPB, guía para leer la Estimación de Préstamo (en inglés)', href: 'https://www.consumerfinance.gov/owning-a-home/loan-estimate/' },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera ni una oferta de préstamo. Los prestamistas ofrecen una tasa para cada plazo.',
  faqHeading: 'Preguntas sobre las hipotecas a 15 y a 30 años',
  faq: [
    {
      q: '¿Por qué el pago a 15 años no es el doble del pago a 30 años?',
      a: 'Porque al principio el pago a 30 años es casi todo intereses. Reducir el tiempo a la mitad elimina gran parte de esos intereses, así que el pago sube menos del doble.',
    },
    {
      q: '¿Puedo usar la misma tasa para los dos?',
      a: 'Sí. Con la misma tasa ves solo el efecto del plazo; con las tasas que te ofrecieron ves las ofertas reales.',
    },
    {
      q: '¿Y el pago inicial y el PMI?',
      a: 'El monto del préstamo es el mismo en los dos plazos, así que el PMI, los impuestos y el seguro no cambian la comparación. La calculadora de hipoteca los suma al pago.',
    },
    {
      q: '¿La tabla muestra los dos préstamos?',
      a: 'Sí: lo que aún se debe de cada préstamo al final de cada año, para que veas qué tan rápido baja cada uno.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;

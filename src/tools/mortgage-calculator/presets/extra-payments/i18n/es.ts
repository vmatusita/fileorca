import type { CalcPageTexts } from '../../../../calc/types.ts';
import { homePanel, homePremises } from '../../../i18n/es.ts';

export default {
  title: 'Calculadora de pagos adicionales a la hipoteca: intereses y meses que ahorras',
  description: 'Mira cuántos meses e intereses te ahorran los pagos adicionales a la hipoteca: cada mes, una vez al año o un solo pago, junto al préstamo sin ellos.',
  h1: 'Calculadora de pagos adicionales a la hipoteca',
  lead: 'Lo que ahorras si pagas un poco más.',
  panel: {
    ...homePanel,
    fields: {
      ...homePanel.fields,
      em: { label: 'Adicional al mes', prefix: '$', error: 'Escribe un pago adicional de $0 a $1,000,000.' },
      ey: { label: 'Adicional al año', prefix: '$', error: 'Escribe un pago adicional de $0 a $10,000,000.', help: 'Se paga junto con el último pago de cada año del préstamo.' },
      eo: { label: 'Pago adicional único', prefix: '$', error: 'Escribe un pago adicional de $0 a $100,000,000.' },
      eom: { label: 'Con el pago número', error: 'Escribe un número de pago de 1 a 480.', over: 'No puede ser después del último pago del plazo.' },
    },
    moreHeading: 'Plazo del préstamo, más pagos adicionales y costos',
    view: {
      label: 'Intereses ahorrados',
      placard: 'intereses ahorrados',
      sentence: 'Con los pagos adicionales, el préstamo se termina de pagar en {time} en lugar de {base}, {saved} antes, y ahorras {interest} de intereses.',
      same: 'Sin un pago adicional, el préstamo dura sus {base}. Agrega un pago adicional para ver cuánto ahorra.',
      sameTime: 'Los pagos adicionales son demasiado pequeños para terminar el préstamo un mes antes: sigue durando {base}, y ahorras {interest} de intereses.',
      principal: 'Capital',
      interestPart: 'Intereses con pagos adicionales',
      without: 'Sin pagos adicionales',
      with: 'Con pagos adicionales',
      interest: 'Intereses',
      paidOff: 'Se termina de pagar en',
      paid: 'Total pagado',
      diff: 'B termina de pagar el préstamo {saved} antes y ahorra {interest} de intereses.',
      caption: 'Tabla de amortización con los pagos adicionales, por año del préstamo',
      pi: 'Capital e intereses',
      monthly: 'Pago mensual con impuestos, seguros y cuotas',
      monthsSaved: 'Meses ahorrados',
      months: '{n} meses',
      paidOffWith: 'Pagos con el adicional',
      paidOffWithout: 'Pagos sin el adicional',
      payments: '{n} pagos',
      compareLabel: 'El préstamo sin y con pagos adicionales',
      scheduleHeading: 'Tabla con pagos adicionales',
    },
    premises: [
      ...homePremises,
      'Cada pago adicional va directo al saldo; el pago regular no cambia, así que el préstamo termina antes. El adicional al año se paga junto con el último pago de cada año del préstamo.',
    ],
  },
  howHeading: 'Cómo usar la calculadora de pagos adicionales',
  howSteps: [
    'Escribe el precio de la vivienda, el pago inicial, la tasa y el plazo de la hipoteca.',
    'Escribe cuánto más podrías pagar cada mes.',
    'Si tienes pensado uno, agrega un adicional al año o un solo pago, con el número del pago en que lo harías.',
    'Compara el préstamo sin y con los pagos adicionales, y guarda la nueva tabla.',
  ],
  own: [
    {
      heading: 'Por qué un pago adicional ahorra intereses',
      paragraphs: [
        'Los intereses se cobran sobre el saldo. Un pago adicional baja el saldo de inmediato, así que cada mes siguiente cobra un poco menos de intereses, y una parte mayor del mismo pago regular va al capital. El efecto se acumula: los pagos adicionales del principio ahorran más que los del final, porque recortan más meses de intereses.',
        'El pago regular no cambia. Lo que cambia es el número del último pago: el préstamo simplemente termina antes.',
      ],
    },
    {
      heading: 'Antes de pagar de más',
      paragraphs: [
        'Pídele a tu administrador del préstamo que aplique el adicional al capital, y revisa que el préstamo no tenga multa por pago anticipado. Hay quien primero arma un fondo de emergencia o paga las deudas con tasas más altas; la calculadora de deudas las compara.',
      ],
    },
  ],
  worksHeading: 'Cómo se calcula el ahorro',
  formulaHeading: 'La fórmula',
  formula: [
    'El pago regular es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1). Cada mes: intereses = saldo × r, redondeados al centavo; pago = M + los adicionales de ese mes; y el nuevo saldo es el anterior menos (pago − intereses), hasta que un último pago lo cierra.',
    'Meses ahorrados = pagos sin adicionales − pagos con adicionales. Intereses ahorrados = intereses sin adicionales − intereses con adicionales.',
  ],
  premisesHeading: 'Supuestos',
  exampleHeading: 'Ejemplo resuelto',
  exampleIntro: 'Este es el ejemplo con el que empieza la calculadora, calculado por el mismo motor que usas arriba.',
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con el pago anticipado, los pagos adicionales y la multa por pago anticipado (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'CFPB, Regulation Z, formulario H-28(G), muestra de la Declaración de Cierre de una compra, con la línea de la multa por pago anticipado (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/201403_cfpb_loanestimate_spanish_H28G.pdf',
    },
    { label: 'CFPB, términos clave de las hipotecas, con la multa por pago anticipado (en inglés)', href: 'https://www.consumerfinance.gov/consumer-tools/mortgages/answers/key-terms/' },
  ],
  disclaimer: 'Esta calculadora es una herramienta educativa, no asesoría financiera. Tu contrato de préstamo dice cómo se aplican los pagos adicionales.',
  faqHeading: 'Preguntas sobre los pagos adicionales a la hipoteca',
  faq: [
    {
      q: '¿Conviene más pagar de más cada mes o una vez al año?',
      a: 'El mismo total pagado antes ahorra un poco más, porque baja el saldo antes. Prueba los dos en la calculadora con el mismo monto al año.',
    },
    {
      q: '¿Un pago adicional baja mi pago mensual?',
      a: 'No. En un préstamo normal de tasa fija el pago sigue igual y el préstamo termina antes. Recalcular el pago después de un pago grande, algo que algunos prestamistas ofrecen a cambio de un cargo, es otra cosa.',
    },
    {
      q: '¿Me puede cobrar el prestamista por pagar antes?',
      a: 'Algunos préstamos tienen una multa por pago anticipado. La Estimación de Préstamo y la Declaración de Cierre dicen si el tuyo la tiene.',
    },
    {
      q: '¿El pago único tiene que ser en el primer año?',
      a: 'No. Elige el número del pago con el que lo harás; un pago único hecho más tarde en el préstamo ahorra menos intereses que el mismo monto al principio.',
    },
  ],
  privacyHeading: 'Privacidad',
  privacyNote:
    'Tus números se quedan en tu dispositivo. La calculadora funciona en tu navegador, así que nada de lo que escribes se envía a ninguna parte, y el enlace que copias guarda los números después del #, una parte de la dirección que tu navegador nunca envía.',
  relatedHeading: 'Calculadoras relacionadas',
} satisfies CalcPageTexts;

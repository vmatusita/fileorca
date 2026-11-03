import type { GuideTexts } from '../types.ts';

export default {
  title: 'Cómo los pagos adicionales acortan una hipoteca, con los números',
  description: 'Cuánto antes termina una hipoteca y cuántos intereses ahorras con pagos adicionales cada mes, cada año o una sola vez, medido en un préstamo con una calculadora.',
  h1: 'Cómo los pagos adicionales acortan una hipoteca',
  lead: 'Lo que pagas de más cada mes sale del saldo, y los intereses se cobran sobre el saldo.',
  intro: [
    'Pagar más que el pago obligatorio de la hipoteca no baja el pago; hace que el préstamo termine antes. Cada dólar adicional va directo al capital, así que cada mes siguiente cobra intereses sobre un saldo menor. Ese ahorro se repite durante el resto del préstamo, y por eso un monto adicional modesto puede quitarle años a una hipoteca a 30 años.',
    'Esta guía mide el efecto en un solo préstamo con el motor de la calculadora de abajo: {loan} a una tasa de ejemplo del {rate} a 30 años, con un pago regular de {payment} de capital e intereses. Sin pagos adicionales dura {baseTime} y cobra {baseInterest} de intereses.',
  ],
  calcHeading: 'Prueba un pago adicional',
  calcIntro: 'La calculadora empieza con el ejemplo de esta guía, con {extra} adicionales cada mes. Cada número del texto de abajo sale del mismo motor.',
  sections: [
    {
      heading: 'Un adicional fijo cada mes',
      paragraphs: [
        'Sumar {extra} a cada pago termina de pagar el préstamo en {withTime} en lugar de {baseTime}: {saved} antes. Los intereses ahorrados son {interestSaved}.',
        'El pago obligatorio nunca cambia. El adicional baja el saldo un poco más cada mes, así que la parte del pago regular que va a intereses se achica más rápido, y el último pago llega años antes.',
      ],
    },
    {
      heading: 'Una vez al año en lugar de cada mes',
      paragraphs: [
        'Hay quien prefiere hacer un solo pago adicional más grande al año, con un reembolso de impuestos o un bono. Pagar {yearlyExtra} una vez al año, el mismo monto que {extra} al mes, termina el préstamo {yearlySaved} antes y ahorra {yearlyInterest} de intereses.',
        'Es un poco menos de lo que ahorra el adicional mensual, porque parte del dinero espera hasta el final de cada año antes de empezar a bajar el saldo. La diferencia es pequeña; lo que más importa es el total que sumas y qué tan pronto lo sumas.',
      ],
    },
    {
      heading: 'El dinero temprano rinde más',
      paragraphs: [
        'Un solo pago adicional de {lump} con el pago 12, al final del primer año, ahorra {earlyInterest} de intereses y termina el préstamo {earlySaved} antes. Los mismos {lump} con el pago 240, a los veinte años, ahorran {lateInterest} y lo terminan {lateSaved} antes.',
        'Al principio del préstamo el saldo es grande y la mayor parte de cada pago son intereses, así que un dólar de capital que se quita entonces deja de generar intereses durante más tiempo.',
      ],
    },
    {
      heading: 'Los pagos adicionales y el PMI',
      paragraphs: [
        'Si diste menos del 20 % de pago inicial en un préstamo convencional, probablemente pagas seguro hipotecario privado (PMI). La FDIC explica que puedes pedir por escrito que se cancele cuando el saldo baja al 80 % del valor original de la propiedad, y que termina automáticamente cuando llega al 78 %. Según el CFPB, los pagos adicionales que bajan el saldo al 80 % te permiten pedir la cancelación antes de la fecha prevista; el fin automático al 78 % sigue el calendario original del préstamo, no tus pagos adicionales.',
        'Guarda la tabla que te da la calculadora. Muestra el saldo al final de cada año, así que puedes ver cuándo baja del 80 % del valor original y hacer la solicitud por escrito.',
      ],
    },
    {
      heading: 'Antes de pagar de más',
      paragraphs: [
        'Pídele a tu administrador del préstamo que aplique el adicional al capital, no al próximo pago. Revisa si el préstamo tiene multa por pago anticipado: la Estimación de Préstamo y la Declaración de Cierre lo dicen. Muchas personas primero arman un fondo de emergencia y pagan las deudas con una tasa más alta que la de la hipoteca, porque un dólar ahí ahorra más intereses.',
        'Si prefieres conservar la flexibilidad del pago más bajo, los pagos adicionales en un préstamo a 30 años son un camino intermedio entre los plazos de 30 y de 15 años: puedes dejar de pagar de más en un mes difícil.',
      ],
    },
  ],
  tableHeading: 'Lo que hace cada monto adicional',
  tableIntro: 'El mismo préstamo de {loan} al {rate} a 30 años, con un adicional fijo distinto sumado a cada pago mensual.',
  tableCaption: 'Tiempo para terminar de pagar, tiempo ahorrado e intereses ahorrados según el adicional al mes',
  tableNote: 'Calculado con el motor de este sitio el {date}, mes a mes y en centavos. La tasa es un ejemplo.',
  formulaHeading: 'La fórmula',
  formula: [
    'El pago regular es M = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), donde r es la tasa anual dividida entre 12 y n = 360. Cada mes: intereses = saldo × r, redondeados al centavo; pago = M + el adicional de ese mes; el saldo baja en pago − intereses.',
    'Meses ahorrados = pagos sin el adicional − pagos con el adicional. Intereses ahorrados = intereses sin el adicional − intereses con el adicional.',
  ],
  premisesHeading: 'Supuestos',
  premises: [
    'Un préstamo de tasa fija sin multa por pago anticipado; cada pago adicional va al capital el mes en que se paga.',
    'El adicional al año se paga junto con el último pago de cada año del préstamo.',
    'Los impuestos, el seguro y el PMI quedan fuera: los pagos adicionales no los cambian.',
  ],
  exampleHeading: 'Ejemplo resuelto',
  example: [
    'Préstamo de {loan} al {rate}, pago de {payment}. Con {extra} adicionales al mes, se termina de pagar en {withTime} en lugar de {baseTime}, con {interestSaved} de intereses ahorrados.',
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con los pagos adicionales, el pago anticipado y la multa por pago anticipado (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'Corporación Federal de Seguro de Depósitos (FDIC), "Hipotecas", con la cancelación del PMI al 80 % y su fin automático al 78 % (en español)',
      href: 'https://www.fdic.gov/espanol/hipotecas',
    },
    {
      label: 'CFPB, Regulation Z, formulario H-28(G), muestra de la Declaración de Cierre de una compra, con la línea de la multa por pago anticipado (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/201403_cfpb_loanestimate_spanish_H28G.pdf',
    },
    {
      label: 'CFPB, cuándo puedes quitar el seguro hipotecario privado (PMI) de tu préstamo, también antes de la fecha prevista (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/when-can-i-remove-private-mortgage-insurance-pmi-from-my-loan-en-202/',
    },
  ],
  disclaimerHeading: 'Guía educativa',
  disclaimer: 'Esta guía es educativa, no asesoría financiera. Tu contrato de préstamo dice cómo se aplican los pagos adicionales.',
  relatedHeading: 'Calculadoras para el siguiente paso',
  words: { head: ['Adicional al mes', 'Se termina de pagar en', 'Tiempo ahorrado', 'Intereses ahorrados'] },
} satisfies GuideTexts<'guides-extra-mortgage-payments'>;

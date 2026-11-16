import type { GuideTexts } from '../types.ts';

// F19b (front T6): the Spanish text of guide 6, for the Hispanic audience of the US. The same keys and {placeholders} as
// the English text; every rate is a {placeholder} the engine works out at build (src/tools/calc/guides.ts, aprVsApy) and
// writes in the Spanish format (5.13 %, with the no-break space); the words of the table are the front O's.
export default {
  title: 'APR o APY: en qué se diferencian y qué suma la capitalización',
  description: 'Lo que cada capitalización le suma a una misma APR, calculado con una tasa, y por qué la APR de un depósito no es la APR de un préstamo.',
  words: {
    head: ['Capitalización', 'Veces al año', 'APY de una APR del {rate}', 'Por encima de la APR'],
    compounding: ['Anual', 'Semestral', 'Trimestral', 'Mensual', 'Diaria'],
  },
  h1: 'APR o APY: en qué se diferencian',
  lead: 'La APR es la tasa antes de capitalizar; el APY, lo que rinde en un año. Esta es la diferencia con cada capitalización.',
  intro: [
    'Una cuenta de depósito trae dos tasas que suenan parecidas. La tasa de interés, que la calculadora de abajo llama tasa porcentual anual (APR), es la tasa anual antes de capitalizar. El rendimiento porcentual anual (APY) es lo que el dinero gana en un año cuando los intereses sumados al saldo generan sus propios intereses. Ambas son porcentajes anuales, y por eso es fácil confundirlas.',
    'Esta guía calcula una sola tasa con el motor de la calculadora de abajo: una APR del {rate} con capitalización diaria, que rinde un APY del {apy}. Después pasa la misma APR por cada capitalización que ofrece la calculadora, y prueba una tasa más baja y una más alta, para mostrar de dónde sale la diferencia y cuándo es demasiado pequeña para verse.',
  ],
  calcHeading: 'Convierte una APR en un APY',
  calcIntro: 'La calculadora empieza con el ejemplo de esta guía. Cambia la tasa o la capitalización para ver cómo se mueve el APY, o elige "APY a APR" para ir al revés.',
  sections: [
    {
      heading: 'Lo que cuenta cada tasa',
      paragraphs: [
        'El Reglamento DD (Regulation DD), la norma federal de las cuentas de depósito, define la tasa de interés de una cuenta como una tasa anual que no refleja la capitalización. Son los intereses que daría un año si se sumaran al saldo solo al final de ese año. Cuando los intereses se capitalizan más veces al año, cada suma entra al saldo, y los intereses siguientes se calculan sobre el monto mayor.',
        'El APY cuenta ese crecimiento. El Reglamento DD lo define como una tasa que refleja el total de intereses que paga una cuenta en un año, según la tasa de interés y la frecuencia de la capitalización. Los intereses sobre intereses solo pueden sumar al saldo, así que el APY de una cuenta nunca queda por debajo de su tasa de interés; con capitalización anual, ambos son el mismo número.',
      ],
    },
    {
      heading: 'La misma APR, capitalizada más veces',
      paragraphs: [
        'Con capitalización anual, una APR del {rate} rinde un {yearlyApy}: todos los intereses llegan al final del año, y ninguno tiene tiempo de generar más. Con la semestral rinde un {twiceApy}; con la trimestral, un {quarterlyApy}; con la mensual, un {monthlyApy}; y con la diaria, un {apy}. Cada fila de la tabla le suma algo a la de arriba, y el APY diario termina {gap} por encima de la APR.',
        'El tamaño de cada paso no depende de cuántas veces más se suman los intereses. Pasar de la capitalización mensual a la diaria es el mayor salto en las veces al año, y aun así suma solo {dailyStep}, el paso más pequeño de la tabla. La capitalización mensual ya deja el APY {monthlyGap} por encima de la APR. Cada suma diaria es una parte diminuta de los intereses de un año, y lo que esa parte genera a su vez es todavía menor.',
      ],
    },
    {
      heading: 'Una tasa más baja, una tasa más alta',
      paragraphs: [
        'La diferencia depende de la tasa, además de la capitalización. Con una APR del {lowRate} y capitalización diaria, el APY es del {lowApy}, apenas {lowGap} por encima de la APR. Las capitalizaciones anual, semestral, trimestral y mensual muestran todas un {lowMonthlyApy}: los intereses adicionales están ahí, pero son demasiado pequeños para mover el APY una vez que el Reglamento DD lo redondea a la centésima de punto porcentual más cercana, así que solo se ven con la capitalización diaria.',
        'Con una APR del {highRate} y capitalización diaria, el APY es del {highApy}, {highGap} por encima de la APR, y la capitalización mensual da un {highMonthlyApy}. Una tasa más alta suma más intereses al saldo cada vez que se capitaliza, así que la misma capitalización abre una diferencia mayor. Ambas tasas son ejemplos elegidos para mostrar el efecto, no la tasa de ninguna cuenta.',
      ],
    },
    {
      heading: 'De un APY de vuelta a una APR',
      paragraphs: [
        'La calculadora también funciona al revés. Si una cuenta indica un APY del {rate} con capitalización diaria, la tasa de interés detrás de ese APY es del {backApr}, {backGap} por debajo. Con capitalización anual coincidirían, y cuantas más veces al año se capitaliza una cuenta, más baja es la tasa de interés que llega al mismo APY.',
        'Esa dirección sirve cuando las cuentas dan sus tasas de formas distintas. Convertidas en APY, cada una con su propia capitalización, las tasas quedan en igualdad de condiciones y se pueden poner lado a lado. Según el Reglamento DD, la divulgación de una cuenta de depósito da el APY y la tasa de interés, con esos términos, junto con la frecuencia con que los intereses se capitalizan y se acreditan.',
      ],
    },
    {
      heading: 'La APR de un préstamo es otro número',
      paragraphs: [
        'En un préstamo, APR quiere decir otra cosa. El CFPB explica que la APR de un préstamo es su tasa de interés más los cargos adicionales que cobra el prestamista, y que la Ley de Veracidad en los Préstamos (TILA, por sus siglas en inglés), una ley federal que el Reglamento Z (Regulation Z) pone en práctica, obliga a los prestamistas a divulgarla. En una hipoteca, la APR es el costo total del crédito expresado como una tasa: toma en cuenta los costos del préstamo durante todo el plazo, y por eso por lo general es más alta que la tasa de interés. El CFPB aconseja comparar una APR con otra APR, no con una tasa de interés.',
        'La calculadora de esta guía convierte la tasa de un depósito en su rendimiento y nada más. Si escribes en ella la APR de un préstamo, te da el APY que ganaría un depósito a esa tasa, no lo que cuesta el préstamo.',
      ],
    },
  ],
  tableHeading: 'La misma APR con cada capitalización',
  tableIntro: 'La APR del {rate} del ejemplo con cada capitalización que ofrece la calculadora: cuántas veces al año se capitaliza la tasa, el APY que rinde y cuánto queda ese APY por encima de la APR.',
  tableCaption: 'APY de la APR del ejemplo y su diferencia con la APR, según la capitalización',
  tableNote: 'Calculado con el motor de este sitio el {date}, con el redondeo que el Reglamento DD pide para el APY. La tasa es un ejemplo.',
  formulaHeading: 'La fórmula',
  formula: [
    'APY = (1 + APR ÷ n)^n − 1, con la APR en forma decimal y n el número de veces al año que se capitaliza la tasa, la segunda columna de la tabla. De vuelta, APR = n × ((1 + APY)^(1 ÷ n) − 1).',
    'El Apéndice A del Reglamento DD calcula el APY a partir de los intereses que paga una cuenta en un plazo y del capital, con un exponente que lleva cualquier plazo a un año. En un año completo el exponente desaparece, y el APY es igual a los intereses de ese año divididos entre el capital: para el dinero que se queda quieto todo el año, el mismo número que da la fórmula de arriba. Ambos resultados se redondean a la centésima de punto porcentual más cercana.',
  ],
  premisesHeading: 'Supuestos',
  premises: [
    'La APR es la tasa anual nominal de un depósito, y no cambia durante el año.',
    'El dinero se queda en la cuenta un año entero, sin depósitos ni retiros, y los intereses también se quedan ahí.',
    'La capitalización diaria es una capitalización por cada día de un año no bisiesto, como en la calculadora.',
    'Quedan fuera los cargos, los impuestos y cualquier saldo mínimo que pida una cuenta.',
  ],
  exampleHeading: 'Ejemplo resuelto',
  example: [
    'Toma una APR del {rate} con capitalización diaria. Puesta en la fórmula, con n igual a los días del año, da un APY del {apy} una vez redondeado: {gap} por encima de la APR. La capitalización mensual daría un {monthlyApy}, y la anual, un {yearlyApy}.',
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), Reglamento DD (Regulation DD), § 1030.2, definiciones, con la tasa de interés y el rendimiento porcentual anual (en inglés)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/2/',
    },
    {
      label: 'CFPB, Reglamento DD, Apéndice A, cálculo del rendimiento porcentual anual (en inglés)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/a/',
    },
    { label: 'CFPB, Reglamento DD, § 1030.3, requisitos generales de divulgación, con el redondeo (en inglés)', href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/3/' },
    {
      label: 'CFPB, Reglamento DD, § 1030.4, divulgaciones de la cuenta, con el APY, la tasa de interés y la frecuencia de la capitalización (en inglés)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1030/4/',
    },
    {
      label: 'CFPB, qué diferencia hay entre la tasa de interés de un préstamo y la APR (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/what-is-the-difference-between-a-loan-interest-rate-and-the-apr-en-733/',
    },
    {
      label: 'CFPB, "Su conjunto de herramientas para préstamos hipotecarios: Guía paso a paso", con la APR como el costo total del crédito expresado como una tasa (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_your-home-loan-toolkit_es.pdf',
    },
    {
      label: 'CFPB, Reglamento Z (Regulation Z), § 1026.1, autoridad, propósito y alcance, con la Ley de Veracidad en los Préstamos (en inglés)',
      href: 'https://www.consumerfinance.gov/rules-policy/regulations/1026/1/',
    },
  ],
  disclaimerHeading: 'Guía educativa',
  disclaimer: 'Esta guía es educativa, no asesoría financiera. Sus tasas son ejemplos; las que se aplican a tu cuenta están en la divulgación de esa cuenta.',
  relatedHeading: 'Calculadoras para el siguiente paso',
} satisfies GuideTexts<'guides-apr-vs-apy'>;

import type { GuideTexts } from '../types.ts';

export default {
  title: 'Bola de nieve o avalancha: dos métodos para pagar deudas, con números',
  description: 'La bola de nieve y la avalancha con las mismas cuatro deudas y el mismo presupuesto: meses hasta quedar sin deudas, intereses y orden de pago, con una calculadora.',
  h1: 'Bola de nieve o avalancha, con números',
  lead: 'Dos formas de pagar varias deudas con el mismo dinero cada mes, comparadas con un mismo grupo de deudas.',
  intro: [
    'Cuando debes en varias tarjetas y préstamos, aparecen una y otra vez dos planes. La bola de nieve paga primero el saldo más pequeño; la avalancha paga primero la tasa de interés más alta. Los dos pagan el mínimo de todo lo demás, y los dos pasan el pago de una deuda terminada a la siguiente. La única diferencia es el orden.',
    'Esta guía aplica los dos planes a cuatro deudas con el mismo presupuesto mensual, con el motor de la calculadora de abajo: una tarjeta de crédito grande de {b1} al {r1} con un mínimo de {m1}, una tarjeta pequeña de {b2} al {r2} con un mínimo de {m2}, un préstamo para auto de {b3} al {r3} con un mínimo de {m3}, y un préstamo personal de {b4} al {r4} con un mínimo de {m4}. Además de los {minimums} de pagos mínimos, se suman {extra} al mes, para un presupuesto de {budget}.',
  ],
  calcHeading: 'Aplica los dos planes a tus deudas',
  calcIntro: 'La calculadora empieza con las cuatro deudas de esta guía. Cámbialas por las tuyas; cada número del texto de abajo sale del mismo motor.',
  sections: [
    {
      heading: 'Cómo avanza la bola de nieve',
      paragraphs: [
        'La bola de nieve pone el adicional en el saldo más pequeño, la tarjeta pequeña, y la termina de pagar en el mes {snowFirst}. Después, su pago se une al adicional y pasa al siguiente saldo más pequeño. El orden en que se terminan las deudas es: {snowOrder}. Todas quedan pagadas en {snowMonths}, con {snowInterest} de intereses en total.',
        'Su atractivo es el avance rápido. Una deuda desaparece en pocos meses, y cada una que se va libera un pago para la siguiente. El CFPB describe este método como pagar primero la deuda más pequeña y, cuando está pagada, sumar ese monto al pago mínimo de la siguiente deuda más pequeña.',
      ],
    },
    {
      heading: 'Cómo avanza la avalancha',
      paragraphs: [
        'La avalancha pone el adicional primero en la tasa más alta: la tarjeta grande al {r1}. Esa tarjeta tiene un saldo mayor, así que la primera deuda solo desaparece en el mes {avalFirst}. El orden en que se terminan las deudas es: {avalOrder}. Todas quedan pagadas en {avalMonths}, con {avalInterest} de intereses.',
        'Con estas deudas, la avalancha paga {interestDiff} menos de intereses y termina {monthsDiff} antes. El dinero que se habría ido en intereses de la deuda más cara va al capital.',
      ],
    },
    {
      heading: 'Por qué aquí la diferencia es pequeña, y cuándo crece',
      paragraphs: [
        'Los dos planes comparten el mismo presupuesto y los mismos mínimos, así que solo pueden diferir en adónde va el adicional. La diferencia es mayor cuando las tasas están muy separadas y la deuda de tasa alta es grande. Se achica cuando el adicional es pequeño, porque los dos planes pasan la mayor parte del tiempo pagando mínimos, y cuando el adicional es muy grande, porque los dos planes lo pagan todo rápido.',
        'La tabla de abajo lo muestra con las mismas cuatro deudas. Sin ningún adicional, los dos planes terminan casi igual. La diferencia es mayor en las filas del medio, y se achica de nuevo con un adicional grande.',
      ],
    },
    {
      heading: 'Cómo elegir entre los dos',
      paragraphs: [
        'La avalancha paga menos intereses siempre que las tasas sean distintas, y la calculadora muestra cuánto con tus propias deudas. La bola de nieve da logros más pronto, lo que ayuda a algunas personas a seguir adelante. Un plan que sigues vale más que uno que abandonas, así que la elección correcta es la que vas a mantener.',
        'Dos cosas importan más que el orden: pagar más que los mínimos y no sumar saldos nuevos mientras pagas los viejos. Si un mínimo es menor que los intereses de esa deuda, la deuda crece mientras el adicional va a otra parte; la calculadora lo avisa cuando el presupuesto completo no cubre los intereses del primer mes.',
      ],
    },
  ],
  tableHeading: 'Las mismas deudas con distintos pagos adicionales',
  tableIntro: 'Las cuatro deudas de esta guía, con el pago adicional sobre los mínimos cambiado en cada fila.',
  tableCaption: 'Meses hasta quedar sin deudas e intereses pagados con la bola de nieve y la avalancha, según el pago adicional',
  tableNote: 'Calculado con el motor de este sitio el {date}, mes a mes y en centavos.',
  formulaHeading: 'El método',
  formula: [
    'Presupuesto = suma de los mínimos + adicional. Cada mes, a cada deuda se le cobra su tasa porcentual anual (APR) dividida entre 12 sobre su saldo, redondeada al centavo; cada deuda recibe su mínimo; lo que queda del presupuesto va a la primera deuda en el orden elegido, y luego a la siguiente.',
    'La bola de nieve ordena las deudas por su saldo inicial, de menor a mayor. La avalancha las ordena por APR, de mayor a menor.',
  ],
  premisesHeading: 'Supuestos',
  premises: [
    'Las APR y los mínimos no cambian, y no se cargan compras nuevas a las deudas.',
    'El presupuesto es el mismo cada mes; una deuda terminada deja su mínimo en el presupuesto.',
    'Los intereses se cobran una vez al mes, a la APR dividida entre 12. Los emisores de tarjetas que cobran intereses cada día dan números un poco distintos.',
  ],
  exampleHeading: 'Ejemplo resuelto',
  example: [
    'Presupuesto de {budget} al mes. Bola de nieve: sin deudas en {snowMonths}, {snowInterest} de intereses, en este orden: {snowOrder}. Avalancha: sin deudas en {avalMonths}, {avalInterest} de intereses, en este orden: {avalOrder}.',
  ],
  sourcesHeading: 'Fuentes',
  sources: [
    {
      label: 'Oficina para la Protección Financiera del Consumidor (CFPB), "Plan de acción contra la deuda", con las dos estrategias: primero la deuda más pequeña o primero la tasa de interés más alta (PDF, en español)',
      href: 'https://files.consumerfinance.gov/f/documents/cfpb_YMYG_toolkit_spanish_debt_action_plan_ADA3.21.pdf',
    },
    { label: 'CFPB, cómo reducir tu deuda (en inglés)', href: 'https://www.consumerfinance.gov/archive/blog/how-reduce-your-debt/' },
    {
      label: 'CFPB, cómo calcula la compañía de tu tarjeta de crédito los intereses que debes (en inglés)',
      href: 'https://www.consumerfinance.gov/ask-cfpb/how-does-my-credit-card-company-calculate-the-amount-of-interest-i-owe-en-51/',
    },
  ],
  disclaimerHeading: 'Guía educativa',
  disclaimer: 'Esta guía es educativa, no asesoría financiera. Tus prestamistas fijan las tasas y los mínimos de tus deudas.',
  relatedHeading: 'Calculadoras para el siguiente paso',
  words: {
    head: ['Adicional al mes', 'Bola de nieve: sin deudas en', 'Bola de nieve: intereses', 'Avalancha: sin deudas en', 'Avalancha: intereses', 'Diferencia de intereses'],
    debts: ['la tarjeta grande', 'la tarjeta pequeña', 'el préstamo para auto', 'el préstamo personal'],
    then: ', luego ',
  },
} satisfies GuideTexts<'guides-debt-snowball-vs-avalanche'>;

// The five categories of the public-repository audit (prompt F9, decision 8; DECISOES § 332): a real secret; public
// by nature (the site already shows it: the values of src/platform/site.ts and pix.ts, the brand's addresses, the
// no-reply addresses of the services); the owner's own data; a third party's data; a false positive (example
// domains, synthetic test values, hashes). Pure: the caller builds the context from the repository, never by hand.

export type FindingType = 'segredo' | 'email' | 'telefone' | 'cpf' | 'endereco' | 'perfil' | 'gps' | 'identidade-imagem' | 'autor-commit';

export type Category = 'segredo-real' | 'publico' | 'victor' | 'terceiro' | 'falso-positivo';

export const CATEGORIES: readonly Category[] = ['segredo-real', 'publico', 'victor', 'terceiro', 'falso-positivo'];

export const CATEGORY_LABEL: Record<Category, string> = {
  'segredo-real': 'segredo real',
  publico: 'público por natureza',
  victor: 'dado do Victor',
  terceiro: 'dado de terceiro',
  'falso-positivo': 'falso positivo',
};

export const TYPE_LABEL: Record<FindingType, string> = {
  segredo: 'segredo (gitleaks)',
  email: 'e-mail no texto',
  telefone: 'telefone',
  cpf: 'CPF',
  endereco: 'endereço',
  perfil: 'perfil pessoal',
  gps: 'GPS em imagem',
  'identidade-imagem': 'identidade em metadado de imagem',
  'autor-commit': 'autor ou quem commitou',
};

export interface Finding {
  type: FindingType;
  /** The value itself (an e-mail, a coordinate, "Name <email>"...). Only ever written to .cache/. */
  value: string;
  /** gitleaks rule or Exif tag, when there is one. */
  rule?: string;
  /** Repository paths where it appears (empty for commit authors and messages). */
  paths: string[];
  /** The matched line or gitleaks Match, for the hash and example checks. */
  context?: string;
}

export interface AuditContext {
  /** Lower-case strings the site already publishes: every string constant of src/platform/site.ts and pix.ts. */
  publicValues: Set<string>;
  /** Lower-case domains of the brand (the contact e-mail's and the site origin's). */
  brandDomains: Set<string>;
  /** Lower-case e-mails of the owner (git config user.email and the e-mails of the owner's commits). */
  ownerEmails: Set<string>;
  /** Lower-case names and logins of the owner (AUTHOR.name, git config user.name, the GitHub owner). */
  ownerNames: Set<string>;
  /** Paths of the public sample images that fixtures/ORIGEM.md lists. */
  samplePaths: Set<string>;
  /** Coordinates (six decimals) found in those sample images. */
  sampleCoordinates: Set<string>;
}

export interface Verdict {
  category: Category;
  note: string;
}

const EXAMPLE_DOMAIN = /(^|\.)(example\.(com|org|net)|example|invalid|test|localhost|local)$/i;
const EXAMPLE_WORD = /example|exemplo|ejemplo|sample|dummy|fake|placeholder|changeme|lorem|your[-_]?(key|token|secret|email)|xxxx|0000000/i;
const SERVICE_EMAIL = /^(noreply@anthropic\.com|noreply@github\.com|.*@users\.noreply\.github\.com|.*dependabot.*@.*|actions@github\.com|.*\[bot\]@.*)$/i;
const FREE_MAIL = new Set(['gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com', 'live.com', 'yahoo.com', 'icloud.com', 'me.com', 'proton.me', 'protonmail.com', 'aol.com', 'bol.com.br', 'uol.com.br', 'terra.com.br', 'ig.com.br', 'gmx.com']);
const ROLE_LOCAL = /^(info|contact|contato|contacto|hello|hi|hola|ola|hn|support|suporte|soporte|press|media|team|admin|editor|editors|editorial|partnerships?|ads|advertising|help|ajuda|ayuda|feedback|privacy|privacidade|privacidad|legal|security|abuse|webmaster|tips|submissions?|newsletter|office|sales|business|mail)$/i;
const HASH_CONTEXT = /sha-?(1|256|384|512)|hash|integrity|checksum|digest|etag|commit|fingerprint|sri/i;
const TEST_PATH = /^(tests|fixtures|scripts\/oracle|scripts\/fixtures)\//;
const SITE_PATH = /^(src|public)\//;
const LOCKFILE = /(^|\/)(pnpm-lock\.yaml|package-lock\.json|yarn\.lock)$/;
const US_FICTIONAL = /555[-. ]?01\d\d$/;
const US_TOLL_FREE = /^(?:\+?1[\s.-]?)?\(?8(00|33|44|55|66|77|88)\)?/;

const lower = (value: string): string => value.trim().toLowerCase();

function isPublicValue(value: string, context: AuditContext): boolean {
  const key = lower(value);
  if (context.publicValues.has(key)) return true;
  return [...context.publicValues].some((known) => known.length >= 12 && (key.includes(known) || (known.includes(key) && key.length >= 12)));
}

function emailVerdict(finding: Finding, context: AuditContext): Verdict {
  const key = lower(finding.value);
  const [local = '', domain = ''] = key.split('@');
  if (EXAMPLE_DOMAIN.test(domain) || /^(you|your|name|user|usuario|fulano|someone|alguem|john\.doe|jane\.doe)$/.test(local)) return { category: 'falso-positivo', note: 'endereço de exemplo' };
  if (key === 'git@github.com') return { category: 'falso-positivo', note: 'usuário SSH do Git, não é e-mail' };
  if (isPublicValue(key, context) || context.brandDomains.has(domain)) return { category: 'publico', note: 'endereço da marca, já no site' };
  if (SERVICE_EMAIL.test(key)) return { category: 'publico', note: 'endereço de serviço (no-reply ou robô)' };
  if (context.ownerEmails.has(key)) return { category: 'victor', note: 'e-mail do Victor' };
  if (finding.paths.length > 0 && finding.paths.every((path) => TEST_PATH.test(path))) return { category: 'falso-positivo', note: 'valor sintético de teste ou fixture' };
  const brand = [...context.brandDomains].map((brandDomain) => brandDomain.split('.')[0] ?? '').filter((name) => name.length >= 4);
  if (brand.some((name) => local.includes(name))) return { category: 'victor', note: 'conta com o nome da marca fora do domínio dela: provavelmente do Victor' };
  if (finding.paths.length > 0 && finding.paths.some((path) => SITE_PATH.test(path))) return { category: 'publico', note: 'está no código do site (src/ ou public/), como um texto de licença' };
  if (finding.paths.length > 0 && finding.paths.every((path) => LOCKFILE.test(path))) return { category: 'publico', note: 'metadado público de um pacote npm, no lockfile' };
  if (FREE_MAIL.has(domain)) return { category: 'terceiro', note: 'endereço pessoal (provedor gratuito)' };
  if (ROLE_LOCAL.test(local)) return { category: 'terceiro', note: 'endereço de função de uma organização' };
  return { category: 'terceiro', note: 'endereço de terceiro' };
}

function secretVerdict(finding: Finding, context: AuditContext): Verdict {
  const value = finding.value.trim();
  const around = `${finding.context ?? ''} ${finding.rule ?? ''}`;
  if (isPublicValue(value, context)) return { category: 'publico', note: 'valor que o site já publica (src/platform/)' };
  if (/^(.)\1+$/.test(value) || EXAMPLE_WORD.test(value) || EXAMPLE_WORD.test(finding.context ?? '')) return { category: 'falso-positivo', note: 'valor de exemplo' };
  if (/^\p{L}{4,40}$/u.test(value)) return { category: 'falso-positivo', note: 'palavra comum (só letras), não um segredo' };
  if ((/^[a-f0-9]{32,128}$/i.test(value) || /^sha(256|384|512)-[A-Za-z0-9+/=]{20,}$/.test(value)) && HASH_CONTEXT.test(around)) return { category: 'falso-positivo', note: 'hash (SHA, integridade ou commit)' };
  if (finding.paths.length > 0 && finding.paths.every((path) => TEST_PATH.test(path))) return { category: 'falso-positivo', note: 'valor sintético de teste ou fixture' };
  return { category: 'segredo-real', note: 'a conferir: gire o segredo antes de publicar' };
}

/** The category of one deduplicated finding, with a short note that says why. */
export function classify(finding: Finding, context: AuditContext): Verdict {
  const onlyTests = finding.paths.length > 0 && finding.paths.every((path) => TEST_PATH.test(path));
  const onSite = finding.paths.some((path) => SITE_PATH.test(path));
  switch (finding.type) {
    case 'segredo':
      return secretVerdict(finding, context);
    case 'email':
      return emailVerdict(finding, context);
    case 'autor-commit': {
      const match = /^(.*)<([^>]*)>$/.exec(finding.value.trim());
      const name = lower(match?.[1] ?? '');
      const email = lower(match?.[2] ?? '');
      if (SERVICE_EMAIL.test(email)) return { category: 'publico', note: 'identidade de serviço (no-reply ou robô)' };
      if (context.ownerEmails.has(email) || context.ownerNames.has(name)) return { category: 'victor', note: 'identidade de commit do Victor: fica pública com o histórico' };
      return { category: 'terceiro', note: 'identidade de commit de outra pessoa' };
    }
    case 'telefone': {
      const digits = finding.value.replace(/\D/g, '');
      if (US_FICTIONAL.test(digits)) return { category: 'falso-positivo', note: 'número fictício (555-01xx)' };
      if (onlyTests) return { category: 'falso-positivo', note: 'valor sintético de teste ou fixture' };
      if (isPublicValue(finding.value, context) || onSite) return { category: 'publico', note: 'número que o site já mostra' };
      if (US_TOLL_FREE.test(finding.value.trim())) return { category: 'terceiro', note: 'número comercial (0800 dos EUA)' };
      return { category: 'terceiro', note: 'a conferir: telefone de pessoa ou de empresa' };
    }
    case 'cpf':
      if (onlyTests) return { category: 'falso-positivo', note: 'CPF sintético de teste ou fixture' };
      return { category: 'terceiro', note: 'a conferir: CPF fora dos testes' };
    case 'endereco':
      if (onlyTests) return { category: 'falso-positivo', note: 'endereço sintético de teste ou fixture' };
      if (isPublicValue(finding.value, context) || onSite) return { category: 'publico', note: 'endereço que o site já mostra' };
      return { category: 'terceiro', note: 'a conferir: endereço de pessoa ou de empresa' };
    case 'perfil': {
      const key = lower(finding.value);
      if (isPublicValue(key, context)) return { category: 'publico', note: 'perfil que o site já mostra' };
      if ([...context.ownerNames].some((name) => !name.includes(' ') && name.length >= 4 && key.includes(name))) return { category: 'victor', note: 'perfil do Victor' };
      return { category: 'terceiro', note: 'perfil pessoal de terceiro' };
    }
    case 'gps':
      if (context.sampleCoordinates.has(finding.value) || (finding.paths.length > 0 && finding.paths.every((path) => context.samplePaths.has(path)))) {
        return { category: 'terceiro', note: 'amostra pública de terceiro (fixtures/ORIGEM.md): coordenada já publicada na origem' };
      }
      return { category: 'victor', note: 'origem fora do fixtures/ORIGEM.md: confira se a foto é sua e o lugar' };
    case 'identidade-imagem': {
      const value = lower(finding.value.replace(/^[^:]+:\s*/, ''));
      if ([...context.ownerNames].some((name) => name.length >= 4 && value.includes(name))) return { category: 'victor', note: 'nome do Victor no metadado' };
      if (finding.paths.length > 0 && finding.paths.every((path) => context.samplePaths.has(path))) return { category: 'terceiro', note: 'amostra pública de terceiro (fixtures/ORIGEM.md)' };
      return { category: 'terceiro', note: 'a conferir: metadado de identidade' };
    }
  }
}

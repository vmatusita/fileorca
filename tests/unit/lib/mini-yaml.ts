// The YAML reader of the tests lives in scripts/lib/ since the F9, because pnpm verificar --partes reads ci.yml with it
// (DECISOES § 329). The tests keep importing it from here.
export { parseYaml, type YamlValue } from '../../../scripts/lib/mini-yaml.ts';

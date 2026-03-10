import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslintConfigPrettier from "eslint-config-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort"; // <-- O novo plugin

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "linebreak-style": ["error", "unix"], // Força o padrão LF (Linux/Mac)
      "simple-import-sort/exports": "error",
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1. React e pacotes externos (ex: react, next, date-fns)
            ["^react", "^@?\\w"],
            // 2. Interfaces do domínio
            ["^@/domain/interfaces"],
            // 3. Utilitários
            ["^@/lib/utils"],
            // 4. Componentes
            ["^@/components"],
            // 5. Mocks
            ["^(\\.\\./mocks)"],
            // 6. Imports relativos de pastas pai (../)
            ["^\\.\\.(?!/?$)", "^\\../?$"],
            // 7. Imports relativos da mesma pasta (./)
            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
            // 8. Ficheiros de estilo (css, scss)
            ["^.+\\.s?css$"],
          ],
        },
      ],
    },
  },
  eslintConfigPrettier, // Prettier sempre no final para não haver conflitos

  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;

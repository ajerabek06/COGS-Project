const eslintConfig = [
  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],
    plugins: {
      "@next/next": (await import("@next/eslint-plugin-next")).default,
      "@typescript-eslint": (await import("@typescript-eslint/eslint-plugin")).default,
    },
    languageOptions: {
      parser: (await import("@typescript-eslint/parser")).default,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...(await import("@next/eslint-plugin-next")).default.configs["core-web-vitals"].rules,
      ...(await import("@typescript-eslint/eslint-plugin")).default.configs.recommended.rules,
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts", ".tmp-material-template/**"],
  },
];

export default eslintConfig;

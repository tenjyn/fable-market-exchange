export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        browser: true,
        Chart: "readonly"
      }
    },
    rules: {
      "no-unused-vars": "off"
    }
  }
];

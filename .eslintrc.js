module.exports = {
    "env": {
        "es2021": true,
        "node": true
    },
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint"
    ],
    "rules": {
        "no-duplicate-imports": "warn",
        "no-self-compare": "warn",
        "no-unmodified-loop-condition": "warn",
        "no-unreachable-loop": "error",
        "camelcase": "warn",
        "class-methods-use-this": "error",
        "curly": ["warn", "multi-line"],
        "default-case-last": "error",
        "dot-notation": "error",
        "func-style": ["error", "declaration"],
        "multiline-comment-style": "warn",
        "no-undef-init": "error",
        "no-var": "error",
        "block-spacing": "error",
        "@typescript-eslint/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
        "comma-spacing": ["error", { "before": false, "after": true }],
        "@typescript-eslint/indent": ["error", 4, { "SwitchCase": 1, "ObjectExpression": "first", "ArrayExpression": "first", "MemberExpression": "off" }],
        "no-trailing-spaces": ["warn", {"skipBlankLines": true}]
    }
};

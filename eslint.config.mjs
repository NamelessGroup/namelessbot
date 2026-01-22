import { defineConfig } from "eslint/config";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { jsdoc } from 'eslint-plugin-jsdoc';

export default defineConfig([
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    jsdoc({
        config: 'flat/recommended-typescript'
    }),
    {
        "ignores": [
            "eslint.config.mjs"
        ]
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            }
        }
    },
    {
        rules: {
            "no-var": "error",
            "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
            "jsdoc/require-jsdoc": ["warn", {
                "require": {
                    "ArrowFunctionExpression": false,
                    "ClassDeclaration": true,
                    "ClassExpression": true,
                    "FunctionDeclaration": true,
                    "FunctionExpression": false,
                    "MethodDefinition": false
                },
                "contexts": [ "ExportDefaultDeclaration", "MethodDefinition[override!=true]" ]
            }],
            "jsdoc/tag-lines": "off",
            "eqeqeq": ['error', 'always', {null: 'never'}]
        }
    },
    {
        files: [
            "tests/**/*.ts"
        ],
        rules: {
            "jsdoc/require-jsdoc": "off"
        }
    }
])
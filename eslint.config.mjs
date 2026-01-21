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
            "docs"
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
            "@typescript-eslint/explicit-function-return-type": "error",
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
            "jsdoc/tag-lines": "off"
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
import globals from "globals";
import pluginJs from "@eslint/js";


export default [
    {
        languageOptions: { 
        globals: {    
            ...globals.browser, 
            "chrome": "readonly",
        },
        parserOptions: {
            // Required for certain syntax usages
            "ecmaVersion": 2020
            }, 
        },
        ignores: [
            "**/node_modules/*",
            "**/dist/*"
        ],
    },
    pluginJs.configs.recommended,
];
module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "parserOptions": {
        "sourceType": "module",
        "ecmaVersion": 2018,
    },
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended",
    ],
    "rules": {
        "react/prop-types": 0,
        "indent": [
            "error",
            "tab",
			{"SwitchCase": 1}
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
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
        "plugin:import/errors",
        "plugin:import/warnings",
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
            "unix"
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
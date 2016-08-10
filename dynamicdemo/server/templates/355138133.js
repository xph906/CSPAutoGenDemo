{
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "baseMsg",
                        "CSPTag": "_baseMsg",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "init": {
                        "type": "Literal",
                        "value": "Welcome ",
                        "raw": "\"Welcome \"",
                        "CSPTag": "string",
                        "CSPValue": "Welcome ",
                        "CSPIndex": 0,
                        "CSPType": {
                            "type": "regexp",
                            "value": "^[\\w\\d\\s_\\-\\,]*$"
                        }
                    },
                    "CSPTag": "VariableDeclarator",
                    "CSPValue": null,
                    "CSPType": null
                }
            ],
            "kind": "var",
            "CSPTag": "VariableDeclaration",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "username",
                        "CSPTag": "_username",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "init": {
                        "type": "Literal",
                        "value": "Xiang Pan",
                        "raw": "\"Xiang Pan\"",
                        "CSPTag": "string",
                        "CSPValue": "Xiang Pan",
                        "CSPIndex": 1,
                        "CSPType": {
                            "type": "regexp",
                            "value": "^[\\w\\d\\s_\\-\\,]*$"
                        }
                    },
                    "CSPTag": "VariableDeclarator",
                    "CSPValue": null,
                    "CSPType": null
                }
            ],
            "kind": "var",
            "CSPTag": "VariableDeclaration",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "age",
                        "CSPTag": "_age",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "init": {
                        "type": "Literal",
                        "value": 28,
                        "raw": "28",
                        "CSPTag": "number",
                        "CSPValue": 28,
                        "CSPIndex": 2,
                        "CSPType": {
                            "type": "number",
                            "value": null
                        }
                    },
                    "CSPTag": "VariableDeclarator",
                    "CSPValue": null,
                    "CSPType": null
                }
            ],
            "kind": "var",
            "CSPTag": "VariableDeclaration",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "mj",
                        "CSPTag": "_mj",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "init": {
                        "type": "Literal",
                        "value": "Computer Science",
                        "raw": "\"Computer Science\"",
                        "CSPTag": "string",
                        "CSPValue": "Computer Science",
                        "CSPIndex": 3,
                        "CSPType": {
                            "type": "regexp",
                            "value": "^[\\w\\d\\s_\\-\\,]*$"
                        }
                    },
                    "CSPTag": "VariableDeclarator",
                    "CSPValue": null,
                    "CSPType": null
                }
            ],
            "kind": "var",
            "CSPTag": "VariableDeclaration",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "magicNumber",
                        "CSPTag": "_magicNumber",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "init": {
                        "type": "BinaryExpression",
                        "operator": "%",
                        "left": {
                            "type": "Identifier",
                            "name": "age",
                            "CSPTag": "_age",
                            "CSPValue": null,
                            "CSPType": null
                        },
                        "right": {
                            "type": "Literal",
                            "value": 2,
                            "raw": "2",
                            "CSPTag": "number",
                            "CSPValue": 2,
                            "CSPIndex": 4,
                            "CSPType": {
                                "type": "number",
                                "value": null
                            }
                        },
                        "CSPTag": "BinaryExpression",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "CSPTag": "VariableDeclarator",
                    "CSPValue": null,
                    "CSPType": null
                }
            ],
            "kind": "var",
            "CSPTag": "VariableDeclaration",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "AssignmentExpression",
                "operator": "=",
                "left": {
                    "type": "MemberExpression",
                    "computed": false,
                    "object": {
                        "type": "CallExpression",
                        "callee": {
                            "type": "MemberExpression",
                            "computed": false,
                            "object": {
                                "type": "Identifier",
                                "name": "document",
                                "CSPTag": "_document",
                                "CSPValue": null,
                                "CSPType": null
                            },
                            "property": {
                                "type": "Identifier",
                                "name": "getElementById",
                                "CSPTag": "_getElementById",
                                "CSPValue": null,
                                "CSPType": null
                            },
                            "CSPTag": "MemberExpression",
                            "CSPValue": null,
                            "CSPType": null
                        },
                        "arguments": [
                            {
                                "type": "Literal",
                                "value": "welcomeMsg",
                                "raw": "\"welcomeMsg\"",
                                "CSPTag": "string",
                                "CSPValue": "welcomeMsg",
                                "CSPIndex": 5,
                                "CSPType": {
                                    "type": "regexp",
                                    "value": "^[\\w\\d\\s_\\-\\,]*$"
                                }
                            }
                        ],
                        "CSPTag": "CallExpression",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "property": {
                        "type": "Identifier",
                        "name": "innerHTML",
                        "CSPTag": "_innerHTML",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "CSPTag": "MemberExpression",
                    "CSPValue": null,
                    "CSPType": null
                },
                "right": {
                    "type": "BinaryExpression",
                    "operator": "+",
                    "left": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "Identifier",
                            "name": "baseMsg",
                            "CSPTag": "_baseMsg",
                            "CSPValue": null,
                            "CSPType": null
                        },
                        "right": {
                            "type": "Identifier",
                            "name": "username",
                            "CSPTag": "_username",
                            "CSPValue": null,
                            "CSPType": null
                        },
                        "CSPTag": "BinaryExpression",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "right": {
                        "type": "Literal",
                        "value": "!<br>",
                        "raw": "\"!<br>\"",
                        "CSPTag": "string",
                        "CSPValue": "!<br>",
                        "CSPIndex": 6,
                        "CSPType": {
                            "type": "regexp",
                            "value": "^!<br>(.)*$"
                        }
                    },
                    "CSPTag": "BinaryExpression",
                    "CSPValue": null,
                    "CSPType": null
                },
                "CSPTag": "AssignmentExpression",
                "CSPValue": null,
                "CSPType": null
            },
            "CSPTag": "ExpressionStatement",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "specialChar",
                        "CSPTag": "_specialChar",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "init": {
                        "type": "ArrayExpression",
                        "elements": [
                            {
                                "type": "Literal",
                                "value": "MI",
                                "raw": "\"MI\""
                            },
                            {
                                "type": "Literal",
                                "value": 224,
                                "raw": "224"
                            }
                        ],
                        "CSPTag": "array",
                        "CSPValue": {
                            "CSP_string_lev1": [
                                "MI"
                            ],
                            "number": [
                                224
                            ]
                        },
                        "CSPIndex": 7,
                        "CSPType": {
                            "type": {
                                "CSP_string_lev1": "regexp",
                                "number": "number"
                            },
                            "value": {
                                "CSP_string_lev1": "^[\\w\\d\\s_\\-\\,]*$",
                                "number": null
                            }
                        }
                    },
                    "CSPTag": "VariableDeclarator",
                    "CSPValue": null,
                    "CSPType": null
                }
            ],
            "kind": "var",
            "CSPTag": "VariableDeclaration",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "profile",
                        "CSPTag": "_profile",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "init": {
                        "type": "ObjectExpression",
                        "properties": [
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "major"
                                },
                                "computed": false,
                                "value": {
                                    "type": "Identifier",
                                    "name": "mj"
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": false
                            },
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "userKey"
                                },
                                "computed": false,
                                "value": {
                                    "type": "BinaryExpression",
                                    "operator": "+",
                                    "left": {
                                        "type": "BinaryExpression",
                                        "operator": "+",
                                        "left": {
                                            "type": "Identifier",
                                            "name": "age"
                                        },
                                        "right": {
                                            "type": "CallExpression",
                                            "callee": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "username"
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "replace"
                                                }
                                            },
                                            "arguments": [
                                                {
                                                    "type": "Literal",
                                                    "value": {},
                                                    "raw": "/\\s/g",
                                                    "regex": {
                                                        "pattern": "\\s",
                                                        "flags": "g"
                                                    }
                                                },
                                                {
                                                    "type": "MemberExpression",
                                                    "computed": true,
                                                    "object": {
                                                        "type": "Identifier",
                                                        "name": "specialChar"
                                                    },
                                                    "property": {
                                                        "type": "Identifier",
                                                        "name": "magicNumber"
                                                    }
                                                }
                                            ]
                                        }
                                    },
                                    "right": {
                                        "type": "Literal",
                                        "value": "2332ea12332",
                                        "raw": "\"2332ea12332\""
                                    }
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": false
                            },
                            {
                                "type": "Property",
                                "key": {
                                    "type": "Identifier",
                                    "name": "hobby"
                                },
                                "computed": false,
                                "value": {
                                    "type": "ArrayExpression",
                                    "elements": [
                                        {
                                            "type": "Literal",
                                            "value": "Basketball",
                                            "raw": "\"Basketball\""
                                        },
                                        {
                                            "type": "Literal",
                                            "value": "Football",
                                            "raw": "\"Football\""
                                        },
                                        {
                                            "type": "Literal",
                                            "value": "Music",
                                            "raw": "\"Music\""
                                        },
                                        {
                                            "type": "Literal",
                                            "value": "Watching Movies",
                                            "raw": "\"Watching Movies\""
                                        }
                                    ]
                                },
                                "kind": "init",
                                "method": false,
                                "shorthand": false
                            }
                        ],
                        "CSPTag": "object",
                        "CSPValue": {
                            "CSP_GAST": [
                                {
                                    "type": "BinaryExpression",
                                    "operator": "+",
                                    "left": {
                                        "type": "BinaryExpression",
                                        "operator": "+",
                                        "left": {
                                            "type": "Identifier",
                                            "name": "age",
                                            "NNOdepth": 1,
                                            "CSPTag": "_age",
                                            "CSPValue": null
                                        },
                                        "right": {
                                            "type": "CallExpression",
                                            "callee": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "username",
                                                    "NNOdepth": 1,
                                                    "CSPTag": "_username",
                                                    "CSPValue": null
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "replace",
                                                    "NNOdepth": 1,
                                                    "CSPTag": "_replace",
                                                    "CSPValue": null
                                                },
                                                "NNOdepth": 1,
                                                "CSPTag": "MemberExpression",
                                                "CSPValue": null
                                            },
                                            "arguments": [
                                                {
                                                    "type": "Literal",
                                                    "value": {},
                                                    "raw": "/\\s/g",
                                                    "regex": {
                                                        "pattern": "\\s",
                                                        "flags": "g"
                                                    },
                                                    "NNOdepth": 1,
                                                    "CSPTag": "object",
                                                    "CSPValue": {}
                                                },
                                                {
                                                    "type": "MemberExpression",
                                                    "computed": true,
                                                    "object": {
                                                        "type": "Identifier",
                                                        "name": "specialChar",
                                                        "NNOdepth": 1,
                                                        "CSPTag": "_specialChar",
                                                        "CSPValue": null
                                                    },
                                                    "property": {
                                                        "type": "Identifier",
                                                        "name": "magicNumber",
                                                        "NNOdepth": 1,
                                                        "CSPTag": "_magicNumber",
                                                        "CSPValue": null
                                                    },
                                                    "NNOdepth": 1,
                                                    "CSPTag": "MemberExpression",
                                                    "CSPValue": null
                                                }
                                            ],
                                            "NNOdepth": 1,
                                            "CSPTag": "CallExpression",
                                            "CSPValue": null
                                        },
                                        "NNOdepth": 1,
                                        "CSPTag": "BinaryExpression",
                                        "CSPValue": null
                                    },
                                    "right": {
                                        "type": "Literal",
                                        "value": "2332ea12332",
                                        "raw": "\"2332ea12332\"",
                                        "NNOdepth": 1,
                                        "CSPTag": "string",
                                        "CSPValue": "2332ea12332",
                                        "CSPIndex": 0
                                    },
                                    "NNOdepth": 1,
                                    "CSPTag": "BinaryExpression",
                                    "CSPValue": null
                                }
                            ],
                            "CSP_string_lev2": [
                                "Basketball",
                                "Football",
                                "Music",
                                "Watching Movies"
                            ]
                        },
                        "CSPIndex": 8,
                        "CSPType": {
                            "type": {
                                "CSP_GAST": "gast",
                                "CSP_string_lev2": "regexp"
                            },
                            "value": {
                                "CSP_GAST": {
                                    "1251157852": true
                                },
                                "CSP_string_lev2": "^[\\w\\d\\s_\\-\\,]*$"
                            }
                        }
                    },
                    "CSPTag": "VariableDeclarator",
                    "CSPValue": null,
                    "CSPType": null
                }
            ],
            "kind": "var",
            "CSPTag": "VariableDeclaration",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "VariableDeclaration",
            "declarations": [
                {
                    "type": "VariableDeclarator",
                    "id": {
                        "type": "Identifier",
                        "name": "balance",
                        "CSPTag": "_balance",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "init": {
                        "type": "Literal",
                        "value": 10,
                        "raw": "10",
                        "CSPTag": "number",
                        "CSPValue": 10,
                        "CSPIndex": 9,
                        "CSPType": {
                            "type": "number",
                            "value": null
                        }
                    },
                    "CSPTag": "VariableDeclarator",
                    "CSPValue": null,
                    "CSPType": null
                }
            ],
            "kind": "var",
            "CSPTag": "VariableDeclaration",
            "CSPValue": null,
            "CSPType": null
        },
        {
            "type": "ExpressionStatement",
            "expression": {
                "type": "CallExpression",
                "callee": {
                    "type": "FunctionExpression",
                    "id": null,
                    "params": [],
                    "defaults": [],
                    "body": {
                        "type": "BlockStatement",
                        "body": [
                            {
                                "type": "VariableDeclaration",
                                "declarations": [
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "balance",
                                            "CSPTag": "_balance",
                                            "CSPValue": null,
                                            "CSPType": null
                                        },
                                        "init": {
                                            "type": "Literal",
                                            "value": 79,
                                            "raw": "79",
                                            "CSPTag": "number",
                                            "CSPValue": 79,
                                            "CSPIndex": 10,
                                            "CSPType": {
                                                "type": "number",
                                                "value": null
                                            }
                                        },
                                        "CSPTag": "VariableDeclarator",
                                        "CSPValue": null,
                                        "CSPType": null
                                    }
                                ],
                                "kind": "var",
                                "CSPTag": "VariableDeclaration",
                                "CSPValue": null,
                                "CSPType": null
                            },
                            {
                                "type": "VariableDeclaration",
                                "declarations": [
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "contents",
                                            "CSPTag": "_contents",
                                            "CSPValue": null,
                                            "CSPType": null
                                        },
                                        "init": {
                                            "type": "BinaryExpression",
                                            "operator": "+",
                                            "left": {
                                                "type": "BinaryExpression",
                                                "operator": "+",
                                                "left": {
                                                    "type": "BinaryExpression",
                                                    "operator": "+",
                                                    "left": {
                                                        "type": "BinaryExpression",
                                                        "operator": "+",
                                                        "left": {
                                                            "type": "BinaryExpression",
                                                            "operator": "+",
                                                            "left": {
                                                                "type": "BinaryExpression",
                                                                "operator": "+",
                                                                "left": {
                                                                    "type": "BinaryExpression",
                                                                    "operator": "+",
                                                                    "left": {
                                                                        "type": "BinaryExpression",
                                                                        "operator": "+",
                                                                        "left": {
                                                                            "type": "BinaryExpression",
                                                                            "operator": "+",
                                                                            "left": {
                                                                                "type": "BinaryExpression",
                                                                                "operator": "+",
                                                                                "left": {
                                                                                    "type": "BinaryExpression",
                                                                                    "operator": "+",
                                                                                    "left": {
                                                                                        "type": "BinaryExpression",
                                                                                        "operator": "+",
                                                                                        "left": {
                                                                                            "type": "Literal",
                                                                                            "value": "Name:",
                                                                                            "raw": "\"Name:\"",
                                                                                            "CSPTag": "string",
                                                                                            "CSPValue": "Name:",
                                                                                            "CSPIndex": 11,
                                                                                            "CSPType": {
                                                                                                "type": "regexp",
                                                                                                "value": "^Name:(.)*$"
                                                                                            }
                                                                                        },
                                                                                        "right": {
                                                                                            "type": "Identifier",
                                                                                            "name": "username",
                                                                                            "CSPTag": "_username",
                                                                                            "CSPValue": null,
                                                                                            "CSPType": null
                                                                                        },
                                                                                        "CSPTag": "BinaryExpression",
                                                                                        "CSPValue": null,
                                                                                        "CSPType": null
                                                                                    },
                                                                                    "right": {
                                                                                        "type": "Literal",
                                                                                        "value": "<br>Major:",
                                                                                        "raw": "\"<br>Major:\"",
                                                                                        "CSPTag": "string",
                                                                                        "CSPValue": "<br>Major:",
                                                                                        "CSPIndex": 12,
                                                                                        "CSPType": {
                                                                                            "type": "regexp",
                                                                                            "value": "^<br>Major:(.)*$"
                                                                                        }
                                                                                    },
                                                                                    "CSPTag": "BinaryExpression",
                                                                                    "CSPValue": null,
                                                                                    "CSPType": null
                                                                                },
                                                                                "right": {
                                                                                    "type": "MemberExpression",
                                                                                    "computed": false,
                                                                                    "object": {
                                                                                        "type": "Identifier",
                                                                                        "name": "profile",
                                                                                        "CSPTag": "_profile",
                                                                                        "CSPValue": null,
                                                                                        "CSPType": null
                                                                                    },
                                                                                    "property": {
                                                                                        "type": "Identifier",
                                                                                        "name": "major",
                                                                                        "CSPTag": "_major",
                                                                                        "CSPValue": null,
                                                                                        "CSPType": null
                                                                                    },
                                                                                    "CSPTag": "MemberExpression",
                                                                                    "CSPValue": null,
                                                                                    "CSPType": null
                                                                                },
                                                                                "CSPTag": "BinaryExpression",
                                                                                "CSPValue": null,
                                                                                "CSPType": null
                                                                            },
                                                                            "right": {
                                                                                "type": "Literal",
                                                                                "value": "<br>Hobby:",
                                                                                "raw": "\"<br>Hobby:\"",
                                                                                "CSPTag": "string",
                                                                                "CSPValue": "<br>Hobby:",
                                                                                "CSPIndex": 13,
                                                                                "CSPType": {
                                                                                    "type": "regexp",
                                                                                    "value": "^<br>Hobby:(.)*$"
                                                                                }
                                                                            },
                                                                            "CSPTag": "BinaryExpression",
                                                                            "CSPValue": null,
                                                                            "CSPType": null
                                                                        },
                                                                        "right": {
                                                                            "type": "MemberExpression",
                                                                            "computed": true,
                                                                            "object": {
                                                                                "type": "MemberExpression",
                                                                                "computed": false,
                                                                                "object": {
                                                                                    "type": "Identifier",
                                                                                    "name": "profile",
                                                                                    "CSPTag": "_profile",
                                                                                    "CSPValue": null,
                                                                                    "CSPType": null
                                                                                },
                                                                                "property": {
                                                                                    "type": "Identifier",
                                                                                    "name": "hobby",
                                                                                    "CSPTag": "_hobby",
                                                                                    "CSPValue": null,
                                                                                    "CSPType": null
                                                                                },
                                                                                "CSPTag": "MemberExpression",
                                                                                "CSPValue": null,
                                                                                "CSPType": null
                                                                            },
                                                                            "property": {
                                                                                "type": "Literal",
                                                                                "value": 0,
                                                                                "raw": "0",
                                                                                "CSPTag": "number",
                                                                                "CSPValue": 0,
                                                                                "CSPIndex": 14,
                                                                                "CSPType": {
                                                                                    "type": "number",
                                                                                    "value": null
                                                                                }
                                                                            },
                                                                            "CSPTag": "MemberExpression",
                                                                            "CSPValue": null,
                                                                            "CSPType": null
                                                                        },
                                                                        "CSPTag": "BinaryExpression",
                                                                        "CSPValue": null,
                                                                        "CSPType": null
                                                                    },
                                                                    "right": {
                                                                        "type": "Literal",
                                                                        "value": "<br>",
                                                                        "raw": "\"<br>\"",
                                                                        "CSPTag": "string",
                                                                        "CSPValue": "<br>",
                                                                        "CSPIndex": 15,
                                                                        "CSPType": {
                                                                            "type": "regexp",
                                                                            "value": "^<br>(.)*$"
                                                                        }
                                                                    },
                                                                    "CSPTag": "BinaryExpression",
                                                                    "CSPValue": null,
                                                                    "CSPType": null
                                                                },
                                                                "right": {
                                                                    "type": "Identifier",
                                                                    "name": "globalLineVar",
                                                                    "CSPTag": "_globalLineVar",
                                                                    "CSPValue": null,
                                                                    "CSPType": null
                                                                },
                                                                "CSPTag": "BinaryExpression",
                                                                "CSPValue": null,
                                                                "CSPType": null
                                                            },
                                                            "right": {
                                                                "type": "Literal",
                                                                "value": "<br>Password:",
                                                                "raw": "\"<br>Password:\"",
                                                                "CSPTag": "string",
                                                                "CSPValue": "<br>Password:",
                                                                "CSPIndex": 16,
                                                                "CSPType": {
                                                                    "type": "regexp",
                                                                    "value": "^<br>Password:(.)*$"
                                                                }
                                                            },
                                                            "CSPTag": "BinaryExpression",
                                                            "CSPValue": null,
                                                            "CSPType": null
                                                        },
                                                        "right": {
                                                            "type": "MemberExpression",
                                                            "computed": false,
                                                            "object": {
                                                                "type": "Identifier",
                                                                "name": "profile",
                                                                "CSPTag": "_profile",
                                                                "CSPValue": null,
                                                                "CSPType": null
                                                            },
                                                            "property": {
                                                                "type": "Identifier",
                                                                "name": "userKey",
                                                                "CSPTag": "_userKey",
                                                                "CSPValue": null,
                                                                "CSPType": null
                                                            },
                                                            "CSPTag": "MemberExpression",
                                                            "CSPValue": null,
                                                            "CSPType": null
                                                        },
                                                        "CSPTag": "BinaryExpression",
                                                        "CSPValue": null,
                                                        "CSPType": null
                                                    },
                                                    "right": {
                                                        "type": "Literal",
                                                        "value": "<br>",
                                                        "raw": "\"<br>\"",
                                                        "CSPTag": "string",
                                                        "CSPValue": "<br>",
                                                        "CSPIndex": 17,
                                                        "CSPType": {
                                                            "type": "regexp",
                                                            "value": "^<br>(.)*$"
                                                        }
                                                    },
                                                    "CSPTag": "BinaryExpression",
                                                    "CSPValue": null,
                                                    "CSPType": null
                                                },
                                                "right": {
                                                    "type": "Identifier",
                                                    "name": "globalLineVar",
                                                    "CSPTag": "_globalLineVar",
                                                    "CSPValue": null,
                                                    "CSPType": null
                                                },
                                                "CSPTag": "BinaryExpression",
                                                "CSPValue": null,
                                                "CSPType": null
                                            },
                                            "right": {
                                                "type": "Literal",
                                                "value": "<br>",
                                                "raw": "\"<br>\"",
                                                "CSPTag": "string",
                                                "CSPValue": "<br>",
                                                "CSPIndex": 18,
                                                "CSPType": {
                                                    "type": "regexp",
                                                    "value": "^<br>(.)*$"
                                                }
                                            },
                                            "CSPTag": "BinaryExpression",
                                            "CSPValue": null,
                                            "CSPType": null
                                        },
                                        "CSPTag": "VariableDeclarator",
                                        "CSPValue": null,
                                        "CSPType": null
                                    }
                                ],
                                "kind": "var",
                                "CSPTag": "VariableDeclaration",
                                "CSPValue": null,
                                "CSPType": null
                            },
                            {
                                "type": "ExpressionStatement",
                                "expression": {
                                    "type": "AssignmentExpression",
                                    "operator": "+=",
                                    "left": {
                                        "type": "MemberExpression",
                                        "computed": false,
                                        "object": {
                                            "type": "CallExpression",
                                            "callee": {
                                                "type": "MemberExpression",
                                                "computed": false,
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "document",
                                                    "CSPTag": "_document",
                                                    "CSPValue": null,
                                                    "CSPType": null
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "getElementById",
                                                    "CSPTag": "_getElementById",
                                                    "CSPValue": null,
                                                    "CSPType": null
                                                },
                                                "CSPTag": "MemberExpression",
                                                "CSPValue": null,
                                                "CSPType": null
                                            },
                                            "arguments": [
                                                {
                                                    "type": "Literal",
                                                    "value": "welcomeMsg",
                                                    "raw": "\"welcomeMsg\"",
                                                    "CSPTag": "string",
                                                    "CSPValue": "welcomeMsg",
                                                    "CSPIndex": 19,
                                                    "CSPType": {
                                                        "type": "regexp",
                                                        "value": "^[\\w\\d\\s_\\-\\,]*$"
                                                    }
                                                }
                                            ],
                                            "CSPTag": "CallExpression",
                                            "CSPValue": null,
                                            "CSPType": null
                                        },
                                        "property": {
                                            "type": "Identifier",
                                            "name": "innerHTML",
                                            "CSPTag": "_innerHTML",
                                            "CSPValue": null,
                                            "CSPType": null
                                        },
                                        "CSPTag": "MemberExpression",
                                        "CSPValue": null,
                                        "CSPType": null
                                    },
                                    "right": {
                                        "type": "Identifier",
                                        "name": "contents",
                                        "CSPTag": "_contents",
                                        "CSPValue": null,
                                        "CSPType": null
                                    },
                                    "CSPTag": "AssignmentExpression",
                                    "CSPValue": null,
                                    "CSPType": null
                                },
                                "CSPTag": "ExpressionStatement",
                                "CSPValue": null,
                                "CSPType": null
                            },
                            {
                                "type": "ExpressionStatement",
                                "expression": {
                                    "type": "CallExpression",
                                    "callee": {
                                        "type": "Identifier",
                                        "name": "eval",
                                        "CSPTag": "_eval",
                                        "CSPValue": null,
                                        "CSPType": null
                                    },
                                    "arguments": [
                                        {
                                            "type": "Literal",
                                            "value": "document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+'.'",
                                            "raw": "\"document.getElementById(\\\"welcomeMsg\\\").innerHTML+=\\\"Your balance is $\\\"+balance+\\'.\\'\"",
                                            "CSPTag": "string",
                                            "CSPValue": "document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+'.'",
                                            "CSPIndex": 20,
                                            "CSPType": {
                                                "type": "regexp",
                                                "value": "^document\\.getElementById\\([\\w\\d\\s_\\-\\,\\.\\(\"\\)\\+=\\$']*'\\.'$"
                                            }
                                        }
                                    ],
                                    "CSPTag": "evalcall",
                                    "CSPValue": "document.getElementById(\"welcomeMsg\").innerHTML+=\"Your balance is $\"+balance+'.'",
                                    "CSPType": null
                                },
                                "CSPTag": "ExpressionStatement",
                                "CSPValue": null,
                                "CSPType": null
                            }
                        ],
                        "CSPTag": "BlockStatement",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "generator": false,
                    "expression": false,
                    "CSPTag": "FunctionExpression",
                    "CSPValue": null,
                    "CSPType": null
                },
                "arguments": [],
                "CSPTag": "CallExpression",
                "CSPValue": null,
                "CSPType": null
            },
            "CSPTag": "ExpressionStatement",
            "CSPValue": null,
            "CSPType": null
        }
    ],
    "sourceType": "script",
    "CSPTag": "Program",
    "CSPValue": null,
    "CSPType": null
}
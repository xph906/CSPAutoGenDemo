{
    "type": "Program",
    "body": [
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
                                "CSPIndex": 0,
                                "CSPType": {
                                    "type": "const",
                                    "value": "welcomeMsg"
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
                            "type": "Literal",
                            "value": "Your balance is $",
                            "raw": "\"Your balance is $\"",
                            "CSPTag": "string",
                            "CSPValue": "Your balance is $",
                            "CSPIndex": 1,
                            "CSPType": {
                                "type": "const",
                                "value": "Your balance is $"
                            }
                        },
                        "right": {
                            "type": "Identifier",
                            "name": "balance",
                            "CSPTag": "_balance",
                            "CSPValue": null,
                            "CSPType": null
                        },
                        "CSPTag": "BinaryExpression",
                        "CSPValue": null,
                        "CSPType": null
                    },
                    "right": {
                        "type": "Literal",
                        "value": ".",
                        "raw": "'.'",
                        "CSPTag": "string",
                        "CSPValue": ".",
                        "CSPIndex": 2,
                        "CSPType": {
                            "type": "const",
                            "value": "."
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
        }
    ],
    "sourceType": "script",
    "CSPTag": "Program",
    "CSPValue": null,
    "CSPType": null
}
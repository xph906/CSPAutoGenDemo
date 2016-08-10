var baseMsg = 'Hello ';
var username = '1';
var age = 1;
var mj = 'Civil Engineering';
var magicNumber = age % 4;
document.getElementById('welcomeMsg').innerHTML = baseMsg + username + '!<br>';
var specialChar = [
    'MW',
    'AA',
    847,
    'UA'
];
var profile = {
    major: mj,
    userKey: age + username.replace(/\s/g, specialChar[magicNumber]) + 'randomString1',
    hobby: [
        'Reading Papers',
        'Writting Papers',
        'Reviewing Papers'
    ]
};
var balance = 10;
(function () {
        function CSPFun1610790397(CSPString0, CSPString1, CSPString2) {
        document.getElementById(CSPString0).innerHTML += CSPString1 + balance + CSPString2;
    }
    var balance = 200;
    var contents = 'Name:' + username + '<br>Major:' + profile.major + '<br>Hobby:' + profile.hobby[0] + '<br>' + globalLineVar + '<br>Password:' + profile.userKey + '<br>' + globalLineVar + '<br>';
    document.getElementById('welcomeMsg').innerHTML += contents;
    CSPFun1610790397('welcomeMsg', 'Your balance is $', '.');
}());
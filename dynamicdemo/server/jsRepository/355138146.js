var baseMsg = 'Welcome ';
var username = 'John Wayne';
var age = 25;
var mj = 'Computer Science';
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
    var balance = 200;
    var contents = 'Name:' + username + '<br>Major:' + profile.major + '<br>Hobby:' + profile.hobby[0] + '<br>' + globalLineVar + '<br>Password:' + profile.userKey + '<br>' + globalLineVar + '<br>';
    document.getElementById('welcomeMsg').innerHTML += contents;
    eval('document.getElementById(\'welcomeMsg\').innerHTML+=\'Your balance is $\'+balance +\'.\'');
}());
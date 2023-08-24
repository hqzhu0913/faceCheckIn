
var techGym = window.TechGym || {};
let authToken;

$(document).ready(function($) {
	// code from ride.js
    techGym.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
        } else {
            window.location.href = './signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = './signin.html';
    });

});


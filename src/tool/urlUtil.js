'use strict';

exports.getPageName = function () {
    var u = location.pathname;
    var a = u.split(/\//);
    var m = a.pop().match(/(?:^|\/)($|[^\.]+)/);

    return m[1] ? m[1] : 'index';
}

exports.getQuery = function (name) {
    var u = location.search.slice(1);
    var re = new RegExp(name + '=([^&\\s+]+)');
    var m = u.match(re);
    var v = m ? m[1] : '';

    return (v === '' || isNaN(v)) ? v : v - 0;
}

exports.getHash = function (name) {
    var u = location.hash.slice(1);
    var re = new RegExp(name + '=([^&\\s+]+)');
    var m = u.match(re);
    var v = m ? m[1] : '';

    return (v === '' || isNaN(v)) ? v : v - 0;
}

exports.parseUrl = function(url) {
    var a = document.createElement('a');

    a.href = (url || 'x.html');

    return {
        host: a.host,
        protocol: a.protocol
    };
}

exports.serialize =  function (obj) {
    var s = [];

    $.each(obj, function(k, v) {
        s.push(k + '=' + encodeURIComponent(v));
    });

    return s.join('&');
}

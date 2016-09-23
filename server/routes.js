'use strict';

const fs = require('fs');

const render = require('koa-ejs');
const proxy = require('koa-proxy');

let path = require('path')
let glob = require('glob')
let mockDir = path.resolve(process.cwd(), 'mock')
let mockFiles = (function(){
    let files = glob.sync(mockDir + '/*.js')
    let map = {}

    files.forEach((filePath) => {
        let filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
        map[filename] = filePath
    })

    return map
})();
let mockNames = Object.keys(mockFiles)

const list = [];

module.exports = (router, app, staticDir) => {

    mockNames.forEach(function(name) {
        let data = require('../mock/' + name);
        router.get('/api/' + name, function*() {
            this.body = data;
        });
    });

    render(app, {
        root: __dirname,
        layout: false,
        viewExt: 'html',
        cache: false,
        debug: true
    });

    router.get('/', function*() {
        let pages = fs.readdirSync(staticDir);

        pages = pages.filter((page) => {
            return /\.html$/.test(page);
        });

        yield this.render('home', {pages: pages || []});
    });
};

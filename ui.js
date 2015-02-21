module.exports = {
    printWelcome: function () {
        console.log('');
        console.warn('Zombieland MMORPG Server');
        console.log('Version ' + config.version + ' - hello@burningtomato.com');
        console.log('---');
    },

    writeLog: function (text) {
        var datePrefix = new Date().toLocaleTimeString();
        console.log('[' + datePrefix + '] ' + text);
    }
};
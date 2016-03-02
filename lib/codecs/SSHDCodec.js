var util = require('util')

var SSHDCodec = function () {
    //TODO: invalid public DH value: <= 1 [preauth]
    //TODO: Received signal 15; terminating.
    //TODO: Server listening on 0.0.0.0 port 22.
    //TODO: Server listening on :: port 22.
    //TODO: Protocol major versions differ for 10.0.0.1: MY VERSION CONTAINING SPACES vs. THEIR VERSION CONTAINING SPACES

    this.regexes = [
        {
            name: 'accepted_connection',
            regex: /^Accepted (\S+) for (\S+) from ((?:\d{1,3}\.){3}\d{1,3}) port (\d+) (\w+)(?:: (\S+) (\S+))?/,
            parts: [ 'method', 'user', 'ip', 'port', 'protocol', 'key_type', 'key_fingerprint' ]
        },
        {
            name: 'bad_protocol_version',
            regex: /^Bad protocol version identification '(.+)?' from ((?:\d{1,3}\.){3}\d{1,3}) port (\d+)/,
            parts: [ 'version', 'ip', 'port' ]
        },
        {
            name: 'disconnecting',
            regex: /^Disconnecting: (.*)/,
            parts: [ 'reason' ]
        },
        {
            name: 'no_identification',
            regex: /^Did not receive identification string from ((?:\d{1,3}\.){3}\d{1,3})/,
            parts: [ 'ip' ]
        },
        {
            name: 'error',
            regex: /^error: (.*)/,
            parts: [ 'error' ]
        },
        {
            name: 'failed_event',
            regex: /^Failed (.+) for '?(\S+?)'? from ((?:\d{1,3}\.){3}\d{1,3})(?: port (\d+) (\S+))?/,
            parts: [ 'method', 'user', 'ip', 'port', 'protocol' ]
        },
        {
            name: 'successful_event',
            regex: /^Successful (.+) for '?(\S+?)'? from ((?:\d{1,3}\.){3}\d{1,3})(?: port (\d+) (\S+))?/,
            parts: [ 'method', 'user', 'ip', 'port', 'protocol' ]
        },
        {
            name: 'fatal',
            regex: /^fatal: (.*)/,
            parts: [ 'error' ]
        },
        {
            name: 'invalid_user',
            regex: /^Invalid user (\S+) from ((?:\d{1,3}\.){3}\d{1,3})/,
            parts: [ 'user', 'ip' ]
        },
        {
            name: 'pam_session',
            regex: /^pam_unix\(sshd:session\): session (closed|opened) for user (\S+)/,
            parts: [ 'state', 'user' ]
        },
        {
            name: 'postponed_connection',
            regex: /^Postponed (.+) for (\S+) from ((?:\d{1,3}\.){3}\d{1,3}) port (\d+) (\S+)/,
            parts: [ 'method', 'user', 'ip', 'port', 'protocol' ]
        },
        {
            name: 'received_disconnect',
            regex: /^Received disconnect from ((?:\d{1,3}\.){3}\d{1,3}): \d+: (.+)?(:? \[preauth\])/,
            parts: ['ip', 'reason']
        },
    ]

}

module.exports = SSHDCodec

SSHDCodec.prototype.decode = function (event, callback) {
    var message = event.data.message,
        parts = [],
        matched

    event.data.originalMessage = message
    event.data.sshd = {}

    this.regexes.some(function (group) {
        parts = group.regex.exec(message)
        if (parts) {
            matched = group
            return true
        }
    })

    if (!matched) {
        //TODO: It failed to parse
        return callback()
    }

    event.data.sshd.type = matched.name
    matched.parts.forEach(function (name, index) {
        event.data.sshd[name] = parts[index + 1]
    })

    callback()
}
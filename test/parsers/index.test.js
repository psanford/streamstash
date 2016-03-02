var StreamStash = require('../../'),
    assertParserResult = require('./util').assertParserResult,
    EventContainer = StreamStash.EventContainer

describe('parser helper wrapper', function () {

    it('Copy the data into event.data', function () {
        var event = new EventContainer({ message: '{"derp":"flerp","message":"hi"}' }),
            result = StreamStash.parsers.jsonParser(event)

        result.should.eql(true)
        event.data.should.eql({
            message: 'hi',
            derp: 'flerp'
        })

    })

    it('Should copy the original message if asked', function () {
        var event = new EventContainer({ message: '{"derp":"flerp","message":"hi"}' }),
            result = StreamStash.parsers.jsonParser(event, void 0, true)

        result.should.eql(true)
        event.data.should.eql({
            message: 'hi',
            derp: 'flerp',
            originalMessage: '{"derp":"flerp","message":"hi"}'
        })
    })

    it('Should set parseError and _type on error', function () {
        var event = new EventContainer({ message: '"derp":"flerp","message":"hi"}' }),
            result = StreamStash.parsers.jsonParser(event)

        result.should.eql(false)
        event.data.should.eql({
            message: '"derp":"flerp","message":"hi"}',
            _type: 'unparseable',
            parseError: 'SyntaxError: Unexpected token :'
        })
    })

    it('Should set parseError and the specified type property on error', function () {
        var event = new EventContainer({ message: '"derp":"flerp","message":"hi"}' }),
            result = StreamStash.parsers.jsonParser(event, 'customType')

        result.should.eql(false)
        event.data.should.eql({
            message: '"derp":"flerp","message":"hi"}',
            customType: 'unparseable',
            parseError: 'SyntaxError: Unexpected token :'
        })
    })

    it('Should not modify event.data if no data was parsed', function () {
        var event = new EventContainer({ message: '""' }),
            result = StreamStash.parsers.jsonParser(event)

        result.should.eql(true)
        event.data.should.eql({
            message: '""'
        })
    })

})

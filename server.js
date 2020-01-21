const net = require('net');
const server = net.createServer((socket) => {
    let oldBuffer = null;
    socket.on('data', function (buffer) {
        if (oldBuffer) {
            buffer = Buffer.concat([oldBuffer, buffer]);
        }

        let packageLength = 0;
        while (packageLength = checkComplete(buffer)) {
            const package = buffer.slice(0, packageLength);
            buffer = buffer.slice(packageLength);
            const result = decode(package);
            console.log(JSON.stringify(result))
            CMD_FN[result.cmd](result.data, result.seq, result.cmd,socket);
        }

        oldBuffer = buffer;
    })
    socket.on("error", function (e) {
        console.log(e)
    })

});
function send(data, seq, cmd,socket) {
    socket.write(
        encode(data, seq, cmd)
    );
}

server.listen(4000);

function encode(data, seq, cmd) {
    const body = Buffer.from(JSON.stringify(data))
    1
    const header = Buffer.alloc(8);
    header.writeInt16BE(seq);
    header.writeInt32BE(body.length, 2);
    header.writeInt16BE(cmd, 6);

    const buffer = Buffer.concat([header, body])

    return buffer;
}

function decode(buffer) {
    const header = buffer.slice(0, 8);
    const seq = header.readInt16BE();
    const cmd = header.readInt16BE(6);

    const body = JSON.parse(buffer.slice(8));

    return {
        seq,
        cmd,
        data: body
    }
}

function checkComplete(buffer) {
    if (buffer.length < 8) {
        return 0;
    }
    const bodyLength = buffer.readInt32BE(2);
    return 8 + bodyLength
}


playerCards = {};
lordCards = [];
playerCount = 3;
initCardCount = 17;``
lordCardCount = 3;

/**发牌 */
function responseSendCards(res, seq, cmd,socket) {
    let _playerServerSeat = 0;
    let _allCardsArr = [].slice.call(PokerValueArr);
    let _randomCards = _allCardsArr.sort(() => { return .5 - Math.random() });
    for (let i = 0; i < playerCount; i++) {
        playerCards[i] = _randomCards.slice(i * initCardCount, (i + 1) * initCardCount);
    }
    lordCards = PokerValueArr.slice(initCardCount * playerCount);
    let result = {
        serverSeat: _playerServerSeat,
        cards: playerCards[0]
    }
    // return result;
    send(result, seq, cmd,socket)
}
/**叫分 */
function responseJiaofen(res, seq, cmd,socket) {
    //暂时忽略叫分流程
    // send({}, seq, cmd,socket)
    cmdPutCards(res, seq, cmd,socket);
    // return {};
}
/**开始出牌 */
function cmdPutCards(res, seq, cmd,socket) {
    // console.log('[server.js:putCards] res.cards->',res.cards)
    send({}, seq, 3,socket)
    // return {msg:"startPuCards",};
}
function responsePutCards() {

}
PokerValueArr =
    [
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D,	//方块 A - K
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D,	//梅花 A - K
        0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D,	//红桃 A - K
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D,	//黑桃 A - K
        0x4E, 0x4F,
    ];

const CMD_FN = {
    1: responseSendCards,
    2: responseJiaofen,
    3: cmdPutCards,
    4: responsePutCards,
}

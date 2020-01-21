const net = require('net');
const { DZCardCheck } = require('./DZCardCheck.js')
const { ENUM_CMD_FN_SERVER } = require('./cmd_proto.js');
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
            handlerData(result, socket);
        }

        oldBuffer = buffer;
    })
    socket.on("error", function (e) {
        console.log(e)
    })
});
var mSocket;
function handlerData(result, socket) {
    mSocket = socket;
    CMD_FN[ENUM_CMD_FN_SERVER[result.cmd]](result.data, result.seq, result.cmd, socket)
}
function send(data, seq, cmd, socket) {
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

/**玩家手牌 */
playerCards = {};
/**地主抓牌 */
lordCards = [];
playerCount = 3;
initCardCount = 17;
lordCardCount = 3;

/**发牌 */
function responseSendCards(res, seq, cmd, socket) {
    let _playerServerSeat = 0;
    let _allCardsArr = [].slice.call(PokerValueArr);
    let _randomCards = _allCardsArr.sort(() => { return .5 - Math.random() });
    for (let i = 0; i < playerCount; i++) {
        playerCards[i] = _randomCards.slice(i * initCardCount, (i + 1) * initCardCount);
    }
    lordCards = _randomCards.slice(initCardCount * playerCount);
    playerCards[0] =playerCards[0].concat(lordCards); 
    let result = {
        serverSeat: _playerServerSeat,
        cards: playerCards[0]
    }
    send(result, seq, cmd, socket)
}
/**叫分 */
function responseJiaofen(res, seq, cmd, socket) {
    //暂时忽略叫分流程
    // send({}, seq, cmd,socket)
    cmdPutCards(res, seq, cmd, socket);
    // return {};
}
/**开始出牌 */
function cmdPutCards(res, seq, cmd, socket) {
    send({}, seq, 3, socket)
}
preCardsArr = [];
preCardsType = -1;
prePlayerSeat = -1;
function responsePutCards(res, seq, cmd, socket) {
    checkTurnIsOver(0);
    let _cardsStr = res.cards;
    if (_cardsStr === "") {
        send({ cards: [], seatNo: 0, handCards: [] }, -1, 234, socket);//pass
        setTimeout(robotPutCards, 500, ...[preCardsArr, ++res.seatNo, socket]);
        return;
    }
    let _cardsArr = _cardsStr.split(',').map((i)=>{return ~~i});
    let _isCanPut = false;
    let _curCardsType = -1;
    if (preCardsType === -1) {
        let _res = Object.keys(DZCardCheck.CheckCardType(_cardsArr, -1));
        if (_res.length != 0) {
            _curCardsType = ~~_res[0];
            _isCanPut = true;
        }
    } else {
        let _res = DZCardCheck.CheckCard(_cardsArr, preCardsArr, preCardsType);
        if (_res['isOK']) {
            _isCanPut = true;
            _curCardsType = ~~_res.cardsType[0];
        }
    }
    if (_isCanPut) {
        preCardsArr = _cardsArr.map((item) => { return ~~item });
        preCardsType = _curCardsType;
        prePlayerSeat = 0;
        let curPlayHandCards = rmPlayerCards(preCardsArr, 0);
        console.log()
        send({ cards: preCardsArr, seatNo: 0, handCards: curPlayHandCards }, seq, 4, socket);
        setTimeout(robotPutCards, 500, ...[preCardsArr, ++res.seatNo, socket]);
    }
    else send({ error: 'Error!! Cards rejected by rule.Please reChoose your cards.' }, seq, 233, socket)
}
function getSeat() {

}
function checkTurnIsOver(seat) {
    turnOver = prePlayerSeat === seat;
    if(turnOver){
        preCardsArr.length = 0;
        preCardsType = -1;
    }
}
var turnOver = true;
function robotPutCards(_preCardsArr, seatNo, socket) {
    if (seatNo > playerCount - 1) {
        seatNo =playerCount - 1;
        // seatNo = seatNo % playerCount;
        cmdPutCards({}, -1, -1, socket);
        return;
    }
    checkTurnIsOver(seatNo);
    let _robotCards = playerCards[seatNo];
    let _robotPutCards;
    //如果该机器人首先出牌，出第一张单牌
    if(preCardsType === -1){
        _robotPutCards = _robotCards[0];
        preCardsArr = _robotPutCards;
        send({ cards: [preCardsArr], seatNo: seatNo, handCards: [] }, -1, 4, socket);
    }else{
        _robotPutCards = DZCardCheck.HelpCard(_robotCards, _preCardsArr, preCardsType);
        if (_robotPutCards.length != 0) {
            preCardsArr = _robotPutCards;
            let curPlayHandCards = rmPlayerCards(preCardsArr, seatNo);
            preCardsType = ~~Object.keys(DZCardCheck.CheckCardType(_robotPutCards,-1))[0];
            prePlayerSeat = seatNo;
            send({ cards: preCardsArr, seatNo: seatNo, handCards: [] }, -1, 4, socket);
        } else {
            send({ cards: [], seatNo: seatNo, handCards: [] }, -1, 234, socket);//pass
        }
    }
    setTimeout(robotPutCards, 500, ...[preCardsArr, ++seatNo, socket]);
}
function initWhenGameOver() {
    preCardsArr.length = 0;
    preCardsType = -1;
    turnOver = true;
}
function rmPlayerCards(putCards, seatNo) {
    let _cardsArr = playerCards[seatNo];
    for(let i=0;i< putCards.length;i++){
        let item = putCards[i];
        let _idx = _cardsArr.indexOf(item);
        if(_idx != -1){
            _cardsArr.splice(_idx,1);
        }
    }
    if (_cardsArr.length === 0) {
        initWhenGameOver();
        send({ msg:"Game Over",seatNo:seatNo}, -1, 886, socket);//pass
    }
    return _cardsArr;
}
PokerValueArr =
    [
        0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D,	//方块 A - K
        0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1A, 0x1B, 0x1C, 0x1D,	//梅花 A - K
        0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x2B, 0x2C, 0x2D,	//红桃 A - K
        0x31, 0x32, 0x33, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3A, 0x3B, 0x3C, 0x3D,	//黑桃 A - K
        0x4E, 0x4F,
    ];

CMD_FN = {
    "responseSendCards": responseSendCards,
    "responseJiaofen": responseJiaofen,
    "cmdPutCards": cmdPutCards,
    "responsePutCards": responsePutCards
}

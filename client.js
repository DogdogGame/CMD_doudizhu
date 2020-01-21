const CMD_ID = [
    "0",
    "1",//"reqSendCards"
    "2",//"reqJiaofen"
    "3",//"inputPutCards"
    "4",//"commitPutCards"
    "5",
    "6"
]
const net = require('net');
const readlineSync = require('readline-sync');
// const {DZCardCheck} = require('./DZCardCheck');

const socket = new net.Socket({});

socket.connect({
    host: '127.0.0.1',
    port: 4000
});


let oldBuffer = null;
socket.on('data', (buffer) => {
    if (oldBuffer) {
        buffer = Buffer.concat([oldBuffer, buffer]);
    }
    let completeLength = 0;

    while (completeLength = checkComplete(buffer)) {
        const package = buffer.slice(0, completeLength);
        buffer = buffer.slice(completeLength);
        decode(package);
    }

    oldBuffer = buffer;
})


let seq = 0;
function encode(rawData) {
    const body = Buffer.from(JSON.stringify(rawData.data));
    const header = Buffer.alloc(8);
    header.writeUInt16BE(seq)
    header.writeUInt32BE(body.length, 2);
    header.writeUInt16BE(rawData.cmd, 6);
    const buffer = Buffer.concat([header, body])
    seq++;
    return buffer;
}
function decode(buffer) {
    const header = buffer.slice(0, 8);
    const seq = header.readInt16BE();
    const cmdNum = header.readInt16BE(6);
    const body = JSON.parse(buffer.slice(8));
    switch(cmdNum){
        case 1://发牌
            sendCards(body);
            break;
        case 2://叫分结果
            // putCards();
            break;
        case 3://出牌
            putCards();
            break;
        
    }
    // return {
    //     seq,
    //     cmdNum,
    //     data: JSON.parse(body) 
    // }
}
var myHandCardsOriginArr = [];
var myHandCardsShowArr = [];
function sendCards(body) {
    let _cards = body.cards.sort((a,b)=>{
        return getCardValue(a) - getCardValue(b)
    })
    myHandCardsOriginArr = _cards;
    myHandCardsShowArr = convert0x2h(_cards);
    console.log('发牌完毕,你的座位号为->', body.serverSeat, '你的手牌->',myHandCardsShowArr );
    console.log('开始叫分（输入1-3）：')
    const _score =  input2Cmd()
    console.log('叫了'+_score+"分");
    request({cmd: CMD_ID[2], data: { "msg": 'commitJiaofen' ,"score":_score} }); 
}
function input2Cmd() {
    return readlineSync.question();

}
/**转换为玩家认识的符号 */
function convert0x2h(cardsArr){
    let _res = [];
    for(let i =0,len = cardsArr.length;i<len;i++){
        let _card = cardsArr[i];
        _res.push(getCardName(_card));
    }
    return _res;
}
function checkComplete(buffer) {
    if (buffer.length < 8) {
        return 0;
    }
    const bodyLength = buffer.readInt32BE(2);
    return 8 + bodyLength
}
/**发送请求 */
function request(data) {
    socket.write(encode(data));
}
getCardName = function (cardSerialNo) {
    var resStr = -1;
    cardSerialNo = Number(cardSerialNo);
    resStr = cardSerialNo % 16;
    //大小王
    if (resStr == 14) {
        resStr = "sJoker";
    }
    else if (resStr == 15) {
        resStr = "bJoker";
    }
    //A,2
    else if (resStr == 1) {
        resStr = "A";
    }
    else if (resStr == 2) {
        resStr = "2";
    }
    else if(resStr == 11){
        resStr = 'J'
    }
    else if(resStr == 12){
        resStr = 'Q'
    }
    else if(resStr == 13){
        resStr = 'K'
    }
    return resStr+"";
};
getCardValue = function (cardSerialNo) {
    var resNum = -1;
    cardSerialNo = Number(cardSerialNo);
    resNum = cardSerialNo % 16;
    //大小王
    if (resNum == 14) {
        resNum = 16;
    }
    else if (resNum == 15) {
        resNum = 17;
    }
    //A,2
    else if (resNum == 1) {
        resNum = 14;
    }
    else if (resNum == 2) {
        resNum = 15;
    }
    return resNum;
};
function startGame() {
    request({ cmd: CMD_ID[1], data: { "msg": 'reqSendCards' } });
}
function putCards(){
    console.log('该你出牌')
    console.log('你的手牌->',myHandCardsShowArr.join(','))
    console.log('输入要出的牌（以，号隔开）：')
    let _cards = input2Cmd();
    request({cmd:CMD_ID[3],data:{'msg':'commitPutCards','cards':_cards}});
}
startGame();




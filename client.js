const net = require('net');
const readlineSync = require('readline-sync');
const {ENUM_CMD_FN_SERVER} = require('./cmd_proto.js');
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
        case 3://start 出牌
            putCards();
            break;
        case 4://res 出牌
            showPutCards(body);
            break;
        case 233://error 出牌不符合规则
            console.log(body.error);
            putCards();
            break;
        case 234://pass
            console.log('player '+ body.seatNo+"-> pass.");
            break;
        case 886://game over
            console.log('GameOver, you '+body.seatNo ===0?"Win":"Lose");
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
    let _cards = sortByVal(body.cards);
    myHandCardsOriginArr = _cards;
    console.log("sendCards:_cards->",body.cards)
    myHandCardsShowArr = convert0x2h(_cards);
    console.log('send cards complete,your seat NO is->', body.serverSeat, 'your cards->',myHandCardsShowArr.join(',') );
    console.log('start call score (input 1-3)：')
    const _score =  input2Cmd()
    console.log('has called '+_score);
    request({cmd: ENUM_CMD_FN_SERVER.responseJiaofen, data: { "msg": 'commitJiaofen' ,"score":_score} }); 
}
function sortByVal(arr){
    return arr.sort((a,b)=>{
        return getCardValue(a) - getCardValue(b)
    })
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
function convertH20x(cardsStr){
    let _res = "";
    if(!cardsStr) return '';
    let cardsArr = cardsStr.split(',');
    for(let i =0,len = cardsArr.length;i<len;i++){
        let _card = cardsArr[i];
        _res +=getCardSerial(_card)+",";
    }
    return _res.slice(0,_res.length-1);

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
    strSrialDic[resStr].push(cardSerialNo);
    return resStr+"";
};
getCardSerial = function (str) {
    try{
        return strSrialDic[str].pop()
    }catch(e){
        console.error('input error,please try again.');
    }
};
var strSrialDic = {
    "sJoker":[],
    "bJoker":[],
    "A":[],
    "K":[],
    'Q':[],
    'J':[],
    '10':[],
    '9':[],
    '8':[],
    '7':[],
    '6':[],
    '5':[],
    '4':[],
    '3':[],
    '2':[]
}
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
    request({ cmd: ENUM_CMD_FN_SERVER.responseSendCards, data: { "msg": 'reqSendCards' } });
}
function putCards(){
    console.log('Now, your turn')
    console.log('Your cards->',myHandCardsShowArr.join(','))
    console.log('Please input your cards to put :(split with ",", pass press Enter)')
    let _cards = convertH20x(input2Cmd());
    console.log("putCards-> _cards->",_cards);
    request({cmd:ENUM_CMD_FN_SERVER.responsePutCards,data:{'msg':'commitPutCards','cards':_cards,'seatNo':0}});
}
function showPutCards(res){
    console.log(JSON.stringify(res) )
    if(res.seatNo === 0){//更新自家手牌
        myHandCardsOriginArr =  res.handCards
        myHandCardsShowArr =  convert0x2h(sortByVal(res.handCards));
    }
    console.log('player '+res.seatNo+'->putCards->',convert0x2h(sortByVal(res.cards)).join(','));
}
startGame();




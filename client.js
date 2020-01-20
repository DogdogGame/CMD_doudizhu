const CMD_ID = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6"
]
const net = require('net');
const readlineSync = require('readline-sync');

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
    if (cmdNum === 1) {
        jiaoFen(body);
    }
    // return {
    //     seq,
    //     cmdNum,
    //     data: JSON.parse(body) 
    // }
}
function jiaoFen(body) {
    console.log('发牌完毕,你的座位号为->', body.serverSeat, '你的手牌->', body.cards);
    console.log('开始叫分（输入1-3）：')
    const _score =  input2Cmd()
    console.log('叫了'+_score+"分")

}
function input2Cmd() {
    return readlineSync.question();

}
function checkComplete(buffer) {
    if (buffer.length < 8) {
        return 0;
    }
    const bodyLength = buffer.readInt32BE(2);
    return 8 + bodyLength
}
function reqSendCards() {
    socket.write(encode({ cmd: CMD_ID[0], data: { "msg": 'test' } }));
}
function startGame() {
    reqSendCards();
}
startGame();




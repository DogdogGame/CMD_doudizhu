ENUM_CMD_FN_SERVER =
(function (ENUM_CMD_FN) {
    ENUM_CMD_FN[ENUM_CMD_FN["responseSendCards"] = 1] = "responseSendCards";
    ENUM_CMD_FN[ENUM_CMD_FN["responseJiaofen"] = 2] = "responseJiaofen";
    ENUM_CMD_FN[ENUM_CMD_FN["cmdPutCards"] = 3] = "cmdPutCards";
    ENUM_CMD_FN[ENUM_CMD_FN["responsePutCards"] = 4] = "responsePutCards";
    return ENUM_CMD_FN;
})({});
ENUM_CMD_FN_CLIENT =
(function (ENUM_CMD_FN) {
    ENUM_CMD_FN[ENUM_CMD_FN["responseSendCards"] = 1] = "responseSendCards";
    ENUM_CMD_FN[ENUM_CMD_FN["responseJiaofen"] = 2] = "responseJiaofen";
    ENUM_CMD_FN[ENUM_CMD_FN["cmdPutCards"] = 3] = "cmdPutCards";
    ENUM_CMD_FN[ENUM_CMD_FN["responsePutCards"] = 4] = "responsePutCards";
    return ENUM_CMD_FN;
})({});

module.exports =  {ENUM_CMD_FN_SERVER,ENUM_CMD_FN_CLIENT}
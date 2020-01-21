var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var DZCardCheck = /** @class */ (function () {
    function DZCardCheck() {
    }
    DZCardCheck.getCardValue = function (cardSerialNo) {
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
    /**
     * 检测选牌是否可出（是否合法牌型，是否大于上家出牌）
     ** cardListArr 当前玩家的手牌数组
     ** pcardListArr 上一次帮助选择出来的牌
     ** cardsType 上一次(上家)的出牌类型
     ** handCardsCount 当前手牌数量
     * @returns 牌的数组
     * */
    DZCardCheck.CheckCard = function (cardListArr, pcardListArr, cardsType, handCardsCount) {
        // stf.DdzUtils.showLog("进入牌型检测函数：---cardListArr----", cardListArr, "pcardListArr-----", pcardListArr, "cardsType--------", cardsType);
        var result = { isOK: false, cardsType: [] };
        //检测牌型
        var mcardsTypeObj = DZCardCheck.CheckCardType(cardListArr, cardsType);
        // stf.DdzUtils.showLog("牌型检测结果----", mcardsTypeObj);
        var cardsTypeArr = Object.keys(mcardsTypeObj);
        cardsTypeArr = this.getNumberArray(cardsTypeArr.join(","));
        if (cardsTypeArr.length == 0)
            return result;
        // stf.DdzUtils.showLog("cardsTypeArr---", cardsTypeArr);
        var mcardsType = cardsTypeArr[0]; //牌型唯一
        //火箭
        if (mcardsType == DZCardType.CT_MISSILE_CARD || (mcardsType == DZCardType.CT_BOMB_CARD && cardsType < DZCardType.CT_BOMB_CARD)) {
            result["isOK"] = true;
            result["cardsType"] = [mcardsType];
            return result;
        }
        // else if(mcardsType == DZCardType.CT_BOMB_CARD && cardsType< DZCardType.CT_BOMB_CARD){
        // }
        if (cardsType == mcardsType || cardsType == -1) {
            if (cardsType == -1 || DZCardCheck.isCardGreater(cardListArr, pcardListArr, cardsType)) {
                // stf.DdzUtils.showLog("主动出牌或相同牌型进行比较---cardListArr----", cardListArr, "pcardListArr----", pcardListArr, "cardsType----", cardsType);
                result["isOK"] = true;
                result["cardsType"] = [mcardsType];
            }
        }
        return result;
    };
    /**
     * 对应的数量的值的下标
     */
    DZCardCheck.countIndexForValueList = function (valueList, Count) {
        var index = -1;
        var itemList;
        for (var i = 0; i < valueList.length; i++) {
            itemList = valueList[i];
            if (itemList != null && itemList.length == Count) {
                index = i;
                break;
            }
        }
        return index;
    };
    DZCardCheck.isCardGreater = function (cardList, pcardList, cardsType) {
        if (cardList.length != pcardList.length)
            return false;
        if (pcardList.length == 0)
            return true;
        if (DZCardType.CT_SINGLE == cardsType || DZCardType.CT_DOUBLE == cardsType ||
            DZCardType.CT_THREE == cardsType) {
            if (this.getCardValue(cardList[0]) > this.getCardValue(pcardList[0]))
                return true;
        }
        else if (DZCardType.CT_SINGLE_LINE == cardsType) {
            if (DZCardCheck.getCardMaxValue(cardList, 1) > DZCardCheck.getCardMaxValue(pcardList, 1)) {
                return true;
            }
        }
        else if (DZCardType.CT_DOUBLE_LINE == cardsType) {
            if (DZCardCheck.getCardMaxValue(cardList, 2) > DZCardCheck.getCardMaxValue(pcardList, 2)) {
                return true;
            }
        }
        else if (DZCardType.CT_THREE_LINE == cardsType) {
            if (DZCardCheck.getMainValueOfPlane(cardList, 3) > DZCardCheck.getMainValueOfPlane(pcardList, 3)) {
                return true;
            }
        }
        else if (DZCardType.CT_FOUR_TAKE_ONE == cardsType || DZCardType.CT_FOUR_TAKE_TWO == cardsType || DZCardType.CT_BOMB_CARD == cardsType) {
            if (DZCardCheck.getCardMaxValue(cardList, 4) > DZCardCheck.getCardMaxValue(pcardList, 4)) {
                return true;
            }
        }
        else if (DZCardType.CT_THREE_TAKE_ONE == cardsType || DZCardType.CT_THREE_TAKE_TWO == cardsType) {
            if (DZCardCheck.getCardMaxValue(cardList, 3) > DZCardCheck.getCardMaxValue(pcardList, 3)) {
                return true;
            }
        }
        return false;
    };
    /**检测牌型
     * @param cardsType -1 时为本家主动出牌
     */
    DZCardCheck.CheckCardType = function (cardList1, cardsType) {
        var cardList = __spreadArrays(cardList1);
        var resObj = {};
        var tempRes = {};
        var valueList = DZCardCheck.getCardValueArray(cardList);
        if (DZCardCheck.isRocket(cardList)) { //火箭
            // stf.DdzUtils.showLog("火箭成功");
            resObj[DZCardType.CT_MISSILE_CARD] = true;
            return resObj;
        }
        if (DZCardCheck.isBomb(cardList)) { //炸弹
            // stf.DdzUtils.showLog("炸弹成功");
            resObj[DZCardType.CT_BOMB_CARD] = true;
            return resObj;
        }
        if (cardsType == DZCardType.CT_FOUR_TAKE_ONE || cardsType == -1) {
            tempRes = DZCardCheck.isFour_TwoSingle(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_FOUR_TAKE_ONE] = { speSerialArr: tempRes["speSerialArr"], typeName: "四带两单" };
            }
        }
        if (cardsType == DZCardType.CT_FOUR_TAKE_TWO || cardsType == -1) {
            tempRes = DZCardCheck.isFour_TwoPair(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_FOUR_TAKE_TWO] = { speSerialArr: tempRes["speSerialArr"], typeName: "四带两对" };
            }
        }
        if (cardsType == DZCardType.CT_SINGLE || cardsType == -1) {
            tempRes = DZCardCheck.isSingle(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_SINGLE] = { speSerialArr: tempRes["speSerialArr"] };
                return resObj;
            }
        }
        if (cardsType == DZCardType.CT_DOUBLE || cardsType == -1) {
            tempRes = DZCardCheck.isPair(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_DOUBLE] = { speSerialArr: tempRes["speSerialArr"] };
                return resObj;
            }
        }
        if ((cardsType == DZCardType.CT_THREE || cardsType == -1)) {
            tempRes = DZCardCheck.isThree(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_THREE] = { speSerialArr: tempRes["speSerialArr"] };
            }
        }
        if ((cardsType == DZCardType.CT_THREE_TAKE_ONE || cardsType == -1)) {
            tempRes = DZCardCheck.isThree_One(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_THREE_TAKE_ONE] = { speSerialArr: tempRes["speSerialArr"], doubiChooseArr: tempRes["doubiArr"], typeName: "三带一" };
            }
        }
        if (cardsType == DZCardType.CT_THREE_TAKE_TWO || cardsType == -1) {
            tempRes = DZCardCheck.isThree_Pair(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_THREE_TAKE_TWO] = { speSerialArr: tempRes["speSerialArr"], typeName: "三带对" };
            }
        }
        if (cardsType == DZCardType.CT_SINGLE_LINE || cardsType == -1) {
            tempRes = DZCardCheck.isOrder(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_SINGLE_LINE] = { speSerialArr: tempRes["speSerialArr"], typeName: "顺子" };
            }
        }
        if (cardsType == DZCardType.CT_DOUBLE_LINE || cardsType == -1) {
            tempRes = DZCardCheck.isDouble_Order(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_DOUBLE_LINE] = { speSerialArr: tempRes["speSerialArr"], typeName: "双顺" };
            }
        }
        if (cardsType == DZCardType.CT_THREE_LINE || cardsType == -1) {
            tempRes = DZCardCheck.isThree_Order(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_THREE_LINE] = { speSerialArr: tempRes["speSerialArr"], typeName: "飞机" };
            }
        }
        if (cardsType == DZCardType.CT_THREE_LINE || cardsType == -1) {
            tempRes = DZCardCheck.isThree_Order_Take_One(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_THREE_LINE] = { speSerialArr: tempRes["speSerialArr"], typeName: "飞机带单" };
            }
        }
        if (cardsType == DZCardType.CT_THREE_LINE || cardsType == -1) {
            tempRes = DZCardCheck.isThree_Order_Take_Pair(cardList);
            if (tempRes["isOK"]) {
                resObj[DZCardType.CT_THREE_LINE] = { speSerialArr: tempRes["speSerialArr"], typeName: "飞机带对" };
            }
        }
        // if (cardsType == DZCardType.DealCardType_SI_FEI_JI_DAI_ER || cardsType == -1) {
        //     tempRes = DZCardCheck.isFour_Order_TwoSingle(cardList);
        //     if (tempRes["isOK"]) {
        //         resObj[DZCardType.DealCardType_SI_FEI_JI_DAI_ER] = { speSerialArr: tempRes["speSerialArr"], typeName: "四带两单" };
        //     }
        // }
        return resObj;
    };
    DZCardCheck.isSingle = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        if (cardList.length == 1) {
            resObj["isOK"] = true;
        }
        return resObj;
    };
    DZCardCheck.isPair = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        if (cardList.length == 2) {
            var valueArrObj = DZCardCheck.getCardValueArray(cardList);
            var objKeysArr = Object.keys(valueArrObj);
            if (objKeysArr.length == 1 && DZCardCheck.getCardValue(cardList[0]) < 16) {
                resObj["isOK"] = true;
            }
        }
        return resObj;
    };
    DZCardCheck.isOrder = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        if (cardList.length < 5)
            return resObj;
        var valueArrObj = DZCardCheck.getCardValueArray(cardList);
        var objKeysArr = Object.keys(valueArrObj);
        var count = DZCardCheck.getValueOrderCount(valueArrObj, 1);
        if (count >= 5 && count == cardList.length)
            resObj["isOK"] = true;
        if (!resObj["isOK"] && resObj["speSerialArr"].length != 0)
            resObj["isOK"] = true;
        return resObj;
    };
    DZCardCheck.isDouble_Order = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        if (cardList.length >= 6 && cardList.length % 2 == 0) {
            var valueArrObj = DZCardCheck.getCardValueArray(cardList);
            var objKeysArr = Object.keys(valueArrObj);
            var count = DZCardCheck.getValueOrderCount(valueArrObj, 2);
            if (count >= 2 && count * 2 == cardList.length)
                resObj["isOK"] = true;
        }
        if (!resObj["isOK"] && resObj["speSerialArr"].length != 0)
            resObj["isOK"] = true;
        return resObj;
    };
    DZCardCheck.isThree_Order = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        if (cardList.length >= 6 && cardList.length % 3 == 0) {
            var valueArrObj = DZCardCheck.getCardValueArray(cardList);
            var objKeysArr = Object.keys(valueArrObj);
            var count = DZCardCheck.getValueOrderCount(valueArrObj, 3);
            if (count == cardList.length / 3)
                resObj["isOK"] = true;
        }
        if (!resObj["isOK"] && resObj["speSerialArr"].length != 0)
            resObj["isOK"] = true;
        return resObj;
    };
    DZCardCheck.isThree_Order_Take_One = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        var len = cardList.length;
        if (cardList.length >= 8 && cardList.length % 4 == 0) {
            var valueArrObj = DZCardCheck.getCardValueArray(cardList);
            var objKeysArr = Object.keys(valueArrObj);
            var count = DZCardCheck.getValueOrderCount(valueArrObj, 3);
            // if (count * 4 == len) {
            if (count * 4 == len && DZCardCheck.findBomb(cardList, valueArrObj).length == 0) {
                resObj["isOK"] = true;
            }
            else {
                for (var i = count - 1; i > 1; i--) {
                    if (i * 4 == len) {
                        resObj["isOK"] = true;
                    }
                }
            }
        }
        if (!resObj["isOK"] && resObj["speSerialArr"].length != 0)
            resObj["isOK"] = true;
        return resObj;
    };
    DZCardCheck.isThree_Order_Take_Pair = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        var len = cardList.length;
        if (cardList.length >= 10 && cardList.length % 5 == 0) {
            var valueArrObj = DZCardCheck.getCardValueArray(cardList);
            var objKeysArr = Object.keys(valueArrObj);
            // if (!this.hasnoOtherCountValue(valueArrObj, 3, 2, DZCardType.CT_THREE_LINE)) return resObj;
            // let count = DZCardCheck.getValueOrderCount(valueArrObj, 3);
            //======== 三飞带对可带炸弹 begin ===============
            var _threeCount = 0;
            var _twoCount = 0;
            // let _bombCount: number = 0;
            for (var i in valueArrObj) {
                var _item = valueArrObj[i];
                var _len = _item.length;
                // if (_len === 4)++_bombCount;
                // else 
                if (_len === 3)
                    ++_threeCount;
                else if (_len === 2)
                    ++_twoCount;
            }
            // if (_bombCount * 2 === _threeCount) resObj["isOK"] = true;
            // else 
            if (_twoCount === _threeCount && _threeCount != 0)
                resObj["isOK"] = true;
            //======== 三飞带对可带炸弹 end ===============
        }
        if (!resObj["isOK"] && resObj["speSerialArr"].length != 0)
            resObj["isOK"] = true;
        return resObj;
    };
    DZCardCheck.isFour_Order_TwoSingle = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        var len = cardList.length;
        if (cardList.length >= 12 && cardList.length % 6 == 0) {
            var valueArrObj = DZCardCheck.getCardValueArray(cardList);
            var objKeysArr = Object.keys(valueArrObj);
            var count = DZCardCheck.getValueOrderCount(valueArrObj, 4);
            if (count * 6 == len) {
                resObj["isOK"] = true;
            }
            else {
                for (var i = count - 1; i > 1; i--) {
                    if (i * 6 == len) {
                        resObj["isOK"] = true;
                    }
                }
            }
        }
        if (!resObj["isOK"] && resObj["speSerialArr"].length != 0)
            resObj["isOK"] = true;
        return resObj;
    };
    DZCardCheck.isThree = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        if (cardList.length == 3) {
            var valueArrObj = DZCardCheck.getCardValueArray(cardList);
            var objKeysArr = Object.keys(valueArrObj);
            if (objKeysArr.length == 1) {
                resObj["isOK"] = true;
            }
        }
        return resObj;
    };
    DZCardCheck.isThree_One = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        if (cardList.length != 4)
            return false;
        var valueArrObj = DZCardCheck.getCardValueArray(cardList);
        var objKeysArr = Object.keys(valueArrObj);
        if (objKeysArr.length == 2) {
            objKeysArr.forEach(function (item) {
                if (valueArrObj[item].length == 3) {
                    resObj["isOK"] = true;
                }
            });
        }
        return resObj;
    };
    DZCardCheck.isThree_Pair = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        if (cardList.length != 5)
            return resObj;
        var valueArrObj = DZCardCheck.getCardValueArray(cardList);
        var objKeysArr = Object.keys(valueArrObj);
        if (objKeysArr.length == 2) {
            var threeArr_1 = [], twoArr_1 = [];
            objKeysArr.forEach(function (item) {
                if (valueArrObj[item].length == 3) {
                    threeArr_1 = valueArrObj[item];
                }
                if (valueArrObj[item].length == 2) {
                    twoArr_1 = valueArrObj[item];
                }
            });
            if (threeArr_1.length != 0 && twoArr_1.length != 0 && !this.hasJoker(twoArr_1))
                resObj["isOK"] = true;
        }
        return resObj;
    };
    DZCardCheck.isBomb = function (cardList) {
        var valueObj = DZCardCheck.getCardValueArray(cardList);
        if (cardList.length != 4)
            return false;
        if (valueObj[DZCardCheck.getCardValue(cardList[0])].length == 4)
            return true;
    };
    DZCardCheck.isRocket = function (cardList) {
        if (cardList.length == 2) {
            if ((DZCardCheck.getCardValue(cardList[0]) == 16 && DZCardCheck.getCardValue(cardList[1]) == 17) || (DZCardCheck.getCardValue(cardList[0]) == 17 && DZCardCheck.getCardValue(cardList[1]) == 16)) {
                return true;
            }
        }
        return false;
    };
    DZCardCheck.isFour_TwoSingle = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        resObj["speSerialArr"] = [];
        // if (cardList.length != 6 || DZCardCheck.hasSpecialCard(cardList) > 1) {
        if (cardList.length != 6) {
            return false;
        }
        var cardList1 = new Array();
        cardList1 = __spreadArrays(cardList);
        var valueList = DZCardCheck.getCardValueArray(cardList1);
        if (DZCardCheck.getValueMax(valueList, 4)) {
            for (var i in valueList) {
                if (valueList[i].length == 4) {
                    delete valueList[DZCardCheck.getCardValue(valueList[i][0])];
                    break;
                }
            }
            var arrArr = this.getArrArr(valueList);
            if (arrArr.length == 1 && arrArr[0].length == 2) { //带对子
                var value = DZCardCheck.getCardValue(arrArr[0][0]);
                if (value != 16 && value != 17) {
                    resObj["isOK"] = true;
                }
            }
            else if (arrArr.length == 2) { //带两单
                resObj["isOK"] = true;
            }
        }
        return resObj;
    };
    DZCardCheck.isFour_TwoPair = function (cardList) {
        var resObj = {};
        resObj["isOK"] = false;
        if (cardList.length != 8 || this.hasJoker(cardList)) {
            return resObj;
        }
        var valueList;
        var cardList1 = new Array();
        cardList1 = __spreadArrays(cardList);
        valueList = DZCardCheck.getCardValueArray(cardList1);
        //======== 两个炸弹也能出 begin ===========
        /*  let _isTwoBomb: boolean = true;
         for (let key in valueList) {
             let _item = valueList[key];
             if (_item.length != 4) _isTwoBomb = false;
         }
         if (_isTwoBomb) {
             resObj["isOK"] = true;
             return resObj
         } */
        //======== 两个炸弹也能出 end ===========
        if (DZCardCheck.getValueMax(valueList, 4)) {
            for (var i in valueList) {
                if (valueList[i].length == 4) {
                    delete valueList[DZCardCheck.getCardValue(valueList[i][0])];
                    break;
                }
            }
            var arrArr = this.getArrArr(valueList);
            if (arrArr.length == 2 && arrArr[0].length == 2 && arrArr[1].length == 2) {
                var value = DZCardCheck.getCardValue(arrArr[0][0]);
                if (value != 16 && value != 17) {
                    resObj["isOK"] = true;
                }
            }
        }
        return resObj;
    };
    /**获取cardList<serialNo> */
    DZCardCheck.getCardListFromValueArrObj = function (valueArrObj) {
        var resArr = [];
        for (var i in valueArrObj) {
            resArr = resArr.concat(valueArrObj[i]);
        }
        return resArr;
    };
    /**
     * 获取对应数量的牌的数组的数组
     */
    DZCardCheck.getArrayofNum = function (valueList, cardNum) {
        var resArr = [];
        for (var item in valueList) {
            if (valueList[item].length == cardNum) {
                resArr.push(valueList[item]);
            }
        }
        return resArr;
    };
    DZCardCheck.getValueArrOfNum = function (valueList, cardNum) {
        var arr = DZCardCheck.getArrayofNum(valueList, cardNum);
        var resArr = [];
        for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
            var i = arr_1[_i];
            resArr.push(DZCardCheck.getCardValue(i[0]));
        }
        return resArr;
    };
    DZCardCheck.getCountofArrNum = function (valueList, cardNum) {
        var res = 0;
        for (var item in valueList) {
            if (valueList[item].length == cardNum) {
                res++;
            }
        }
        return res;
    };
    /**
     * 获取对应数量的值的key值的数组
     */
    DZCardCheck.getIndexArrayOfNum = function (valueList, cardNum) {
        var indexArr = new Array();
        for (var i in valueList) {
            if (valueList[i].length == cardNum) {
                indexArr.push(i);
            }
        }
        return indexArr;
    };
    /**
     * 获取非空valueList，并取值的数组
     */
    DZCardCheck.getPureValueArr = function (valueList) {
        var arrValueList = new Array();
        var arrPureValueList = new Array();
        for (var i in valueList) {
            if (valueList[i] != null) {
                arrValueList.push(valueList[i]);
            }
        }
        for (var k = 0, len = arrValueList.length; k < len; k++) {
            arrPureValueList.push(DZCardCheck.getCardValue(arrValueList[k][0]));
        }
        return arrPureValueList;
    };
    /**获取对应数量的牌的最大值*/
    DZCardCheck.getCardMaxValue = function (cardList, cardNum) {
        var valueList = DZCardCheck.getCardValueArray(cardList);
        var maxValue = 99;
        for (var i in valueList) {
            var itemList = valueList[i];
            if (itemList != null && itemList.length == cardNum) {
                if (this.getCardValue(itemList[0]) > maxValue || maxValue == 99) {
                    maxValue = this.getCardValue(itemList[0]);
                }
            }
        }
        return maxValue;
    };
    /**获取对应数量的牌的最大值的serialNo*/
    DZCardCheck.getCardMaxSerialNo = function (cardList, cardNum) {
        var valueList = DZCardCheck.getCardValueArray(cardList);
        var maxSerialNo = 999;
        for (var i in valueList) {
            var itemList = valueList[i];
            if (itemList != null && itemList.length == cardNum) {
                if (itemList[0] > maxSerialNo || maxSerialNo == 999) {
                    // maxSerialNo = this.getCardValue(itemList[0]);
                    maxSerialNo = itemList[0];
                }
            }
        }
        return maxSerialNo;
    };
    DZCardCheck.getValueCount = function (valueList, cardNum) {
        var count = 0;
        for (var i in valueList) {
            var itemList = valueList[i];
            if (itemList != null && itemList.length == cardNum) {
                count++;
            }
        }
        return count;
    };
    DZCardCheck.getValueMaxAndMin = function (valueList, maxNum, minNum) {
        var maxFlags = false;
        var minFlags = false;
        for (var i = 0; i < valueList.length; i++) {
            if (valueList[i] != null) {
                var itemList = valueList[i];
                if (itemList != null && itemList.length == maxNum) {
                    maxFlags = true;
                }
                else if (itemList != null && itemList.length == minNum) {
                    minFlags = true;
                }
            }
        }
        return maxFlags && minFlags;
    };
    /**
     * 检测是否包含对应长度的同值牌
     *  */
    DZCardCheck.getValueMax = function (valueList, maxNum) {
        for (var i in valueList) {
            var itemList = valueList[i];
            if (itemList != null && itemList.length == maxNum) {
                return true;
            }
        }
        return false;
    };
    /**从选牌中提出顺子 */
    DZCardCheck.getOrderFromSelected = function (serialArr) {
        var resArr = [];
        var valueObj = DZCardCheck.getCardValueArray(serialArr);
        var valueArr = [];
        for (var i in valueObj) {
            valueArr.push(parseInt(i));
        }
        var lastValue = -1;
        var orderValueArr = [];
        for (var j = 0, len = valueArr.length; j < len; j++) {
            if (lastValue == -1) {
                lastValue = valueArr[j];
                orderValueArr.push(valueArr[j]);
            }
            else {
                if (lastValue + 1 != valueArr[j] && orderValueArr.length < 3) {
                    orderValueArr.length = 0;
                    lastValue = valueArr[j];
                    orderValueArr.push(valueArr[j]);
                }
                else if (lastValue + 1 == valueArr[j]) {
                    orderValueArr.push(valueArr[j]);
                    lastValue = valueArr[j];
                }
            }
        }
        //排除2和王
        for (var i = 0, len = orderValueArr.length; i < len; i++) {
            if (orderValueArr[i] >= 16 || orderValueArr[i] == 15) {
                orderValueArr.splice(i, 1);
                i--;
            }
        }
        if (orderValueArr.length >= 3) {
            for (var k = 0, len = orderValueArr.length; k < len; k++) {
                resArr.push(valueObj[orderValueArr[k]][0]);
            }
        }
        return resArr;
    };
    /**连牌数量 */
    DZCardCheck.getValueOrderCount = function (valueList, cardNum) {
        var count = 0;
        var oldCardValue = 0;
        for (var i in valueList) {
            var itemList = valueList[i];
            if (itemList != null && itemList.length >= cardNum) {
                if (count == 0) {
                    oldCardValue = Number(i);
                    count++;
                }
                else {
                    if (this.hasJoker(itemList) || this.getCardValue(itemList[0]) == 15)
                        break;
                    if (oldCardValue + 1 == Number(i)) {
                        oldCardValue = Number(i);
                        count++;
                    }
                    // 三（四）飞机带三张（两对）不带癞子牌的飞机带单判断
                    else if (count == 1) {
                        oldCardValue = Number(i);
                        // count = 1;
                    }
                    else {
                        break;
                    }
                    //
                }
            }
        }
        return count;
    };
    /**已确定牌型后，飞机主牌值确定 */
    DZCardCheck.getMainValueOfPlane = function (cardList, cardNum) {
        var valueList = DZCardCheck.getCardValueArray(cardList);
        var count = 0;
        var oldCardValue = 0;
        for (var i in valueList) {
            var itemList = valueList[i];
            if (itemList != null && itemList.length == cardNum) {
                if (count == 0) {
                    oldCardValue = Number(i);
                    count++;
                }
                else {
                    if (this.hasJoker(itemList) || this.getCardValue(itemList[0]) == 15)
                        break;
                    if (oldCardValue + 1 == Number(i)) {
                        oldCardValue = Number(i);
                        count++;
                    }
                    // 三（四）飞机带三张（两对）不带癞子牌的飞机带单判断
                    else if (count == 1) {
                        oldCardValue = Number(i);
                        // count = 1;
                    }
                    else {
                        break;
                    }
                    //
                }
            }
        }
        return oldCardValue;
    };
    //牌组转换成字符串
    DZCardCheck.getStrbyCardsList = function (cardList) {
        var resStr = "";
        if (cardList.length != 0) {
            if (cardList[0] != null) {
                for (var i = 0, len = cardList.length; i < len; i++) {
                    var str = cardList[i]['serialNo'].toString();
                    resStr += str + ",";
                }
            }
        }
        var res = resStr.slice(0, resStr.length - 1);
        return res;
    };
    /**获取value对应的serialNo数组 */
    DZCardCheck.getCardValueArray = function (cardList) {
        var res = {};
        cardList.forEach(function (item) {
            var value = DZCardCheck.getCardValue(item);
            if (value != 0) {
                if (res[value] == null) {
                    res[value] = [item];
                }
                else {
                    res[value].push(item);
                }
            }
        });
        return res;
    };
    /**深拷贝对象 */
    DZCardCheck.getCopyObj = function (obj1, obj2) {
        if (obj2 === void 0) { obj2 = {}; }
        // let keysArr = Object.keys(obj1);
        for (var objItem in obj1) {
            // if(obj1.hasOwnProperty(objItem)){
            if (typeof obj1[objItem] === "object") {
                obj2[objItem] = (obj1[objItem].constructor === Array) ? [] : {};
                if (obj1[objItem])
                    DZCardCheck.getCopyObj(obj1[objItem], obj2[objItem]);
            }
            else {
                obj2[objItem] = obj1[objItem];
            }
            // };
        }
        return obj2;
    };
    DZCardCheck.getCardListFromValueArr = function (valueArr1) {
        var valueArr = this.getCopyObj(valueArr1);
        var resArr = [];
        for (var i in valueArr) {
            var len = valueArr[i].length;
            if (len >= 3) {
                for (var j = 0; j < len; j++) {
                    resArr.push(valueArr[i][j]);
                }
                delete valueArr[i];
            }
        }
        // resArr = resArr.sort((a, b) => { return b - a });
        for (var i in valueArr) {
            var len = valueArr[i].length;
            for (var j = 0; j < len; j++) {
                resArr.push(valueArr[i][j]);
            }
        }
        return resArr;
    };
    DZCardCheck.getCardValueObj = function (cardList) {
        var res = {};
        cardList.forEach(function (item) {
            if (res[item] == null)
                res[item] = 1;
            else
                res[item]++;
        });
        return res;
    };
    /**order牌型排序*/
    DZCardCheck.getNormalOrder = function (cardList) {
        var valueListForRes = DZCardCheck.getCardValueArray(cardList);
        var resArr = new Array();
        var resArr1 = new Array();
        var resArr2 = new Array();
        for (var i in valueListForRes) {
            if (valueListForRes[i].length >= 3) {
                if (resArr1.length == 0) {
                    // resArr1 = DZCardCheck.getStrbyCardsList(valueListForRes[i]).split(",");
                    resArr1 = valueListForRes[i];
                }
                else {
                    // let tempArr: Array<number> = DZCardCheck.getStrbyCardsList(valueListForRes[i]).split(",")
                    var tempArr = valueListForRes[i];
                    resArr1 = resArr1.concat(tempArr);
                }
            }
            else {
                if (resArr2.length == 0) {
                    // resArr2 = DZCardCheck.getStrbyCardsList(valueListForRes[i]).split(",");
                    resArr2 = valueListForRes[i];
                }
                else {
                    // let tempArr: Array<number> = DZCardCheck.getStrbyCardsList(valueListForRes[i]).split(",")
                    var tempArr = valueListForRes[i];
                    resArr2 = resArr2.concat(tempArr);
                }
            }
        }
        /* if (resArr1.length == 2 && resArr2.length == 4) {
             resArr = resArr2.concat(resArr1);
             return resArr;
         }*/
        resArr = resArr1.concat(resArr2);
        return resArr;
    };
    DZCardCheck.shiftNeedlessCardsForPureThreeFly = function (valueList, cardNum) {
        if (cardNum === void 0) { cardNum = 3; }
        var count = 0;
        var oldCardValue = 0;
        var valueListRes = new Array();
        for (var i in valueList) {
            if (valueList[i] != null) {
                var itemList = valueList[i];
                if (itemList != null && itemList.length >= cardNum) { //炸弹可做飞机
                    valueListRes.push(itemList.slice(0, cardNum));
                }
            }
        }
        for (var i = 0; i < valueListRes.length; i++) {
            if (i == 0) {
                if (DZCardCheck.getCardValue(valueListRes[i][0]) + 1 != DZCardCheck.getCardValue(valueListRes[i + 1][0])) {
                    valueListRes.splice(i, 1);
                }
            }
            else if (i == valueListRes.length - 1) {
                if (DZCardCheck.getCardValue(valueListRes[i][0]) - 1 != DZCardCheck.getCardValue(valueListRes[i - 1][0])) {
                    valueListRes.splice(i, 1);
                }
            }
        }
        var res = [];
        for (var j = 0, len = valueListRes.length; j < len; j++) {
            var tempItem = valueListRes[j];
            tempItem.forEach(function (item) {
                res.push(item);
            });
        }
        return res;
    };
    DZCardCheck.shiftNeedlessCardsForPureThree = function (valueList, cardNum) {
        if (cardNum === void 0) { cardNum = 3; }
        var valueListRes = new Array();
        for (var i in valueList) {
            if (valueList[i] != null) {
                var itemList = valueList[i];
                // if (itemList != null && itemList.length >= cardNum) {//炸弹可做飞机
                if (itemList != null && itemList.length >= cardNum) {
                    valueListRes = itemList.slice(0, cardNum);
                }
            }
        }
        return valueListRes;
    };
    DZCardCheck.shiftNeedlessCardsForPureFour = function (valueList, cardNum) {
        if (cardNum === void 0) { cardNum = 4; }
        var valueListRes = new Array();
        for (var i in valueList) {
            if (valueList[i] != null) {
                var itemList = valueList[i];
                // if (itemList != null && itemList.length >= cardNum) {//炸弹可做飞机
                if (itemList != null && itemList.length >= cardNum) {
                    valueListRes = itemList.slice(0, cardNum);
                }
            }
        }
        return valueListRes;
    };
    /**带牌类型去带牌 */
    DZCardCheck.getAllWithTypePureArr = function (cardsArr, type) {
        var valueList = DZCardCheck.getCardValueArray(cardsArr);
        var resArr = [];
        switch (type) {
            case DZCardType.CT_THREE_TAKE_ONE:
            case DZCardType.CT_THREE_TAKE_TWO:
                resArr = DZCardCheck.shiftNeedlessCardsForPureThree(valueList);
                break;
            case DZCardType.CT_FOUR_TAKE_ONE:
            case DZCardType.CT_FOUR_TAKE_TWO:
                resArr = DZCardCheck.shiftNeedlessCardsForPureFour(valueList);
                break;
            case DZCardType.CT_THREE_LINE:
                resArr = DZCardCheck.shiftNeedlessCardsForPureThreeFly(valueList);
                break;
            // case DZCardType.DealCardType_SI_FEI_JI_DAI_ER:
            //     resArr = DZCardCheck.shiftNeedlessCardsForPureThreeFly(valueList, 4);
            //     break;
        }
        return resArr;
    };
    /**将字符串数组转换成数字数组 */
    DZCardCheck.getNumberArray = function (str) {
        var resArr = [];
        if (str == "")
            return resArr;
        var arr = str.split(",");
        for (var i = 0; i < arr.length; i++) {
            resArr.push(Number(arr[i]));
        }
        return resArr;
    };
    /**get valueArr 对象中数组个数*/
    DZCardCheck.getArrCount = function (arrObj) {
        var resNum = 0;
        for (var i in arrObj) {
            resNum++;
        }
        return resNum;
    };
    /**get valueArr 对象中数组的数组*/
    DZCardCheck.getArrArr = function (arrObj) {
        var resArr = [];
        for (var i in arrObj) {
            resArr.push(arrObj[i]);
        }
        return resArr;
    };
    /**是否包含大小王 */
    DZCardCheck.hasJoker = function (cardList) {
        for (var i = 0; i < cardList.length; i++) {
            if (DZCardCheck.getCardValue(cardList[0]) >= 16)
                return true;
        }
        return false;
    };
    /**
    * 提示选择出牌
    * @returns 牌的数组
    * @param cardList 当前玩家的手牌数组
    * @param pcardList 上一次帮助选择出来的牌
    * @param cardsType 上一次(上家)的出牌类型
    * @param preCardList 上家的出牌
    */
    DZCardCheck.HelpCard = function (cardList, pcardList, cardsType) {
        if (!pcardList || pcardList.length == 0) {
            return [];
        }
        var cardListAr = __spreadArrays(cardList);
        var pcardListAr = __spreadArrays(pcardList);
        var valueArr = this.getCardValueArray(cardListAr);
        var valueArr1 = this.getCopyObj(valueArr);
        var resultList = [];
        if (cardsType == DZCardType.CT_BOMB_CARD) {
            resultList = DZCardCheck.findBiggerBomb(cardListAr, valueArr, pcardListAr);
        }
        else if (cardsType == DZCardType.CT_FOUR_TAKE_ONE) {
            resultList = DZCardCheck.findFour_Pair(cardListAr, valueArr, pcardListAr);
        }
        else if (cardsType == DZCardType.CT_FOUR_TAKE_TWO) {
            resultList = DZCardCheck.findFour_Two_Pair(cardListAr, valueArr, pcardListAr);
        }
        else if (cardsType == DZCardType.CT_THREE_TAKE_TWO) {
            resultList = DZCardCheck.findThree_Pair(cardListAr, valueArr, pcardListAr);
        }
        else if (cardsType == DZCardType.CT_THREE_TAKE_ONE) {
            resultList = DZCardCheck.findThreeOne(cardListAr, valueArr, pcardListAr);
        }
        else if (cardsType == DZCardType.CT_THREE) {
            resultList = DZCardCheck.findThree(cardListAr, valueArr, pcardListAr);
        }
        else if (cardsType == DZCardType.CT_DOUBLE_LINE) {
            resultList = DZCardCheck.findOrderCard(cardListAr, valueArr, pcardListAr, 2);
        }
        else if (cardsType == DZCardType.CT_SINGLE_LINE) {
            resultList = DZCardCheck.findOrderCard(cardListAr, valueArr, pcardListAr, 1);
        }
        else if (cardsType == DZCardType.CT_SINGLE) {
            resultList = DZCardCheck.findSingleCard(valueArr, pcardListAr);
        }
        else if (cardsType == DZCardType.CT_DOUBLE) {
            resultList = DZCardCheck.findPairCard(cardListAr, valueArr, pcardListAr);
        }
        else if (cardsType == DZCardType.CT_THREE_LINE) {
            if (DZCardCheck.isThree_Order(pcardList)["isOK"]) {
                resultList = DZCardCheck.findThreeOrderFly(cardListAr, valueArr, pcardListAr, 0, 3);
            }
            ;
            if (DZCardCheck.isThree_Order_Take_One(pcardList)["isOK"]) {
                resultList = DZCardCheck.findThreeOrderFly(cardListAr, valueArr, pcardListAr, 1, 3);
            }
            ;
            if (DZCardCheck.isThree_Order_Take_Pair(pcardList)["isOK"]) {
                resultList = DZCardCheck.findThreeOrderFly(cardListAr, valueArr, pcardListAr, 2, 3);
            }
            ;
        }
        if (resultList.length > 0) {
            return resultList;
        }
        else if (cardsType != DZCardType.CT_BOMB_CARD && !DZCardCheck.CheckCardType(pcardList, DZCardType.CT_BOMB_CARD)[DZCardType.CT_BOMB_CARD]) {
            var result = DZCardCheck.findBomb(cardListAr, valueArr1);
            if (result.length != 0) {
                return result;
            }
        }
        else if (DZCardCheck.CheckCardType(pcardList, DZCardType.CT_BOMB_CARD)[DZCardType.CT_BOMB_CARD]) {
            var result = DZCardCheck.findBiggerBomb(cardListAr, valueArr1, pcardList);
            if (result.length != 0) {
                return result;
            }
        }
        if (resultList.length == 0) {
            var result = DZCardCheck.findRocket(cardListAr, valueArr1);
            if (result.length != 0)
                return result;
        }
        return resultList;
    };
    DZCardCheck.findBiggerBomb = function (cardList, valueList, pcardList) {
        var result = new Array();
        var cardNum = 4;
        var value = DZCardCheck.getCardMinValue(pcardList, cardNum);
        for (var i in valueList) {
            if (valueList[i] != null) {
                var itemList = valueList[i];
                if (itemList != null && itemList.length == cardNum) {
                    var tempValue = this.getCardValue(itemList[0]);
                    if (tempValue > value) {
                        result = itemList.slice(0, itemList.length);
                        break;
                    }
                }
            }
        }
        return result;
    };
    /**查找炸弹 */
    DZCardCheck.findBomb = function (cardList, valueList) {
        var result = new Array();
        var valueList1 = DZCardCheck.getCopyObj(valueList);
        var cardNum = 4;
        var cardList1 = new Array();
        cardList1 = cardList1.concat(cardList);
        for (var i in valueList1) {
            if (valueList1[i] != null) {
                var itemList = valueList1[i];
                if (itemList != null && itemList.length == cardNum) {
                    result = itemList.slice(0, itemList.length);
                    break;
                }
            }
        }
        return result;
    };
    DZCardCheck.findRocket = function (cardList, valueList) {
        var result = new Array();
        var valueList1 = DZCardCheck.getCopyObj(valueList);
        var cardList1 = new Array();
        cardList1 = cardList1.concat(cardList);
        for (var i in valueList1) {
            if (valueList1[i] != null) {
                var itemList = valueList1[i];
                if (itemList != null && (itemList[0] == 0x4e || itemList[0] == 0x4f)) {
                    result.push(itemList[0]);
                    if (result.length == 2)
                        break;
                    // break;
                }
            }
        }
        if (result.length != 2)
            return [];
        return result;
    };
    /**查找四带二 */
    DZCardCheck.findFour_Pair = function (cardList, valueList, pcardList) {
        var result = new Array();
        if (cardList.length < 6) {
            return result;
        }
        var value = DZCardCheck.getCardMinValue(pcardList, 4);
        var cardList1 = __spreadArrays(cardList);
        var valueList1 = new Object();
        valueList1 = DZCardCheck.getCardValueArray(cardList1);
        for (var i in valueList1) {
            var itemList = valueList1[i];
            var tempValue = this.getCardValue(itemList[0]);
            if (itemList != null && itemList.length == 4 && tempValue > value) {
                result = result.concat(itemList);
                delete valueList1[i];
                break;
            }
        }
        if (result.length >= 4) {
            var indexArr = new Array();
            for (var i = 1; i < 4; i++) {
                indexArr.push(DZCardCheck.getIndexArrayOfNum(valueList1, i));
            }
            for (var i = 0; i < indexArr.length; i++) {
                var numIndexArr = indexArr[i];
                if (numIndexArr.length != 0) {
                    //优先从数量最少的牌值中抽取作为带牌
                    for (var j = 0; j < numIndexArr.length; j++) {
                        for (var k = 0; k < valueList1[numIndexArr[j]].length; k++) {
                            if (valueList1[numIndexArr[j]][k] <= 0x4f) {
                                result.push(valueList1[numIndexArr[j]][k]);
                                if (result.length == 6) {
                                    if (DZCardCheck.isCardGreater(result, pcardList, DZCardType.CT_FOUR_TAKE_ONE)) {
                                        return result;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    };
    /**查找四带两对 */
    DZCardCheck.findFour_Two_Pair = function (cardList, valueList, pcardList) {
        var result = new Array();
        if (cardList.length < 8) {
            return result;
        }
        var value = DZCardCheck.getCardMinValue(pcardList, 4);
        var cardList1 = __spreadArrays(cardList);
        var valueList1 = new Object();
        valueList1 = DZCardCheck.getCardValueArray(cardList1);
        for (var i in valueList1) {
            var itemList = valueList1[i];
            var tempValue = this.getCardValue(itemList[0]);
            if (itemList != null && itemList.length == 4 && tempValue > value) {
                result = result.concat(itemList);
                delete valueList1[i];
                break;
            }
        }
        if (result.length >= 4) {
            var indexArr = new Array();
            // for (let i = 1; i < 4; i++) {
            indexArr.push(DZCardCheck.getIndexArrayOfNum(valueList1, 2));
            // }
            for (var i = 0; i < indexArr.length; i++) {
                var numIndexArr = indexArr[i];
                if (numIndexArr.length != 0) {
                    //优先从数量最少的牌值中抽取作为带牌
                    for (var j = 0; j < numIndexArr.length; j++) {
                        for (var k = 0; k < valueList1[numIndexArr[j]].length; k++) {
                            if (valueList1[numIndexArr[j]][k] <= 0x4f) {
                                result.push(valueList1[numIndexArr[j]][k]);
                                if (result.length == 8) {
                                    if (DZCardCheck.isCardGreater(result, pcardList, DZCardType.CT_FOUR_TAKE_TWO)) {
                                        return result;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    };
    DZCardCheck.findThree_Pair = function (cardList1, valueList1, pcardList) {
        var cardList = __spreadArrays(cardList1);
        var valueList = DZCardCheck.getCopyObj(valueList1);
        if (DZCardCheck.getValueCount(valueList, 3) == 0 && DZCardCheck.getValueCount(valueList, 4) == 0) {
            return [];
        }
        var result = new Array();
        var value = DZCardCheck.getCardMinValue(pcardList, 3); //上家牌大小
        var myValue = -1;
        var numOrderArr = DZCardCheck.getNumOrderArr(valueList, 3);
        for (var i = 0; i < numOrderArr.length; i++) {
            var sameNumArr = numOrderArr[i];
            for (var _i = 0, sameNumArr_1 = sameNumArr; _i < sameNumArr_1.length; _i++) {
                var item = sameNumArr_1[_i];
                var itemList = valueList[item];
                if (itemList != null && itemList.length >= 3) {
                    myValue = DZCardCheck.getCardValue(itemList[0]);
                    if (myValue > value) {
                        result = result.concat(itemList.splice(0, 3));
                        delete valueList[item];
                        // result = result.concat(itemList.slice(0, 3));
                        break;
                    }
                }
            }
        }
        if (result.length != 0) {
            var indexArrArr = DZCardCheck.getNumOrderArr(valueList, 2);
            for (var i = 0; i < indexArrArr.length; i++) {
                var numIndexArr = indexArrArr[i];
                for (var j = 0; j < numIndexArr.length; j++) {
                    for (var k = 0; k < valueList[numIndexArr[j]].length; k++) {
                        if (valueList[numIndexArr[j]][k] <= 0x4f) {
                            result.push(valueList[numIndexArr[j]][k]);
                            if (result.length == 5) {
                                if (DZCardCheck.isCardGreater(result, pcardList, DZCardType.CT_THREE_TAKE_TWO)) {
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    };
    DZCardCheck.findThreeOne = function (cardList1, valueList1, pcardList) {
        var cardList = __spreadArrays(cardList1);
        var valueList = DZCardCheck.getCopyObj(valueList1);
        if (DZCardCheck.getValueCount(valueList, 3) == 0 && DZCardCheck.getValueCount(valueList, 4) == 0) {
            return [];
        }
        var result = new Array();
        var value = DZCardCheck.getCardMinValue(pcardList, 3); //上家牌大小
        var myValue = -1;
        var numOrderArr = DZCardCheck.getNumOrderArr(valueList, 3);
        for (var i = 0; i < numOrderArr.length; i++) {
            var sameNumArr = numOrderArr[i];
            for (var _i = 0, sameNumArr_2 = sameNumArr; _i < sameNumArr_2.length; _i++) {
                var item = sameNumArr_2[_i];
                var itemList = valueList[item];
                if (itemList != null && itemList.length >= 3) {
                    myValue = DZCardCheck.getCardValue(itemList[0]);
                    if (myValue > value) {
                        result = result.concat(itemList.splice(0, 3));
                        delete valueList[item];
                        // result = result.concat(itemList.slice(0, 3));
                        break;
                    }
                }
            }
        }
        if (result.length != 0) {
            var indexArrArr = DZCardCheck.getNumOrderArr(valueList, 1);
            for (var i = 0; i < indexArrArr.length; i++) {
                var numIndexArr = indexArrArr[i];
                for (var j = 0; j < numIndexArr.length; j++) {
                    for (var k = 0; k < valueList[numIndexArr[j]].length; k++) {
                        //排除炸弹情况,炸弹类型单独处理
                        if (valueList[numIndexArr[j]][k] <= 0x4f) {
                            result.push(valueList[numIndexArr[j]][k]);
                            if (result.length == 4) {
                                if (DZCardCheck.isCardGreater(result, pcardList, DZCardType.CT_THREE_TAKE_ONE)) {
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    };
    DZCardCheck.findThree = function (cardList1, valueList1, pcardList) {
        var cardList = __spreadArrays(cardList1);
        var valueList = DZCardCheck.getCopyObj(valueList1);
        if (DZCardCheck.getValueCount(valueList, 3) == 0 && DZCardCheck.getValueCount(valueList, 4) == 0) {
            return [];
        }
        var result = new Array();
        var value = DZCardCheck.getCardMinValue(pcardList, 3); //上家牌大小
        var myValue = -1;
        var numOrderArr = DZCardCheck.getNumOrderArr(valueList, 3);
        for (var i = 0; i < numOrderArr.length; i++) {
            var sameNumArr = numOrderArr[i];
            for (var _i = 0, sameNumArr_3 = sameNumArr; _i < sameNumArr_3.length; _i++) {
                var item = sameNumArr_3[_i];
                var itemList = valueList[item];
                if (itemList != null && itemList.length >= 3) {
                    myValue = DZCardCheck.getCardValue(itemList[0]);
                    if (myValue > value) {
                        result = result.concat(itemList.slice(0, 3));
                        delete valueList[item];
                        // result = result.concat(itemList.splice(0, 3));
                        break;
                    }
                }
            }
        }
        if (result.length == 3) {
            if (DZCardCheck.isCardGreater(result, pcardList, DZCardType.CT_THREE)) {
                return result;
            }
        }
        return result;
    };
    DZCardCheck.findOrderCard = function (cardList1, valueList1, pcardList, cardNum) {
        var count = 0;
        var oldCardValue = 0;
        var result = new Array();
        var value = -1;
        var cardList = __spreadArrays(cardList1);
        var maybeRes = new Array();
        if (DZCardCheck.getCardMaxValue(pcardList, cardNum) == 14) {
            return result;
        }
        var valueList = DZCardCheck.getCopyObj(valueList1);
        value = DZCardCheck.getCardMinValue(pcardList, cardNum); //上手牌值
        for (var i in valueList) {
            var itemList = valueList[i];
            var tempValue = DZCardCheck.getCardValue(itemList[0]);
            if (tempValue > value && itemList.length >= cardNum && tempValue < 15) {
                if (count == 0) {
                    if (cardNum == 1) {
                        result.push(itemList[0]);
                    }
                    else if (cardNum == 2) {
                        result.push(itemList[0]);
                        result.push(itemList[1]);
                    }
                    else if (cardNum == 3) {
                        result.push(itemList[0]);
                        result.push(itemList[1]);
                        result.push(itemList[2]);
                    }
                    else if (cardNum == 4) {
                        result.push(itemList[0]);
                        result.push(itemList[1]);
                        result.push(itemList[2]);
                        result.push(itemList[3]);
                    }
                    oldCardValue = tempValue;
                    count++;
                }
                else {
                    if (oldCardValue + 1 == tempValue && tempValue != 15) {
                        if (cardNum == 1) {
                            result.push(itemList[0]);
                        }
                        else if (cardNum == 2) {
                            result.push(itemList[0]);
                            result.push(itemList[1]);
                        }
                        else if (cardNum == 3) {
                            result.push(itemList[0]);
                            result.push(itemList[1]);
                            result.push(itemList[2]);
                        }
                        else if (cardNum == 4) {
                            result.push(itemList[0]);
                            result.push(itemList[1]);
                            result.push(itemList[2]);
                            result.push(itemList[3]);
                        }
                        oldCardValue += 1;
                        count++;
                    }
                    else {
                        result.length = 0;
                        oldCardValue = tempValue;
                        if (cardNum == 1) {
                            result.push(itemList[0]);
                        }
                        else if (cardNum == 2) {
                            result.push(itemList[0]);
                            result.push(itemList[1]);
                        }
                        else if (cardNum == 3) {
                            result.push(itemList[0]);
                            result.push(itemList[1]);
                            result.push(itemList[2]);
                        }
                        else if (cardNum == 4) {
                            result.push(itemList[0]);
                            result.push(itemList[1]);
                            result.push(itemList[2]);
                            result.push(itemList[3]);
                        }
                    }
                }
                if (result.length == pcardList.length) {
                    return result;
                }
            }
        }
        if (result.length == pcardList.length) {
            return result;
        }
        return [];
    };
    DZCardCheck.findSingleCard = function (valueList, pcardList) {
        var result = new Array();
        var value = DZCardCheck.getCardMinValue(pcardList, 1);
        for (var i in valueList) {
            var itemList = valueList[i];
            if (itemList != null && itemList.length >= 1) {
                var tempValue = DZCardCheck.getCardValue(itemList[0]);
                if (tempValue > value) {
                    result.push(itemList[0]);
                    break;
                }
            }
        }
        return result;
    };
    DZCardCheck.findPairCard = function (cardList, valueList, pcardList) {
        var result = new Array();
        var value = DZCardCheck.getCardMinValue(pcardList, 2);
        var i = 0;
        for (var i_1 in valueList) {
            if (valueList[i_1] != null) {
                var itemList = valueList[i_1];
                if (itemList != null && itemList.length >= 2) {
                    var tempValue = DZCardCheck.getCardValue(itemList[0]);
                    if (tempValue > value) {
                        result = itemList.slice(0, 2);
                        break;
                    }
                }
            }
        }
        return result;
    };
    DZCardCheck.findThreeOrderFly = function (cardList, valueList1, pcardList, flyNum, cardNum) {
        if (cardNum === void 0) { cardNum = 3; }
        var valueList = DZCardCheck.getCopyObj(valueList1);
        var pcardList1 = this.getThreeFlyOneWithoutWings(pcardList);
        var result = DZCardCheck.findOrderCard(cardList, valueList, pcardList1, cardNum);
        var threeValueList = DZCardCheck.getCardValueArray(result);
        var threeValueArr = DZCardCheck.getValueArrOfNum(threeValueList, 3);
        if (result.length > pcardList1.length) {
            valueList = DZCardCheck.getCardValueArray(cardList);
        }
        else if (result.length == pcardList1.length && flyNum == 0) { //飞机不带直接返回结果
            return result;
        }
        var count = result.length > pcardList1.length ? (result.length - 1) / cardNum : result.length / cardNum;
        // var i: number = 0;
        if (((result.length + (count * flyNum)) == pcardList.length) || ((result.length + (count * flyNum)) == pcardList.length + 1 && result.length > pcardList1.length)) {
            var index = void 0;
            var itemList1 = void 0;
            var tempCount = -1;
            var resultValueList = DZCardCheck.getCardValueArray(result);
            var getPureValueArr = DZCardCheck.getPureValueArr(resultValueList);
            var uniqueObj = new Object();
            for (var i = 0; i < getPureValueArr.length; i++) {
                uniqueObj[getPureValueArr[i]] = i.toString();
            }
            for (var item in valueList) {
                if (uniqueObj[DZCardCheck.getCardValue(valueList[item][0])] != null) {
                    if (valueList[item].length == 4) {
                        valueList[item].splice(0, 3);
                    }
                    else {
                        delete valueList[item];
                    }
                }
            }
            if (result.length >= 6) {
                var indexArr = new Array();
                for (var j = 1; j < 4; j++) {
                    indexArr.push(DZCardCheck.getIndexArrayOfNum(valueList, j));
                }
                for (var k = 0; k < indexArr.length; k++) {
                    var numIndexArr = indexArr[k];
                    if (numIndexArr != null) {
                        for (var l = 0; l < numIndexArr.length; l++) {
                            for (var m = 0; m < valueList[numIndexArr[l]].length; m++) {
                                // if (valueList[numIndexArr[l]][m] <= 53 && threeValueArr.indexOf(DZCardCheck.getCardValue(valueList[numIndexArr[l]][m])) == -1) {//不选择可合为炸弹的牌为带牌
                                if (valueList[numIndexArr[l]][m] <= 0x4f) { //不选择可合为炸弹的牌为带牌
                                    if (flyNum == 2 && valueList[numIndexArr[l]].length == 2) { //三带对
                                        result.push(valueList[numIndexArr[l]][m]);
                                    }
                                    else if (flyNum == 1) {
                                        result.push(valueList[numIndexArr[l]][m]);
                                    }
                                }
                                if (result.length == pcardList.length) {
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    };
    DZCardCheck.findFourOrderFly = function (cardList, valueList1, pcardList, flyNum, cardNum) {
        if (cardNum === void 0) { cardNum = 4; }
        var valueList = DZCardCheck.getCopyObj(valueList1);
        var pcardList1 = this.getFourFlyOneWithoutWings(pcardList);
        var result = DZCardCheck.findOrderCard(cardList, valueList, pcardList1, cardNum);
        var threeValueList = DZCardCheck.getCardValueArray(result);
        // let threeValueArr = DZCardCheck.getValueArrOfNum(threeValueList, 4);
        if (result.length > pcardList1.length) {
            valueList = DZCardCheck.getCardValueArray(cardList);
        }
        else if (result.length == pcardList1.length && flyNum == 0) { //飞机不带直接返回结果
            return result;
        }
        var count = result.length > pcardList1.length ? (result.length - 1) / cardNum : result.length / cardNum;
        var i = 0;
        if (((result.length + (count * flyNum)) == pcardList.length) || ((result.length + (count * flyNum)) == pcardList.length + 1 && result.length > pcardList1.length)) {
            var index = void 0;
            var itemList1 = void 0;
            var tempCount = -1;
            var resultValueList = DZCardCheck.getCardValueArray(result);
            var getPureValueArr = DZCardCheck.getPureValueArr(resultValueList);
            var uniqueObj = new Object();
            for (var i_2 = 0; i_2 < getPureValueArr.length; i_2++) {
                uniqueObj[getPureValueArr[i_2]] = i_2.toString();
            }
            for (var item in valueList) {
                if (uniqueObj[DZCardCheck.getCardValue(valueList[item][0])] != null) {
                    if (valueList[item].length == 4) {
                        valueList[item].splice(0, 4);
                    }
                    else {
                        delete valueList[item];
                    }
                }
            }
            if (result.length >= 8) {
                var indexArr = new Array();
                for (var j = 1; j < 4; j++) {
                    indexArr.push(DZCardCheck.getIndexArrayOfNum(valueList, j));
                }
                for (var k = 0; k < indexArr.length; k++) {
                    var numIndexArr = indexArr[k];
                    if (numIndexArr != null) {
                        for (var l = 0; l < numIndexArr.length; l++) {
                            for (var m = 0; m < valueList[numIndexArr[l]].length; m++) {
                                // if (valueList[numIndexArr[l]][m] <= 53 && threeValueArr.indexOf(DZCardCheck.getCardValue(valueList[numIndexArr[l]][m])) == -1) {//不选择可合为炸弹的牌为带牌
                                if (valueList[numIndexArr[l]][m] <= 0x4f) {
                                    result.push(valueList[numIndexArr[l]][m]);
                                }
                                if (result.length == pcardList.length) {
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        return [];
    };
    /**获取不带翅膀的飞机 */
    DZCardCheck.getThreeFlyOneWithoutWings = function (cardList) {
        var valueList = DZCardCheck.getCardValueArray(cardList);
        var cardListArr;
        var speCardValue;
        var pureThreeFlyValueList;
        var cardListRes = new Array();
        cardListArr = cardList;
        pureThreeFlyValueList = this.shiftNeedlessCardsForPureThreeFly(valueList, 3);
        for (var j = 0, len = pureThreeFlyValueList.length; j < len; j++) {
            // for (let k = 0; k < pureThreeFlyValueList[j].length; k++) {
            // cardListRes.push(pureThreeFlyValueList[j][k]);
            // }
            cardListRes.push(pureThreeFlyValueList[j]);
        }
        return cardListRes;
    };
    /**带牌是否大于上家 (用于带牌必大) */
    DZCardCheck.isWingsGreater = function (wing1, wing2) {
        var len1 = wing1.length;
        var len2 = wing2.length;
        if (len1 != len2)
            return;
        var resBoo = true;
        var valueList1 = DZCardCheck.getCardValueArray(wing1);
        var valueList2 = DZCardCheck.getCardValueArray(wing2);
        var orderArr1 = [];
        for (var i in valueList1) {
            var numArr = valueList1[i];
            numArr.forEach(function (item) {
                orderArr1.push(item);
            });
        }
        var orderArr2 = [];
        for (var j in valueList2) {
            var numArr = valueList2[j];
            numArr.forEach(function (item) {
                orderArr2.push(item);
            });
        }
        for (var k = 0; k < len1; k++) {
            if (DZCardCheck.getCardValue(orderArr1[k]) <= DZCardCheck.getCardValue(orderArr2[k])) {
                resBoo = false;
            }
        }
        return resBoo;
    };
    /**获取上家带牌
     * @param cardsList {number[]} 需处理的牌组
     * @param count {number} 三飞机或四飞机
    */
    DZCardCheck.getPreWings = function (cardsList1, count) {
        var cardsList = __spreadArrays(cardsList1);
        var valueArr = DZCardCheck.getCardValueArray(cardsList);
        var resArr = [];
        for (var i in valueArr) {
            var item = valueArr[i];
            if (item.length >= count) {
                item.splice(0, count);
            }
        }
        for (var j in valueArr) {
            var item = valueArr[j];
            for (var k = 0; k < item.length; k++) {
                resArr.push(item[k]);
            }
        }
        return resArr;
    };
    /**从手牌获取带牌及已选手牌
     * @param cardsList {number[]} 需处理的牌组
     * @param count {number} 三飞机或四飞机
    */
    DZCardCheck.getHandsWingsWithSelected = function (cardsList1, pcardList, diffArr, count, wingCount, wingType) {
        var cardsList = __spreadArrays(cardsList1);
        var diffArrObj = DZCardCheck.getCardValueArray(diffArr);
        var diffArrValueArr = Object.keys(diffArrObj);
        var valueArr = DZCardCheck.getCardValueArray(cardsList);
        var resArr = [];
        var wing2 = DZCardCheck.getPreWings(pcardList, count);
        var wing2ValueArr = DZCardCheck.getCardValueArray(wing2);
        //祛除已选牌
        var selectedCards = [];
        for (var i in valueArr) {
            var item = valueArr[i];
            var itemValueStr = DZCardCheck.getCardValue(item[0]).toString();
            if (item.length >= count && diffArrValueArr.indexOf(itemValueStr) != -1) {
                selectedCards.push(item.splice(0, count));
            }
        }
        //获取可带牌
        for (var j in valueArr) {
            var item = valueArr[j];
            for (var k = 0; k < item.length; k++) {
                var val1 = DZCardCheck.getCardValue(item[k]);
                for (var l = 0; l < wing2.length; l++) {
                    var val2 = DZCardCheck.getCardValue(wing2[l]);
                    if (val1 > val2) {
                        if (wingType == null) {
                            resArr.push(item[k]);
                            wing2.splice(l, 1);
                        }
                        else if (wingType == DZCardType.CT_DOUBLE && item.length >= 2) {
                            resArr = resArr.concat(item.splice(0, 2));
                        }
                        if (resArr.length == wingCount) {
                            resArr = resArr.concat.apply(resArr, selectedCards);
                            return resArr;
                        }
                        break;
                    }
                }
            }
        }
        return resArr;
    };
    /**获取不带翅膀的四飞机 */
    DZCardCheck.getFourFlyOneWithoutWings = function (cardList) {
        var valueList = DZCardCheck.getCardValueArray(cardList);
        var cardListArr;
        var speCardValue;
        var pureFourFlyValueList;
        var cardListRes = new Array();
        cardListArr = cardList;
        pureFourFlyValueList = this.shiftNeedlessCardsForPureThreeFly(valueList, 4);
        for (var j = 0, len = pureFourFlyValueList.length; j < len; j++) {
            // for (let k = 0; k < pureFourFlyValueList[j].length; k++) {
            //     cardListRes.push(pureFourFlyValueList[j][k]);
            // }
            cardListRes.push(pureFourFlyValueList[j]);
        }
        return cardListRes;
    };
    /**根据牌值数量key值从小到大排序 */
    DZCardCheck.getNumOrderArr = function (obj, beginNum) {
        var resArr = [];
        for (var i = beginNum; i < 4; i++) {
            var item = DZCardCheck.getIndexArrayOfNum(obj, i);
            if (item.length != 0) {
                resArr.push(item);
            }
        }
        return resArr;
    };
    DZCardCheck.getCardMinValue = function (cardList, cardNum) {
        var valueList = DZCardCheck.getCardValueArray(cardList);
        var minValue = -1;
        for (var i in valueList) {
            if (valueList[i] != null) {
                var itemList = valueList[i];
                if (itemList != null && itemList.length == cardNum) {
                    var value = this.getCardValue(itemList[0]);
                    if (value < minValue || minValue == -1) {
                        minValue = value;
                    }
                }
            }
        }
        return minValue;
    };
    return DZCardCheck;
}());
var DZCardType = /** @class */ (function () {
    function DZCardType() {
    }
    DZCardType.CT_ERROR = 0; //错误类型
    DZCardType.CT_SINGLE = 1; //单牌类型
    DZCardType.CT_DOUBLE = 2; //对牌类型
    DZCardType.CT_THREE = 3; //三条类型
    DZCardType.CT_SINGLE_LINE = 4; //单连类型
    DZCardType.CT_DOUBLE_LINE = 5; //对连类型
    DZCardType.CT_THREE_LINE = 6; //三连类型
    DZCardType.CT_THREE_TAKE_ONE = 7; //三带一单
    DZCardType.CT_THREE_TAKE_TWO = 8; //三带一对
    DZCardType.CT_FOUR_TAKE_ONE = 9; //四带两单
    DZCardType.CT_FOUR_TAKE_TWO = 10; //四带两对
    DZCardType.CT_BOMB_CARD = 11; //炸弹类型
    DZCardType.CT_MISSILE_CARD = 12; //火箭类型
    DZCardType.CHUNTIAN = 13; //春天
    DZCardType.FANCHUN = 14; //反春
    DZCardType.TONGTIANSHUN = 15; //通天顺
    DZCardType.normalTypeArrr = [
        DZCardType.CT_SINGLE,
        DZCardType.CT_DOUBLE,
        DZCardType.CT_DOUBLE_LINE,
        DZCardType.CT_SINGLE_LINE,
        DZCardType.CT_THREE,
        // DZCardType.DealCardType_SAN_FEI_JI_BU_DAI, //三飞机不带
        // DZCardType.DealCardType_SI_FEI_JI_BU_DAI, //四飞机不带
        DZCardType.CT_BOMB_CARD,
    ];
    return DZCardType;
}());

module.exports = {DZCardCheck,DZCardType}

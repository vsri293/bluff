// Keep track of which names are used so that there are no duplicates
function userNames() {
  var names = {};
  var socketInfo = {};
  var nameList = [];

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
      nameList.push(name);
      return true;
    }
  };

  // find the lowest unused "guest" name and claim it
  var getGuestName = function () {
    var name,
      nextUserId = 1;
    var users = get();
    if (users.length > 3){
      return false;
    }
    do {
      name = 'Guest ' + nextUserId;
      nextUserId += 1;
    } while (names[name]);

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    // var res = [];
    // for (user in names) {
    //   res.push(user);
    // }

    return nameList;
  };

  var free = function (name) {
    if (names[name]) {
      delete names[name];
    }
  };

  var getUserIndex = function (name){

  };

  var setSocketId = function (name, socketId) {
    socketInfo[name] = socketId;
    return true;
  };

  var getSocketId = function (name) {
    return socketInfo[name];
  };

  return {
    claim: claim,
    free: free,
    get: get,
    getGuestName: getGuestName,
    getUserIndex: getUserIndex,
    setSocketId: setSocketId,
    getSocketId: getSocketId
  };
}

function userChanceTracker () {
  var userChance = 0;

  var initChance = function () {
      userChance = 0;
  };

  var nextChance = function () {
    userChance = (userChance+1)%4;
    return userChance;
  };

  var getCurrentChance = function(){
    return userChance;
  };

  var setCurrentChance = function(updatedChance){
    userChance = updatedChance;
  };

  return {
    initChance: initChance,
    nextChance: nextChance,
    getCurrentChance: getCurrentChance,
    setCurrentChance: setCurrentChance
  };
}

function cardTracker() {
  var playerCards = {};
  var deckCards = [];
  for (var i = 1 ; i <= 4 ; i++){
    for (var j = 1 ; j <= 13 ; j++){
      deckCards.push(i*100+j);
    }
  }
  // deal initial cards to players
  var cardDealer = function(players){
    var size = players.length;
    for(var i = 0; i < size ; i++){
      var tmpCards= [];
      tmpCards.push(1);
      tmpCards.push(2);
      playerCards[players[i]] = tmpCards;
    }
    // console.log(playerCards);
    return true;
  };

  // update card for the player
  var cardUpdate = function(player, cards, action){
    // console.log(player);
    // console.log(playerCards);
    var tmpCards = playerCards[player];
    var size = cards.length;
    var i;
    if (action == "add")
    {
      for (i = 0 ; i < size ; i++){
        tmpCards.push(cards[i]);
      }
      playerCards[player] = tmpCards;
      sortCards(player);
    }
    else if (action == "delete")
    {
      for (i = 0 ; i < size ; i++){
        var index = tmpCards.indexOf(cards[i]);
        if (index > -1) {
          tmpCards.splice(index, 1);
        }
        else{
          return false;
        }
      }
      playerCards[player] = tmpCards;
      sortCards(player);
    }

    // console.log(playerCards);
    return true;
  };

  var get = function () {
    return playerCards;
  };

  var getCards = function(name) {
    return playerCards[name];
  };

  var initCards = function(name) {
    var tmpCards = [];
    for (var i = 0 ; i < 13 ; i++){
      var randNum = Math.floor(Math.random() * deckCards.length);
      tmpCards.push(deckCards[randNum]);
      deckCards.splice(randNum, 1);
    }
    playerCards[name] = tmpCards;
    tmpCards = sortCards(name);
    return tmpCards;
  };

  var sortCards = function(name) {
    var cards = playerCards[name];
    var sortedCards = cards.sort(function(a,b){
      return (a%100 - b%100);
    });
    playerCards[name] = sortedCards;
    // console.log(sortedCards);
    return sortedCards;
  };

  var checkWinner = function(users){
    for (var i = 0 ; i < users.length ; i++){
      var cards = playerCards[users[i]];
      if (cards.length == 0){
        return users[i];
      }
    }
    return null;
  };

  var getCardCnt = function(users){
    var cardCntList = [];
    for (var i = 0 ; i < users.length ; i++){
      var cardCnt = playerCards[users[i]].length;
      cardCntList.push(cardCnt)
    }
    return cardCntList;
  };

  return {
    cardDealer: cardDealer,
    cardUpdate: cardUpdate,
    get: get,
    getCards: getCards,
    initCards: initCards,
    sortCards: sortCards,
    checkWinner: checkWinner,
    getCardCnt: getCardCnt
  };
}

function tableTracker(){

  var tableHistory = [];
  var tableCardsCnt = 0;
  var newTurn = 1;
  var moveInfo = [];
  var consecutivePasses = 0;

  var addCards = function(player, cards, baseCard){
    var submitMoveInfo = {};
    submitMoveInfo['player'] = player;
    submitMoveInfo['cards'] = cards;
    submitMoveInfo['baseCard'] = baseCard;
    tableHistory.push(submitMoveInfo);
    tableCardsCnt += cards.length;
    // console.log(tableHistory);
    // console.log(tableCardsCnt);
    return true;
  };

  var checkCards = function(checkingPlayer){
    var size = tableHistory.length;
    if (size > 0){
      var lastSubmitMoveInfo = tableHistory[size-1];
      var player = lastSubmitMoveInfo['player'];
      var cards = lastSubmitMoveInfo['cards'];
      var baseCard = lastSubmitMoveInfo['baseCard'];
      var correctFlag = 1;
      var checkInfo = {};
      checkInfo['topCards'] = cards;
      for (var i = 0 ; i < cards.length ; i++){
        if (cards[i]%100 != baseCard){
          correctFlag = 0;
        }
      }
      if (correctFlag == 1){
        checkInfo['claim'] = false;
        checkInfo['winningPlayer'] = player;
        checkInfo['losingPlayer'] = checkingPlayer;
        checkInfo['allCards'] = collectAllCards();
        tableHistory = [];
        tableCardsCnt = 0;
      }
      else{
        checkInfo['claim'] = true;
        checkInfo['winningPlayer'] = checkingPlayer;
        checkInfo['losingPlayer'] = player;
        checkInfo['allCards'] = collectAllCards();
        tableHistory = [];
        tableCardsCnt = 0;
      }
      return checkInfo;
    }
    else{
      return false;
    }
  };

  var collectAllCards = function() {
    var size = tableHistory.length;
    var allCards = [];
    for (var i = 0 ; i < size ; i++){
      var submitMoveInfo = tableHistory[i];
      var cards = submitMoveInfo['cards'];
      for (var j = 0 ; j < cards.length ; j++){
        allCards.push(cards[j]);
      }
    }
    return allCards;
  };

  var cleanTable = function() {
    tableHistory = [];
    tableCardsCnt = 0;
    newTurn = 1;
    moveInfo = [];
  };

  var getTableCardsCnt = function() {
    return tableCardsCnt;
  };

    var getNewTurn = function(){
      return newTurn;
    };

    var setNewTurn = function(tmpNewTurn){
      newTurn = tmpNewTurn;
    };

  var addNewMove = function(player, playedCard, baseCard, moveType){
    if (moveType == 'submit'){
      moveInfo = [];
      tmpMove = {player: player, cnt: playedCard.length, baseCard: baseCard, moveType: moveType};
      moveInfo.push(tmpMove);
    }
    else if(moveType == 'pass'){
      tmpMove = {player: player, cnt: playedCard.length, baseCard: baseCard, moveType: moveType};
      moveInfo.push(tmpMove);
      if (moveInfo.length > 3){
        moveInfo.splice(0, 1);
      }
    }
    else{
      tmpMove = {player: player, cnt: playedCard.length, baseCard: baseCard, moveType: moveType};
      moveInfo.push(tmpMove);
      if (moveInfo.length > 3){
        moveInfo.splice(0, 1);
      }
    }
  };

  var getMoveInfo = function(){
    return moveInfo;
  };

  var setConsPass = function(passValue){
    consecutivePasses = passValue;
  };

  var getConsPass = function () {
    return consecutivePasses;
  };

  var sleep = function(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0 ; i<100; i) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  };

  return {
    addCards: addCards,
    checkCards: checkCards,
    collectAllCards: collectAllCards,
    cleanTable: cleanTable,
    getTableCardsCnt: getTableCardsCnt,
    getNewTurn: getNewTurn,
    setNewTurn: setNewTurn,
    addNewMove: addNewMove,
    getMoveInfo: getMoveInfo,
    setConsPass: setConsPass,
    getConsPass: getConsPass,
    sleep: sleep
  };
}

var roomTracker = (function(){

  var freeRooms = ['room0', 'room1', 'room2'];
  var busyRooms = [];
  var allVariables = {};

  var createRoom = function(){
    if (freeRooms.length > 0){
      var newRoom = freeRooms[0];
      freeRooms.splice(0, 1);
      busyRooms.push(newRoom);
      // console.log(freeRooms, busyRooms);
      var tmpVariablesDict = {};
      tmpVariablesDict['userNames'] = new userNames();
      tmpVariablesDict['userChanceTracker'] = new userChanceTracker();
      tmpVariablesDict['cardTracker'] = new cardTracker();
      tmpVariablesDict['tableTracker'] = new tableTracker();
      allVariables[newRoom] = tmpVariablesDict;
      return newRoom;
    }
    else{
      return false;
    }
  };

  var checkExistRoom = function(room){
    var index = busyRooms.indexOf(room);
    if (index > -1) {
      return true;
    }
    else{
      return false;
    }
  };

  var getUserNames = function (room) {
    if (checkExistRoom(room)) {

      return allVariables[room]['userNames'];
    }
    else{
      return false;
    }
  };

  var getUserChanceTracker = function(room){
    if (checkExistRoom(room)) {
      return allVariables[room]['userChanceTracker'];
    }
    else{
      return false;
    }
  };

  var getCardTracker = function (room) {
    if (checkExistRoom(room)) {
      return allVariables[room]['cardTracker'];
    }
    else{
      return false;
    }
  };

  var getTableTracker = function (room) {
    if (checkExistRoom(room)) {
      return allVariables[room]['tableTracker'];
    }
    else{
      return false;
    }
  };

  var getConsecutivePasses = function (room) {
    if (checkExistRoom(room)) {
      return allVariables[room]['consecutivePasses'];
    }
    else{
      return false;
    }
  };

  return {
    createRoom: createRoom,
    getUserNames: getUserNames,
    getUserChanceTracker: getUserChanceTracker,
    getCardTracker: getCardTracker,
    getTableTracker: getTableTracker,
    getConsecutivePasses: getConsecutivePasses
  };
}());


// export function for listening to the socket
module.exports = function (io) {
  io.sockets.on('connection', function(socket) {
    // var name = "Guest";
    // console.log(socket.id);
    // userNames.setSocketId(name, socket.id)
    // send the new user their name and a list of users
    // socket.emit('init', {
    //   name: name,
    //   users: userNames.get(),
    //   cards: []
    // });

    // notify other clients that a new user has joined
    // socket.broadcast.emit('user:join', {
    //   name: name
    // });
    // var users = userNames.get();
    // if (users.length == 4) {
    //   // console.log('usernames' + users);
    //   userChanceTracker.initChance();
    //     for (var i = 0 ; i < 4 ; i++){
    //         var name = users[i];
    //         console.log(name);
    //         var cards = cardTracker.initCards(name);
    //         console.log(name, cards);
    //       console.log("0-------");
    //         io.to(userNames.getSocketId(name)).emit('cards:update',{
    //             cards: cards
    //         });
    //     }
    //     tableTracker.cleanTable();
    //     var data = {tableCardsCnt: tableTracker.getTableCardsCnt(), newTurn: tableTracker.getNewTurn()};
    //     io.emit('update:table', data);
    //   io.emit('game:start', {
    //     userChance: userChanceTracker.getCurrentChance()
    //   });
    // }

    socket.on('create:room', function (data) {
      // console.log(data);
      var room = roomTracker.createRoom();
      var socketId = data.socketId;
      // console.log(room);
      if (room){
        socket.join(room);
        var roomUserNames = roomTracker.getUserNames(room);
        var name =roomUserNames.getGuestName();
        var data = {room: room, name: name};
        io.to(socketId).emit('create:room', data);
      }
      else{
        var data = {error: "all room full :("};
        io.to(socketId).emit('create:room', data);
      }
    });

    socket.on('join:room', function(data) {
      var socketId = data.socketId;
      var room = data.room;
      var roomUserNames = roomTracker.getUserNames(room);
      if (!roomUserNames){
        var data = {error: "no existing room :("};
        io.to(socketId).emit('join:room', data);
        return;
      }
      var name = roomUserNames.getGuestName();
      if (!name){
        var data = {error: "room full :("};
        io.to(socketId).emit('join:room', data);
        return;
      }
      socket.join(room);
      var data = {room: room, name: name};
      io.to(socketId).emit('join:room', data);
    });

    socket.on('submit:name', function(data) {
      var socketId = data.socketId;
      var room = data.room;
      var newName = data.newName;
      var oldName = data.oldName;
      // console.log(data);
      var roomUserNames = roomTracker.getUserNames(room);
      var roomUserChanceTracker = roomTracker.getUserChanceTracker(room);
      var roomCardTracker = roomTracker.getCardTracker(room);
      var roomTableTracker = roomTracker.getTableTracker(room);
      if (!roomUserNames){
        var data = {error: "no existing room :("};
        io.to(socketId).emit('submit:name', data);
        return;
      }
      // console.log(roomUserNames.get());
      if (roomUserNames.claim(newName)) {
        roomUserNames.free(oldName);
        // console.log(roomUserNames.get());
        var data = {newName: newName};
        roomUserNames.setSocketId(newName, socketId);
        io.to(socketId).emit('submit:name', data);
        io.sockets.in(room).emit('user:join', {newUsers: roomUserNames.get()});
      }
      else{
        var data = {error: "name already taken !"};
        io.to(socketId).emit('submit:name', data);
        return;
      }
      // console.log("after name taken error");
      var users = roomUserNames.get();
      if (users.length == 4){
        roomUserChanceTracker.initChance();
        roomTableTracker.cleanTable();
        io.sockets.in(room).emit('game:start', {
          userChance: roomUserChanceTracker.getCurrentChance()
        });
        // console.log("card dealing ");
        for (var i = 0 ; i < 4 ; i++){
          var name = users[i];
          var cards = roomCardTracker.initCards(name);
          // console.log(name, cards);
          // console.log("0-------");
          io.to(roomUserNames.getSocketId(name)).emit('init',{
              cards: cards,
              users: users
          });
        }
        var data = {tableCardsCnt: roomTableTracker.getTableCardsCnt(), newTurn: roomTableTracker.getNewTurn(), playerCardCnt: roomCardTracker.getCardCnt(users)};
        io.sockets.in(room).emit('update:table', data);
      }
    });


    socket.on('submit:button', function (data) {
      var player = data.player;
      var playedCard = data.playedCard;
      var baseCard = data.baseCard;
      var room = data.room;

      var roomCardTracker = roomTracker.getCardTracker(room);
      var roomTableTracker = roomTracker.getTableTracker(room);
      var roomUserChanceTracker = roomTracker.getUserChanceTracker(room);
      var roomUserNames = roomTracker.getUserNames(room);

      var winner = roomCardTracker.checkWinner(roomUserNames.get());

      // console.log("winner is ", winner);
      if (winner){
        var data = {winner: winner};
        io.sockets.in(room).emit('game:over', data);
      }
      var x = roomCardTracker.cardUpdate(player, playedCard, "delete");
      roomTableTracker.addNewMove(player, playedCard, baseCard, 'submit');
      io.sockets.in(room).emit('display:move', {moveInfoList: roomTableTracker.getMoveInfo()});
      if (x) {
        roomTableTracker.setConsPass(0);
        roomUserChanceTracker.nextChance();
        roomTableTracker.addCards(player, playedCard, baseCard);
          io.to(roomUserNames.getSocketId(player)).emit('cards:update',{
              cards: roomCardTracker.getCards(player)
          });
        
        io.sockets.in(room).emit('chance:change', {
          userChance: roomUserChanceTracker.getCurrentChance()
        });
        if(roomTableTracker.getNewTurn() == 1){
          io.sockets.in(room).emit('setBase:card', {
             baseCard:baseCard
          });
        }
        roomTableTracker.setNewTurn(0);
        var displayAnimation = {player: player, cardCnt: playedCard.length, move: 'add'};
        var users = roomUserNames.get();
        var data = {tableCardsCnt: roomTableTracker.getTableCardsCnt(), newTurn: roomTableTracker.getNewTurn(), displayAnimation: displayAnimation, playerCardCnt: roomCardTracker.getCardCnt(users)};
        console.log(data);
        io.sockets.in(room).emit('update:table', data);
        data = {playerName: player, cardCount: playedCard.length, baseCard: baseCard};
        io.sockets.in(room).emit('last:submit', data);

      }
      else {
        io.sockets.in(room).emit('submit:button', {
          error: "not successful"
        });
      }
    });

    socket.on('check:button', function (data) {
      var checkingPlayer = data.player;
      var room = data.room;

      var roomCardTracker = roomTracker.getCardTracker(room);
      var roomTableTracker = roomTracker.getTableTracker(room);
      var roomUserChanceTracker = roomTracker.getUserChanceTracker(room);
      var roomUserNames = roomTracker.getUserNames(room);

      var checkInfo = roomTableTracker.checkCards(checkingPlayer);
      roomTableTracker.addNewMove(checkingPlayer, [], '', 'check');
      // console.log(roomTableTracker.getMoveInfo());
      io.sockets.in(room).emit('display:move', {moveInfoList: roomTableTracker.getMoveInfo(), topCards: checkInfo['topCards']});
      // console.log("0-----0");
      // console.log(checkInfo);
      // roomTableTracker.sleep(3000);

      // io.emit('clear:display', {});
      if (checkInfo) {
        roomTableTracker.setConsPass(0);
        var claim, winningPlayer, losingPlayer, allCards;
        var users = roomUserNames.get();
        claim = checkInfo['claim'];
        winningPlayer = checkInfo['winningPlayer'];
        losingPlayer = checkInfo['losingPlayer'];
        allCards = checkInfo['allCards'];
        roomCardTracker.cardUpdate(losingPlayer, allCards, "add");
        var updatedChance = users.indexOf(winningPlayer);
        if (updatedChance > -1) {
          roomUserChanceTracker.setCurrentChance(updatedChance);
          io.sockets.in(room).emit('chance:change', {
            userChance: roomUserChanceTracker.getCurrentChance()
          });
        }
        roomTableTracker.cleanTable();
        var displayAnimation = {player: losingPlayer, cardCnt: allCards.length, move: 'del'};
        data = {tableCardsCnt: roomTableTracker.getTableCardsCnt(), newTurn: roomTableTracker.getNewTurn(), displayAnimation: displayAnimation, playerCardCnt: roomCardTracker.getCardCnt(users)};
        io.sockets.in(room).emit('update:table', data);
        io.to(roomUserNames.getSocketId(losingPlayer)).emit('cards:update',{
          cards: roomCardTracker.getCards(losingPlayer),
          type: "add"
        });
      }
    });


    socket.on('pass:button', function(data) {
      var player = data.player;
      var room = data.room;

      var roomCardTracker = roomTracker.getCardTracker(room);
      var roomTableTracker = roomTracker.getTableTracker(room);
      var roomUserChanceTracker = roomTracker.getUserChanceTracker(room);
      var roomUserNames = roomTracker.getUserNames(room);

      if (roomTableTracker.getConsPass() == 3)
      {
        roomTableTracker.setConsPass(0);
        roomTableTracker.cleanTable();
        data = {tableCardsCnt: roomTableTracker.getTableCardsCnt(), newTurn: roomTableTracker.getNewTurn()};
        io.sockets.in(room).emit('update:table', data);
      }
      else {
        roomUserChanceTracker.nextChance();
        roomTableTracker.addNewMove(player, [], '', 'pass');
        io.sockets.in(room).emit('display:move', {moveInfoList:roomTableTracker.getMoveInfo()});
        roomTableTracker.setConsPass(roomTableTracker.getConsPass() + 1);
      }

      io.sockets.in(room).emit('chance:change', {
        userChance: roomUserChanceTracker.getCurrentChance()
      });
    });

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
      var room = data.room;
      var name = data.user;
      // console.log(room);
      socket.broadcast.to(room).emit('send:message', {
        user: name,
        text: data.text
      });
    });

    // // validate a user's name change, and broadcast it on success
    // socket.on('change:name', function (data, fn) {
    //   if (roomUserNames.claim(data.name)) {
    //     var oldName = name;
    //     userNames.free(oldName);
    //
    //     name = data.name;
    //
    //     socket.broadcast.emit('change:name', {
    //       oldName: oldName,
    //       newName: name
    //     });
    //
    //     fn(true);
    //   } else {
    //     fn(false);
    //   }
    // });

    // clean up when a user leaves, and broadcast it to other users
    socket.on('disconnect', function () {
      // socket.broadcast.emit('user:left', {
      //   name: name
      // });
      // userNames.free(name);
    });
  });
};


// Keep track of which names are used so that there are no duplicates
var userNames = (function () {
  var names = {};
  var socketInfo = {};

  var claim = function (name) {
    if (!name || names[name]) {
      return false;
    } else {
      names[name] = true;
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
    } while (!claim(name));

    return name;
  };

  // serialize claimed names as an array
  var get = function () {
    var res = [];
    for (user in names) {
      res.push(user);
    }

    return res;
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
}());

var userChanceTracker = (function() {
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
}());

var cardTracker = (function () {
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
    console.log(playerCards);
    return true;
  };

  // update card for the player
  var cardUpdate = function(player, cards, action){
    console.log(player);
    console.log(playerCards);
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

    console.log(playerCards);
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
    console.log(sortedCards);
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

  return {
    cardDealer: cardDealer,
    cardUpdate: cardUpdate,
    get: get,
    getCards: getCards,
    initCards: initCards,
    sortCards: sortCards,
    checkWinner: checkWinner
  };
}());

var tableTracker = (function(){

  var tableHistory = [];
  var tableCardsCnt = 0;
  var newTurn = 1;
  var moveInfo = [];

  var addCards = function(player, cards, baseCard){
    var submitMoveInfo = {};
    submitMoveInfo['player'] = player;
    submitMoveInfo['cards'] = cards;
    submitMoveInfo['baseCard'] = baseCard;
    tableHistory.push(submitMoveInfo);
    tableCardsCnt += cards.length;
    console.log(tableHistory);
    console.log(tableCardsCnt);
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
    sleep: sleep
  };
}());

var consecutivePasses = 0;

var roomTracker = (function(){

  var freeRooms = ['room0', 'room1', 'room2'];
  var busyRooms = [];
  var allVariables = {};

  var createRoom = function(){
    if (freeRooms.length > 0){
      var newRoom = freeRooms[0];
      freeRooms.splice(0, 1);
      busyRooms.push(newRoom);
      console.log(freeRooms, busyRooms);
      var tmpVariablesDict = {};
      tmpVariablesDict['userNames'] = userNames;
      tmpVariablesDict['userChanceTracker'] = userChanceTracker;
      tmpVariablesDict['cardTracker'] = cardTracker;
      tmpVariablesDict['tableTracker'] = tableTracker;
      tmpVariablesDict['consecutivePasses'] = consecutivePasses;
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
    // var name = userNames.getGuestName();
    // console.log(socket.id);
    userNames.setSocketId(name, socket.id)
    // send the new user their name and a list of users
    socket.emit('init', {
      name: name,
      users: userNames.get(),
      cards: []
    });

    // notify other clients that a new user has joined
    socket.broadcast.emit('user:join', {
      name: name
    });
    var users = userNames.get();
    if (users.length == 4) {
      // console.log('usernames' + users);
      userChanceTracker.initChance();
        for (var i = 0 ; i < 4 ; i++){
            var name = users[i];
            console.log(name);
            var cards = cardTracker.initCards(name);
            console.log(name, cards);
          console.log("0-------");
            io.to(userNames.getSocketId(name)).emit('cards:update',{
                cards: cards
            });
        }
        tableTracker.cleanTable();
        var data = {tableCardsCnt: tableTracker.getTableCardsCnt(), newTurn: tableTracker.getNewTurn()};
        io.emit('update:table', data);
      io.emit('game:start', {
        userChance: userChanceTracker.getCurrentChance()
      });
    }

    socket.on('create:room', function (data) {
      // console.log(data);
      var room = roomTracker.createRoom();
      var socketId = data.socketId;
      console.log(room);
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
      io.sockets.in(room).emit('join:room', data);
    });

    socket.on('submit:name', function(data) {
      var socketId = data.socketId;
      var room = data.room;
      var newName = data.newName;
      var oldName = data.oldName;
      console.log(data);
      var roomUserNames = roomTracker.getUserNames(room);
      if (!roomUserNames){
        var data = {error: "no existing room :("};
        io.to(socketId).emit('submit:name', data);
        return;
      }
      console.log(roomUserNames.get());
      if (roomUserNames.claim(newName)) {
        roomUserNames.free(oldName);
        console.log(roomUserNames.get());
        var data = {newName: newName};
        io.to(socketId).emit('submit:name', data);
      }
      else{
        var data = {error: "name already taken !"};
        io.to(socketId).emit('submit:name', data);
      }
    });


    socket.on('submit:button', function (data) {
      var player = data.player;
      var playedCard = data.playedCard;
      var baseCard = data.baseCard;
      var winner = cardTracker.checkWinner(userNames.get());
      console.log("winner is ", winner);
      if (winner){
        var data = {winner: winner};
        io.emit('game:over', data);
      }
      var x = cardTracker.cardUpdate(player, playedCard, "delete");
      tableTracker.addNewMove(player, playedCard, baseCard, 'submit');
      io.emit('display:move', {moveInfoList: tableTracker.getMoveInfo()});
      if (x) {
        consecutivePasses = 0;
        userChanceTracker.nextChance();
        tableTracker.addCards(player, playedCard, baseCard);
          io.to(userNames.getSocketId(player)).emit('cards:update',{
              cards: cardTracker.getCards(player)
          });
        
        io.emit('chance:change', {
          userChance: userChanceTracker.getCurrentChance()
        });
          if(tableTracker.getNewTurn() == 1){
              io.emit('setBase:card', {
                 baseCard:baseCard
              });
          }
        tableTracker.setNewTurn(0);
        var displayAnimation = {player: player, cardCnt: playedCard.length, move: 'add'};
        var data = {tableCardsCnt: tableTracker.getTableCardsCnt(), newTurn: tableTracker.getNewTurn(), displayAnimation: displayAnimation};
          io.emit('update:table', data);
          data = {playerName: player, cardCount: playedCard.length, baseCard: baseCard};
          io.emit('last:submit', data);

      }
      else {
        socket.emit('submit:button', {
          error: "not successful"
        });
      }
    });

    socket.on('check:button', function (data) {
      var checkingPlayer = data.player;
      var checkInfo = tableTracker.checkCards(checkingPlayer);
      tableTracker.addNewMove(checkingPlayer, [], '', 'check');
      console.log(tableTracker.getMoveInfo());
      io.emit('display:move', {moveInfoList: tableTracker.getMoveInfo(), topCards: checkInfo['topCards']});
      console.log("0-----0");
      console.log(checkInfo);
      // tableTracker.sleep(3000);

      // io.emit('clear:display', {});
      if (checkInfo) {
        consecutivePasses = 0;
        var claim, winningPlayer, losingPlayer, allCards;
        var users = userNames.get();
        claim = checkInfo['claim'];
        winningPlayer = checkInfo['winningPlayer'];
        losingPlayer = checkInfo['losingPlayer'];
        allCards = checkInfo['allCards'];
        cardTracker.cardUpdate(losingPlayer, allCards, "add");
        var updatedChance = users.indexOf(winningPlayer);
        if (updatedChance > -1) {
          userChanceTracker.setCurrentChance(updatedChance);
          io.emit('chance:change', {
            userChance: userChanceTracker.getCurrentChance()
          });
        }
        tableTracker.cleanTable();
        var displayAnimation = {player: losingPlayer, cardCnt: allCards.length, move: 'del'};
        data = {tableCardsCnt: tableTracker.getTableCardsCnt(), newTurn: tableTracker.getNewTurn(), displayAnimation: displayAnimation};
        io.emit('update:table', data);
        io.to(userNames.getSocketId(losingPlayer)).emit('cards:update',{
          cards: cardTracker.getCards(losingPlayer),
          type: "add"
        });
      }
    });


    socket.on('pass:button', function(data) {
      var player = data.player;
      userChanceTracker.nextChance();
      tableTracker.addNewMove(player, [], '', 'pass');
      io.emit('display:move', {moveInfoList:tableTracker.getMoveInfo()});
      consecutivePasses = consecutivePasses + 1;
      if (consecutivePasses == 4){
        consecutivePasses = 0;
        tableTracker.cleanTable();
        data = {tableCardsCnt: tableTracker.getTableCardsCnt(), newTurn: tableTracker.getNewTurn()};
        io.emit('update:table', data);
      }
      io.emit('chance:change', {
        userChance: userChanceTracker.getCurrentChance()
      });
    });

    // broadcast a user's message to other users
    socket.on('send:message', function (data) {
      socket.broadcast.emit('send:message', {
        user: name,
        text: data.text
      });
    });

    // validate a user's name change, and broadcast it on success
    socket.on('change:name', function (data, fn) {
      if (userNames.claim(data.name)) {
        var oldName = name;
        userNames.free(oldName);

        name = data.name;

        socket.broadcast.emit('change:name', {
          oldName: oldName,
          newName: name
        });

        fn(true);
      } else {
        fn(false);
      }
    });

    // clean up when a user leaves, and broadcast it to other users
    socket.on('disconnect', function () {
      socket.broadcast.emit('user:left', {
        name: name
      });
      userNames.free(name);
    });
  });
};


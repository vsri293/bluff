'use strict';

var React = require('react');

var socket = io.connect();

var UsersList = React.createClass({
	render() {
		return (
			<div className='users'>
				<h3> Online Users </h3>
				<ul>
					{
						this.props.users.map((user, i) => {
							return (
								<li key={i}>
									{user}
								</li>
							);
						})
					}
				</ul>				
			</div>
		);
	}
});


var ChangeNameForm = React.createClass({
	getInitialState() {
		return {newName: ''};
	},

	onKey(e) {
		this.setState({ newName : e.target.value });
	},

	handleSubmit(e) {
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);	
		this.setState({ newName: '' });
	},

	render() {
		return(
			<div className='change_name_form'>
				<h3> Change Name </h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.onKey}
						value={this.state.newName} 
					/>
				</form>	
			</div>
		);
	}
});


var CardUI = React.createClass({
    getInitialState(){
        var cards = this.props.cards;
        // console.log("in initial state");
        // console.log(cards);
        var cardStatus = [];
        this.props.cards.map((card, i) => {
            cardStatus.push('default');
        });
        var traitList = [];
        traitList.push('dummy');
        traitList.push('clubs');
        traitList.push('diamonds');
        traitList.push('spades');
        traitList.push('hearts');
        return {cardStatus: cardStatus, traitList: traitList};
    },
    resetCardStatus(){
        var cardStatus = [];
        // console.log('in reset card status');
        this.props.cards.map((card, i) => {
            cardStatus.push('default');
        });
        // console.log(this.props.cards);
        this.setState({cardStatus: cardStatus})
    },
    handleClick(e){
        e.preventDefault(); //working ??
        if (this.props.userChanceBool == true) {
            var btnId = e.target.id;
            var tmpCardStatus = this.state.cardStatus;
            // console.log(btnId);
            if (tmpCardStatus[btnId] == 'selected') {
                tmpCardStatus[btnId] = 'default';
            }
            else {
                tmpCardStatus[btnId] = 'selected';
            }
            // console.log(tmpCardStatus);
            this.setState({cardStatus: tmpCardStatus});
        }
    },
    getSelectedCards(){
        var selectedCards = [];
        this.props.cards.map((card, i) => {
            if (this.state.cardStatus[i] == 'selected'){
                selectedCards.push(card);
            }
        });
        return selectedCards;
    },
    handleOptionClick(e){
        e.preventDefault();
        var optionId = e.target.id;
        // console.log(optionId);
        if (optionId == "submit"){
            var player = this.props.currUser;
            var playedCard = this.getSelectedCards();
            if (playedCard.length == 0){
                alert("select at least one card");
            }
            else if (!this.props.baseCard){
                alert("choose base card");
            }
            else {
                var data = {player: player, playedCard: playedCard};
                this.props.handleSubmitButton(data);
                this.resetCardStatus();
            }
        }
        else if (optionId == "check"){
            var player = this.props.currUser;
            this.resetCardStatus();
            var data = {player:player};
            this.props.handleCheckButton(data);
        }
        else if (optionId == "pass"){
            var player = this.props.currUser;
            this.resetCardStatus();
            var data = {player: player};
            this.props.handlePassButton(data);
        }
    },
    render(){
        var currUserFlag = false;
        let displayText = <h3>loading..</h3>
        let playerOptions = "";
        // matching if currUser is same as this user so that only currUser can see the cards
        if (this.props.user == this.props.currUser){
            currUserFlag = true;
        }

        if(currUserFlag){
            displayText = <div>
                {
                    this.props.cards.map((card, i) => {
                        var btnStatus = this.state.cardStatus[i];
                        var buttonValue = "";
                        var trait = parseInt(card/100);
                        var number = parseInt(card%100);
                        if (number == 1){
                            number = 'ace';
                        }
                        if (number == 11){
                            number = 'jack';
                        }
                        if (number == 12){
                            number = 'queen';
                        }
                        if (number == 13){
                            number = 'king';
                        }
                        // console.log("----------------------");
                        // console.log(number, trait, this.state.traitList[trait]);
                        var cardImgName = String(number) + "_of_" + String(this.state.traitList[trait]) + ".png";
                        // console.log(cardImgName);
                        // console.log("0-------------------");
                        var imgPath = "images/PNG-cards-1.3/" + String(cardImgName);
                        if (btnStatus == 'selected'){
                            buttonValue = <button id={i} className="displaySelectedCard" onClick={this.handleClick}>
                                <img id={i} src={imgPath} className="displaySelectedImage"/>
                            </button>
                        }
                        else{
                            buttonValue = <button id={i} className="displayDefaultCard" onClick={this.handleClick}>
                                <img id={i} src={imgPath} className="displayDefaultImage"/>
                            </button>
                        }
                        return(
                            {buttonValue}
                        );
                    })
                }
            </div>;
            if (this.props.userChanceBool == true){
                var passBtnUI = <button id="pass" onClick={this.handleOptionClick} className="btnPass">pass</button>;
                var submitBtnUI= <button id="submit" onClick={this.handleOptionClick} className="btnSubmit">submit</button>;
                var checkBtnUI= <button id="check" onClick={this.handleOptionClick} className="btnCheck">check</button>;
                if (this.props.checkNewTurn()){
                    checkBtnUI= <button id="check" className="disabledBtnCheck">check</button>;
                }
                var playedCard = this.getSelectedCards();
                if (playedCard.length == 0){
                    submitBtnUI= <button id="submit" onClick={this.handleOptionClick} className="disabledBtnSubmit">submit</button>;
                }
                playerOptions =
                    <div className="optionButtonUI">
                        {passBtnUI}
                        {submitBtnUI}
                        {checkBtnUI}
                    </div>
            }
        }
        else{
            var cardCntClass = "playerCardsCnt" + String(this.props.position);
            var cardClass = "playerCards" + String(this.props.position);
            displayText = <div>
                <img src="images/abc.png" className={cardClass}/>
                <div className={cardCntClass}>{this.props.playerCardCnt[this.props.index]}</div>
            </div>
        }
        return(
            <div>
                {playerOptions}
                {displayText}
            </div>
        );
    }
});

var PlayerUI = React.createClass({
    getPosition(user, currPlayerIndex){
        var startingIndex = this.props.users.indexOf(user);
        return (4+currPlayerIndex-startingIndex)%4;
    },

    setMoveInfo(){

    },

    render(){
        var playerClass = "player";
        var currUser = this.props.user;
        var moveInfoHistory = this.props.moveInfoHistory;
        // console.log(moveInfoHistory);
        return(
            <div>
            {
                this.props.users.map((user, i) => {
                    var position = this.getPosition(currUser, i);
                    var currPlayerClass = playerClass + String(position);
                    var userChance = this.props.userChance;
                    var userChanceBool = false;
                    var moveInfo = moveInfoHistory[i];
                    // console.log(i, moveInfo);
                    var playerMoveInfo = null;
                    if (i == userChance){
                        userChanceBool = true;
                        // console.log("here in playerui");
                        // console.log(this.props.user , currUser, playerMoveInfo);
                        if (user != currUser && !playerMoveInfo) {
                            // console.log(user + " " + currUser);
                            playerMoveInfo = <div className="moveplaying">playing...</div>
                        }
                    }
                    else {
                        playerMoveInfo = <div className="emptyMoveDiv">playing...</div>;
                    }
                    // console.log(playerMoveInfo);
                    // console.log("userChance - " + String(userChance) + ", " + "i - " + String(i));
                    if (moveInfo && moveInfo['move']) {
                        var divClass = "move" + moveInfo['move'];
                        // console.log("err", moveInfo, this.props.users[i]);
                        if (moveInfo['move'] == 'submit'){
                            var d = {color: "yellow"};
                            playerMoveInfo = <div className={divClass}>
                                <span style={{color: "black"}}> {moveInfo['display']} </span>
                                <span style={d}> {this.props.baseCard}</span>
                            </div>;
                        }
                        else {
                            playerMoveInfo = <div className={divClass}>{moveInfo['display']}</div>;
                        }
                    }


                    // console.log(userChanceBool);
                    // console.log(user, currUser, currPlayerClass);
                    if (user != currUser) {
                        var userName =
                            <h3 style={{color: "navajowhite"}}>{user}</h3>;
                    }
                    var CardUIDiv =
                        <CardUI
                            index={i}
                            user={user}
                            currUser={currUser}
                            cards={this.props.cards}
                            baseCard={this.props.baseCard}
                            userChanceBool={userChanceBool}
                            position={position}
                            playerCardCnt={this.props.playerCardCnt}
                            checkNewTurn={this.props.checkNewTurn}
                            handleSubmitButton={this.props.handleSubmitButton}
                            handleCheckButton={this.props.handleCheckButton}
                            handlePassButton={this.props.handlePassButton}
                        />;
                    return (
                        <div className={currPlayerClass}>
                            {playerMoveInfo}
                            {userName}
                            {CardUIDiv}
                        </div>
                    );
                })
            }
          </div>
        );
    }
});


var TableUI = React.createClass({
    getInitialState() {
        var rankList = [];
        for (var i = 1 ; i < 14 ; i++){
            var rankInfo = {};
            var name = String(i);
            if (i==1){
                name = 'A';
            }
            if (i==11){
                name = 'J';
            }
            if (i==12){
                name = 'Q';
            }
            if (i==13){
                name = 'K';
            }
            rankInfo['name'] = name;
            rankInfo['value'] = i;
            rankList.push(rankInfo);
        }
        var traitList = [];
        traitList.push('dummy');
        traitList.push('clubs');
        traitList.push('diamonds');
        traitList.push('spades');
        traitList.push('hearts');
        return ({rankList: rankList, showList: false, selectedRank: "choose rank", traitList:traitList});
    },

    handleClick(e){
        e.preventDefault(); //working ??
        // console.log(e);
    },

    select(item){
        this.setState({selectedRank: item.name});
        this.toggle();
        this.props.setNewBaseCard(item);
    },

    renderListItems(){
        var items = [];
        for (var i = 0 ; i < this.state.rankList.length; i++){
            var item = this.state.rankList[i];
            items.push(<div onClick={this.select.bind(null, item)} className="rankItem">{item.name}
            </div>);
        }
        return items;
    },

    toggle(){
        // console.log(this.state);
        if (this.state.showList){
            this.props.setModalUI("hide");
            this.setState({showList: false});
        }
        else{
            this.props.setModalUI("show");
            this.setState({showList: true});
        }
    },

    getBaseCardName(baseCard){
        if (!baseCard){
            return 'Choose card';
        }
        baseCard = parseInt(baseCard);
        if (baseCard==1){
            return 'A';
        }
        if (baseCard==11){
            return 'J';
        }
        if (baseCard==12){
            return 'Q';
        }
        if (baseCard==13){
            return 'K';
        }
        return String(baseCard);
    },

    render(){
        // console.log("here in TableUI");
        // console.log(this.props.tableCardsCnt);
        var currUser = this.props.user;
        var users = this.props.users;
        var userChance = this.props.userChance;
        var newTurn = this.props.newTurn;
        var userChanceBool = false;
        if (users[userChance] == currUser){
            userChanceBool = true;
        }
        var selectedRank = this.props.baseCard;

        // console.log("table ui");
        // console.log(newTurn);
        // console.log(userChanceBool);
        // console.log("----");
        if (newTurn == 0){
            var cnt = this.props.tableCardsCnt;
            // var tableInfo = <div className="tableInfo">Base Card: {this.props.baseCard}</div>;
            var baseCardSelector =
                <div>
                    <span className="dropdown-display-disabled">{this.getBaseCardName(this.props.baseCard)}</span>
                </div>;
            var tableCardsUI = <div>
                <img src="images/abc.png" className="displayTableCard"/>;
                <div className="displayTableCnt">{cnt}</div>;
            </div>;
        }
        else{
            // var tableInfo = <div className="tableInfo">Choose base card
            // </div>
        }
        if (userChanceBool && newTurn){
            // var tableInfo = <div className="tableInfo">Choose Base Card</div>;
            var baseCardSelector =
                <div onClick={this.toggle}>
                    <span className="dropdown-display">{this.getBaseCardName(this.props.baseCard)}</span>
                </div>;
            // if (this.state.showList){
            //
            //     var rankListUI = <div className="myModal">
            //             <div className="rankList">{this.renderListItems()}</div></div>;
            // }
        }
        if (this.props.displayCards){
            // console.log("display cards", this.props.displayCards);
            var displayCardUI = <div className="displayModal">
                <div className="displayCardUI"> {
                    this.props.displayCards.map((card, i) => {
                        var buttonValue = "";
                        var trait = parseInt(card/100);
                        var number = parseInt(card%100);
                        if (number == 1){
                            number = 'ace';
                        }
                        if (number == 11){
                            number = 'jack';
                        }
                        if (number == 12){
                            number = 'queen';
                        }
                        if (number == 13){
                            number = 'king';
                        }
                        var cardImgName = String(number) + "_of_" + String(this.state.traitList[trait]) + ".png";
                        // console.log(cardImgName);
                        var imgPath = "images/PNG-cards-1.3/" + String(cardImgName);
                        // console.log(imgPath);
                        buttonValue =
                            <button id={i} className="displayDefaultCard">
                                <img id={i} src={imgPath} className="displayDefaultImage"/>
                            </button>;
                        return(
                            {buttonValue}
                        );
                    })
                }
                </div>
            </div>
        }
        return(
            <div className="tableUI">
                {displayCardUI}
                
                {tableCardsUI}
                {baseCardSelector}
            </div>
        );
    }
});

var Message = React.createClass({
    render() {
        if (this.props.type == "normal") {
            var msgStyle = {flexDirection: "row-reverse"};
            var colorMsgStyle = {color: "white", backgroundColor: "#3088bb", marginLeft: "37px", marginRight: "3px"};
        }
        else{
            var userName = <strong>{this.props.user}: </strong>;
            var colorMsgStyle = {marginRight: "37px", marginLeft: "3px"};
        }

        return (
            <div className="message" style={msgStyle}>
                <div className="colorMessage" style={colorMsgStyle}>
                    {userName}
                    <span>{this.props.text}</span>
                </div>
            </div>
        );
    }
});

var MessageList = React.createClass({
    render() {
        return (
            <div className='messages'>
                {
                    this.props.messages.map((message, i) => {
                        return (
                            <Message
                                key={i}
                                user={message.user}
                                text={message.text}
                                type={message.type}
                            />
                        );
                    })
                }
            </div>
        );
    }
});

var MessageForm = React.createClass({

    getInitialState() {
        return {text: ''};
    },

    handleSubmit(e) {
        e.preventDefault();
        var message = {
            user : this.props.user,
            text : this.state.text
        };
        this.props.onMessageSubmit(message);
        this.setState({ text: '' });
    },

    changeHandler(e) {
        this.setState({ text : e.target.value });
    },

    render() {
        return(
            <div className='message_form'>
                <form onSubmit={this.handleSubmit}>
                    <input
                        onChange={this.changeHandler}
                        value={this.state.text}
                        placeholder="type a message"
                        maxLength="50"
                        className="inputMsg"
                    />
                </form>
            </div>
        );
    }
});

var MessageTab = React.createClass({
    getInitialState(){
        return {showFlag: true};
    },

    handleClick(e){
        // console.log("here");
        e.preventDefault();
        var tmpShowFlag = !(this.state.showFlag);
        // console.log(this.state.showFlag, tmpShowFlag);
        this.setState({showFlag: tmpShowFlag});
        this.props.setMessageBar(tmpShowFlag);
    },

    render(){
        if (this.state.showFlag){
            var tabClass = "messageTabUI-open";
        }
        else{
            var tabClass = "messageTabUI-close";
        }
        return(
            <div className={tabClass} onClick={this.handleClick}>

            </div>
        );
    }
});

var MessageBar = React.createClass({
    getInitialState(){
        return {messages: [], showMessageBar: true}
    },

    componentDidMount() {
        socket.on('send:message', this._messageRecieve);
    },

    scrollElement(messageBar){
        window.requestAnimationFrame(function(){
           messageBar.getDOMNode().scrollTop = messageBar.getDOMNode().scrollHeight;
        });
    },

    componentDidUpdate(){
        if (this.domMessageBar) {
            // console.log("here in refs");
            // console.log(this.domMessageBar.getDOMNode().scrollHeight, this.domMessageBar.getDOMNode().offsetTop);
            // this.scrollElement(this.domMessageBar);
            this.domMessageBar.getDOMNode().scrollTop = this.domMessageBar.getDOMNode().scrollHeight;
        }
    },

    _messageRecieve(message) {
        var {messages} = this.state;
        message['type'] = "reverse";            // for other users type is reverse
        messages.push(message);
        this.setState({messages});
    },

    onMessageSubmit(message){
        var {messages} = this.state;
        var data = {text: message.text, user: message.user, room: this.props.room};
        socket.emit('send:message', data);
        message['type'] = "normal";
        messages.push(message);
        this.setState({messages});
    },

    setMessageBar(flag){
        // console.log(flag);
        this.setState({showMessageBar: flag});
    },

    render(){
        if (this.state.showMessageBar) {
            // console.log("here in return");
            var messageBar =
                <div className="messageBarUI"
                    >
                    <MessageList ref={messageBar => {this.domMessageBar = messageBar;}}
                        messages={this.state.messages}
                    />
                    <MessageForm
                        user={this.props.user}
                        onMessageSubmit={this.onMessageSubmit}
                    />
                </div>;
            // var domNode = this.domMessageBar.getDOMNode();
            // console.log(domNode);
            // domNode.scrollTop = domNode.scrollHeight;
            // this.domMessageBar.scrollHeight;

        }
        return(
            <div>
                <MessageTab
                    setMessageBar={this.setMessageBar}
                />
                {messageBar}

            </div>
        );
    }
});

var IntroPageUI = React.createClass({
    getInitialState() {
        return {inputName: '', inputRoom: '', inputNameFlag: false, inputRoomFlag: true, name: '', room: '', pageInfo: '', waitPageFlag: false, roomInfo: []};
    },

    handleSubmit(e) {

        if (e.target.id == "createRoom"){
           // console.log("created room");
           this.props.handleCreateRoom();
        }
        else if (e.target.id == "joinRoom"){
           // console.log(this.state.room);
           this.props.handleJoinRoom(this.state.inputRoom);
        }
        else if(e.target.id == "submitName"){
            this.props.handleSubmitName(this.state.inputName, this.state.name);
        }
    },

    changeHandler(e) {
        if (e.target.id == "inputRoom"){
            this.setState({ inputRoom : e.target.value });
        }
        if (e.target.id == "inputName"){
            this.setState({ inputName : e.target.value });
        }
    },

    setRespRoom(respRoom){
        // console.log(respRoom);
        var {error, room, name} = respRoom;
        if (error){
            alert(error);
        }
        else{
            var roomInfo = this.state.roomInfo;
            var tmpInfo = <div>Room - {room}</div>;
            roomInfo.push(tmpInfo);
            for (var i = 0 ; i < this.props.users.length ; i++)
                roomInfo.push(users[i]);
            this.setState({inputNameFlag: true, waitPageFlag:true, inputRoomFlag: false, room: room, name: name, roomInfo: roomInfo});
            this.props.setRoom(room);
        }
    },

    setRespName(respName){
        // console.log(respName);
        var {error, newName} = respName;
        if (error){
            alert(error);
            this.clearInputValue();
        }
        if (newName){
            this.setState({name: newName});
            this.waitScreen();
        }
    },

    clearInputValue(){
        this.setState({inputName: ''})
    },
    
    waitScreen(){
        this.setState({inputNameFlag: false, waitPageFlag: true});
    },
    
    render(){
        if (this.state.inputNameFlag) {
            var inputNameUI = <div>
                <input
                    onChange={this.changeHandler}
                    value={this.state.inputName}
                    placeholder="enter name"
                    maxLength="10"
                    className="inputName"
                    id="inputName"
                />
                <button
                    onClick={this.handleSubmit}
                    className="submitName"
                    id="submitName"
                >
                    Submit
                </button>
            </div>;
        }
        else{
            var inputNameUI =
            <div
                className="nameIntro">
                {this.state.name}
            </div>;
        }
        if (this.state.inputRoomFlag){
            var inputRoomUI = <div>
                <button
                    onClick={this.handleSubmit}
                    className="createRoom"
                    id="createRoom"
                >
                    Create new room
                </button>
                <input
                    onChange={this.changeHandler}
                    value={this.state.text}
                    placeholder="enter room name"
                    className="inputRoom"
                    id="inputRoom"
                />
                <button
                    onClick={this.handleSubmit}
                    className="joinRoom"
                    id="joinRoom"
                >
                    Join room
                </button>
            </div>
        }
        if (this.state.waitPageFlag){
            var waitPageUI = <div>
                <div
                    className="roomNameIntro">{
                        this.state.roomInfo.map((info) => {
                            return(
                                <div>
                                    {info}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        }
        return (
            <div>
                {inputNameUI}
                {inputRoomUI}
                {waitPageUI}
            </div>
        )
    }
});


var GameUI = React.createClass({
    getInitialState(){
        return {users: [], displayCards: null, moveInfoHistory: [], baseCard: '1', messages:[], text: '',
            tableCardsCnt: "0", newTurn: 1, introPageFlag: true, gamePageFlag: false, endPageFlag: false,
            cards: [], playerCardCnt: []}
    },

    componentDidMount() {
        socket.on('init', this._initialize);
        // socket.on('send:message', this._messageRecieve);
        socket.on('user:join', this._userJoined);
        socket.on('user:left', this._userLeft);
        socket.on('change:name', this._userChangedName);
        socket.on('game:start', this._gameStart);
        socket.on('submit:button', this._submitButton);
        socket.on('chance:change', this._chanceChange);
        socket.on('cards:update', this._updateCards);
        socket.on('update:table', this._updateTable);
        socket.on('last:submit', this._lastSubmit);
        socket.on('setBase:card', this._setBaseCard);
        socket.on('display:move', this._displayMove);
        socket.on('clear:display', this._clearDisplay);
        socket.on('game:over', this._gameOver);
        socket.on('create:room', this._createRoom);
        socket.on('join:room', this._joinRoom);
        socket.on('submit:name', this._submitName);
    },

    _initialize(data) {
        // console.log(data);
        var {users, cards} = data;
        this.setState({users:users, cards:cards});
        var rankList = [];
        for (var i = 1 ; i < 14 ; i++){
            var rankInfo = {};
            var name = String(i);
            if (i==1){
                name = 'A';
            }
            if (i==11){
                name = 'J';
            }
            if (i==12){
                name = 'Q';
            }
            if (i==13){
                name = 'K';
            }
            rankInfo['name'] = name;
            rankInfo['value'] = i;
            rankList.push(rankInfo);
        }
        var traitList = [];
        traitList.push('dummy');
        traitList.push('clubs');
        traitList.push('diamonds');
        traitList.push('spades');
        traitList.push('hearts');
        this.setState({rankList: rankList, showList: false, selectedRank: "choose rank", traitList:traitList});
    },

    _messageRecieve(message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
    },

    _userJoined(data) {
        var {newUsers} = data;
        // users.push(name);
        // messages.push({
        //     user: 'APPLICATION BOT',
        //     text : name +' Joined'
        // });
        // console.log("here in user joined ", newUsers);
        this.setState({users: newUsers});
    },

    _userLeft(data) {
        var {users, messages} = this.state;
        var {name} = data;
        var index = users.indexOf(name);
        users.splice(index, 1);
        messages.push({
            user: 'APPLICATION BOT',
            text : name +' Left'
        });
        this.setState({users, messages});
    },

    _userChangedName(data) {
        var {oldName, newName} = data;
        var {users, messages} = this.state;
        var index = users.indexOf(oldName);
        users.splice(index, 1, newName);
        messages.push({
            user: 'APPLICATION BOT',
            text : 'Change Name : ' + oldName + ' ==> '+ newName
        });
        this.setState({users, messages});
    },

    _gameStart(data) {
        // // console.log("userchance");
        // // console.log(data);
        // // console.log("--");
        var {userChance} = data;
        this.setState({userChance: userChance});
    },

    _submitButton(data) {
        var {name, cards, error} = data;
        // // console.log('in _submit button');
        // // console.log(data);
        if (error){
            // console.log("unsuccessfull");
        }
        else {
            this.setState({cards: cards});
        }
    },

    _chanceChange(data){
        var {userChance} = data;
        this.setState({userChance: userChance});
    },

    _updateCards(data){
        var {cards} = data;
        // console.log("in update cards");
        // console.log(cards);
        this.setState({cards: cards});
    },

    clearUI(){
        // console.log("here in clearUI");
        this.setState({animationUI: {}});
    },

    _updateTable(data){
        console.log("in _updateTable");
        // // // console.log(data);
        var {tableCardsCnt, newTurn, displayAnimation, playerCardCnt} = data;
        // console.log(displayAnimation);
        if (displayAnimation){
            var {player, cardCnt, move} = displayAnimation;
            // console.log(player, cardCnt, move);
            if (move == "add"){
                var currPlayerIndex = this.state.users.indexOf(player);
                var pos = this.getPosition(this.state.user, currPlayerIndex);
                var imgPath = "images/abc.png";
                var playerClass = "animateAddingCard" + String(pos);
                // console.log(playerClass);
                var animationUI = <div className={playerClass}>
                    <img src={imgPath} className="displayDefaultImage"/>
                </div>;
                // console.log(animationUI);
                this.setState({animationUI: animationUI});
            }
            if (move == "del"){
                var currPlayerIndex = this.state.users.indexOf(player);
                var pos = this.getPosition(this.state.user, currPlayerIndex);
                var imgPath = "images/abc.png";
                var playerClass = "animateDelCard" + String(pos);
                // console.log(playerClass);
                var animationUI = <div className={playerClass}>
                    <img src={imgPath} className="displayDefaultImage"/>
                </div>;
                // console.log(animationUI);
                this.setState({animationUI: animationUI});
            }
            setTimeout(this.clearUI, 900);
        }

        if (newTurn == 1){
            this.setState({moveInfoHistory: [], baseCard: ''});
        }

        if (playerCardCnt){
            console.log("playerCard Cnt ");
            console.log(cardCnt);
            this.setState({playerCardCnt: playerCardCnt});
        }
        this.setState({tableCardsCnt: tableCardsCnt, newTurn: newTurn});
    },

    _lastSubmit(data){
        var {playerName, cardCount, baseCard} = data;
        this.setState({lastSubmitMove: data});
    },

    _setBaseCard(data){
        var {baseCard} = data;
        this.setState({baseCard: baseCard});
    },

    _displayMove(data){
        var tmpMoveInfoHistory = [];
        tmpMoveInfoHistory.push({});
        tmpMoveInfoHistory.push({});
        tmpMoveInfoHistory.push({});
        tmpMoveInfoHistory.push({});
        // console.log(data);
        var {moveInfoList, topCards} = data;
        // console.log(topCards);
        for (var i = 0 ; i < moveInfoList.length ; i++){
            var moveInfo = moveInfoList[i];
            // console.log("***********");
            // console.log(moveInfo);
            var {player, cnt, baseCard, moveType} = moveInfo;
            var display = '';
            if (moveType == 'submit'){
                display = String(cnt);
            }
            else if(moveType == 'pass'){
                display = 'pass';
            }
            else{
                display = 'check';
            }
            // console.log(this.state.users.indexOf(player), display);
            // console.log("***********");
            tmpMoveInfoHistory[this.state.users.indexOf(player)] = {display: display, move: moveType};
        }
        // console.log('in display move');
        // console.log(tmpMoveInfoHistory);
        // console.log("------");
        this.setState({moveInfoHistory: tmpMoveInfoHistory});
        if (topCards) {
            this.setState({displayCards: topCards});
            setTimeout(this.clearCards, 2000);
        }
    },

    _gameOver(data){
        // console.log(data);
        alert(data['winner']);
        this.setGameOverPage();
    },

    _createRoom(data){
        // console.log(data);
        this.introPageRef.setRespRoom(data);
    },

    _joinRoom(data){
        // console.log(data);
        this.introPageRef.setRespRoom(data);
    },

    _submitName(data){
        // console.log(data);
        var {error, newName} = data;
        if (error){
            alert(error);
        }
        if (newName){
            this.setState({user: newName, gamePageFlag: true, introPageFlag: false});
        }
        // this.introPageRef.setRespName(data);
    },

    getPosition(user, currPlayerIndex){
        var startingIndex = this.state.users.indexOf(user);
        return (4+currPlayerIndex-startingIndex)%4;
    },

    clearCards(data){
        this.setState({displayCards: null});
    },

    handleSubmitButton(data){
        var tmpData = {};
        // // console.log("-----");
        // console.log(socket.id);
        // console.log("-----");
        var {player, playedCard} = data;
        tmpData['player'] = player;
        tmpData['playedCard'] = playedCard;
        tmpData['baseCard'] = this.state.baseCard;
        tmpData['room'] = this.state.room;
        socket.emit('submit:button', tmpData);
        // console.log('in handle submit button');
        // console.log(data);
    },

    handlePassButton(data){
        data['room'] = this.state.room;
        socket.emit('pass:button', data);
    },

    handleCheckButton(data){
        var {player} = data;
        data['room'] = this.state.room;
        socket.emit('check:button', data);

        // console.log("in handle check button");
        // console.log(data);
    },

    setNewBaseCard(data){
        // console.log('in setNewBaseCard');
        // console.log(data);
        this.setState({baseCard: data.value});
    },

    getBaseCardName(baseCard){
        if (baseCard==0){
            return 'A';
        }
        if (baseCard==11){
            return 'J';
        }
        if (baseCard==12){
            return 'Q';
        }
        if (baseCard==13){
            return 'K';
        }
        return String(baseCard);
    },

    select(item){
        // this.setState({selectedRank: item.name});
        this.child.toggle();
        this.setNewBaseCard(item);
    },

    renderListItems(){
        var items = [];
        for (var i = 0 ; i < this.state.rankList.length; i++){
            var item = this.state.rankList[i];
            items.push(<div onClick={this.select.bind(null, item)} className="rankItem">{item.name}
            </div>);
        }
        return items;
    },

    setModalUI(data){
        // console.log(data);
        if (data == "show"){
            var rankListUI = <div className="myModal">
                    <div className="rankList">{this.renderListItems()}</div></div>;
            this.setState({modalUI: rankListUI});
        }
        if (data == "hide"){
            this.setState({modalUI: null});
        }
    },

    sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0 ; i<100; i) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    },

    checkNewTurn(){
        return this.state.newTurn;
    },

    handleCreateRoom(){
        var data = {socketId: socket.id};
        socket.emit('create:room', data);
    },

    handleJoinRoom(room){
        var data = {socketId: socket.id, room: room};
        socket.emit('join:room', data);
    },

    handleSubmitName(newName, oldName){
        var data = {socketId: socket.id, room: this.state.room, newName: newName, oldName: oldName};
        socket.emit('submit:name', data);
    },

    setRoom(room){
        this.setState({room: room});
    },

    setGameOverPage(){
        
    },

    render() {
        var animationUI = this.state.animationUI;
        var modalUI = this.state.modalUI;
        // console.log("main ", animationUI);
        if (this.state.gamePageFlag){
            var gamePageUI = <div>
                <MessageBar
                    user={this.state.user}
                    room={this.state.room}
                />
                <TableUI ref={instance => { this.child = instance; }}
                         tableCardsCnt={this.state.tableCardsCnt}
                         baseCard={this.state.baseCard}
                         newTurn={this.state.newTurn}
                         users={this.state.users}
                         user={this.state.user}
                         userChance={this.state.userChance}
                         displayCards={this.state.displayCards}
                         setNewBaseCard={this.setNewBaseCard}
                         setModalUI={this.setModalUI}
                />
                <PlayerUI
                    users={this.state.users}
                    user={this.state.user}
                    cards={this.state.cards}
                    userChance={this.state.userChance}
                    baseCard={this.state.baseCard}
                    moveInfoHistory={this.state.moveInfoHistory}
                    playerCardCnt={this.state.playerCardCnt}
                    checkNewTurn={this.checkNewTurn}
                    handleSubmitButton={this.handleSubmitButton}
                    handleCheckButton={this.handleCheckButton}
                    handlePassButton={this.handlePassButton}
                />
                {modalUI}
                {animationUI}

            </div>
        }
        else if (this.state.introPageFlag){
            var introPageUI = <div>
                <IntroPageUI
                    ref={instance => { this.introPageRef = instance; }}
                    users= {this.state.users}
                    handleCreateRoom = {this.handleCreateRoom}
                    handleJoinRoom = {this.handleJoinRoom}
                    handleSubmitName = {this.handleSubmitName}
                    setRoom = {this.setRoom}
                />

            </div>
        }

        return(
            <div>
                {introPageUI}
                {gamePageUI}
            </div>
        );
    }
});

React.render(<GameUI/>, document.getElementById('app'));
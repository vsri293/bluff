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

var Message = React.createClass({
	render() {
		return (
			<div className="message">
				<strong>{this.props.user} :</strong> 
				<span>{this.props.text}</span>		
			</div>
		);
	}
});

var MessageList = React.createClass({
	render() {
		return (
			<div className='messages'>
				<h2> Conversation: </h2>
				{
					this.props.messages.map((message, i) => {
						return (
							<Message
								key={i}
								user={message.user}
								text={message.text} 
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
		}
		this.props.onMessageSubmit(message);	
		this.setState({ text: '' });
	},

	changeHandler(e) {
		this.setState({ text : e.target.value });
	},

	render() {
		return(
			<div className='message_form'>
				<h3>Write New Message</h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.changeHandler}
						value={this.state.text}
					/>
				</form>
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
            var data = {player: player, playedCard: playedCard};
            this.props.handleSubmitButton(data);
            this.resetCardStatus();
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
                        console.log("----------------------");
                        console.log(number, trait, this.state.traitList[trait]);
                        var cardImgName = String(number) + "_of_" + String(this.state.traitList[trait]) + ".png";
                        console.log(cardImgName);
                        console.log("0-------------------");
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
                playerOptions =
                    <div>
                        <button id="pass" onClick={this.handleOptionClick} className="btnPass">pass</button>
                        <button id="submit" onClick={this.handleOptionClick} className="btnSubmit">submit</button>
                        <button id="check" onClick={this.handleOptionClick} className="btnCheck">check</button>
                    </div>
            }
        }
        else{
            displayText =
                <h3 className="playerCardsCnt">{this.props.cards.length}</h3>
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
                    var playerMoveInfo = null;
                    // console.log(playerMoveInfo);
                    // console.log("userChance - " + String(userChance) + ", " + "i - " + String(i));
                    if (moveInfo && moveInfo['move']) {
                        var divClass = "move" + moveInfo['move'];
                        // console.log("err", moveInfo, this.props.users[i]);
                        playerMoveInfo = <div className={divClass}>{moveInfo['display']}</div>;
                    }

                    if (i == userChance){
                        userChanceBool = true;
                        // console.log("here in playerui");
                        // console.log(this.props.user , currUser, playerMoveInfo);
                        if (user != currUser && !playerMoveInfo) {
                            // console.log(user + " " + currUser);
                            playerMoveInfo = <div className="moveplaying">playing...</div>
                        }
                    }
                    // console.log(userChanceBool);

                    if (user != currUser) {
                        var userName =
                            <h3>{user}</h3>;
                    }
                    var CardUIDiv =
                        <CardUI
                            user={user}
                            currUser={currUser}
                            cards={this.props.cards}
                            baseCard={this.props.baseCard}
                            userChanceBool={userChanceBool}
                            setMoveInfo = {this.setMoveInfo}
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
        for (var i = 0 ; i < 14 ; i++){
            var rankInfo = {};
            var name = String(i);
            if (i==0){
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
            this.setState({showList: false});
        }
        else{
            this.setState({showList: true});
        }
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
            var cnt = <h3>{this.props.tableCardsCnt}</h3>;
            var baseCard = <h3>Base Card: {this.props.baseCard}</h3>;
            var tableInfo = <div>
                {cnt}
                {baseCard}
            </div>
        }
        else{
            var tableInfo = <div>
                <h3>{users[userChance]} playing...</h3>
            </div>
        }
        if (userChanceBool && newTurn){
            tableInfo = <h3>Base Card</h3>
            var baseCardSelector =
                <div onClick={this.toggle}>
                    <span className="dropdown-display">{this.props.baseCard}</span>
                </div>;
            if (this.state.showList) {
                var rankListUI = <div className="myModal">
                        <div className="rankList">{this.renderListItems()}</div></div>;
            }
        }
        if (this.props.displayCards){
            console.log("display cards", this.props.displayCards);
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
                        console.log(cardImgName);
                        var imgPath = "images/PNG-cards-1.3/" + String(cardImgName);
                        console.log(imgPath);
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
                {tableInfo}
                {baseCardSelector}
                {rankListUI}
            </div>
        );
    }
});

var GameUI = React.createClass({
    getInitialState(){
        return {users: [], displayCards: null, moveInfoHistory: [], baseCard: '', messages:[], text: '', tableCardsCnt: "0", newTurn: 1}
    },

    componentDidMount() {
        socket.on('init', this._initialize);
        socket.on('send:message', this._messageRecieve);
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
    },

    _initialize(data) {
        console.log(data);
        var {users, name, cards} = data;
        this.setState({users:users, user: name, cards:cards});
    },

    _messageRecieve(message) {
        var {messages} = this.state;
        messages.push(message);
        this.setState({messages});
    },

    _userJoined(data) {
        var {users, messages} = this.state;
        var {name} = data;
        users.push(name);
        messages.push({
            user: 'APPLICATION BOT',
            text : name +' Joined'
        });
        this.setState({users, messages});
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
        // console.log("userchance");
        // console.log(data);
        // console.log("--");
        var {userChance} = data;
        this.setState({userChance: userChance});
    },

    _submitButton(data) {
        var {name, cards, error} = data;
        // console.log('in _submit button');
        // console.log(data);
        if (error){
            console.log("unsuccessfull");
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

    _updateTable(data){
        // console.log("in _updateTable");
        // console.log(data);
        var {tableCardsCnt, newTurn} = data;
        if (newTurn == 1){
            this.setState({moveInfoHistory: [], baseCard: ''});
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
        console.log(topCards);
        for (var i = 0 ; i < moveInfoList.length ; i++){
            var moveInfo = moveInfoList[i];
            // console.log("***********");
            // console.log(moveInfo);
            var {player, cnt, baseCard, moveType} = moveInfo;
            var display = '';
            if (moveType == 'submit'){
                display = String(cnt) + " " + String(this.getBaseCardName(baseCard));            }
            else if(moveType == 'pass'){
                display = 'pass';
            }
            else{
                display = 'check';
            }
            // console.log(this.state.users.indexOf(player), display);
            // console.log("***********");
            tmpMoveInfoHistory[this.state.users.indexOf(player)] = {display: display, move:moveType};
        }
        console.log('in display move');
        console.log(tmpMoveInfoHistory);
        console.log("------");
        this.setState({moveInfoHistory: tmpMoveInfoHistory});
        if (topCards) {
            this.setState({displayCards: topCards});
            setTimeout(this._clearDisplay, 3000);
        }
    },

    _clearDisplay(data){
        this.setState({displayCards: null});
    },

    handleSubmitButton(data){
        var tmpData = {};
        // console.log("-----");
        // console.log(socket.id);
        // console.log("-----");
        var {player, playedCard} = data;
        tmpData['player'] = player;
        tmpData['playedCard'] = playedCard;
        tmpData['baseCard'] = this.state.baseCard;
        socket.emit('submit:button', tmpData);
        // console.log('in handle submit button');
        // console.log(data);
    },

    handlePassButton(data){
        socket.emit('pass:button', data);
    },

    handleCheckButton(data){
        var {player} = data;
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

    sleep(milliseconds) {
        var start = new Date().getTime();
        for (var i = 0 ; i<100; i) {
            if ((new Date().getTime() - start) > milliseconds){
                break;
            }
        }
    },

    render() {
        return(
            <div>
                <PlayerUI
                    users={this.state.users}
                    user={this.state.user}
                    cards={this.state.cards}
                    userChance={this.state.userChance}
                    baseCard={this.state.baseCard}
                    moveInfoHistory={this.state.moveInfoHistory}
                    handleSubmitButton={this.handleSubmitButton}
                    handleCheckButton={this.handleCheckButton}
                    handlePassButton={this.handlePassButton}
                />
                <TableUI
                    tableCardsCnt={this.state.tableCardsCnt}
                    baseCard={this.state.baseCard}
                    newTurn={this.state.newTurn}
                    users={this.state.users}
                    user={this.state.user}
                    userChance={this.state.userChance}
                    displayCards={this.state.displayCards}
                    setNewBaseCard={this.setNewBaseCard}
                />
            </div>
        );
    }
});

var ChatApp = React.createClass({

	getInitialState() {
		return {users: [], messages:[], text: ''};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:message', this._messageRecieve);
		socket.on('user:join', this._userJoined);
		socket.on('user:left', this._userLeft);
		socket.on('change:name', this._userChangedName);
        socket.on('game:start', this._gameStart);
	},

	_initialize(data) {
		var {users, name} = data;
        var cards = [];
        cards.push(1);
        cards.push(2);
		this.setState({users, user: name, cards:cards});
	},

	_messageRecieve(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
	},

	_userJoined(data) {
		var {users, messages} = this.state;
		var {name} = data;
		users.push(name);
		messages.push({
			user: 'APPLICATION BOT',
			text : name +' Joined'
		});
		this.setState({users, messages});
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
        console.log("userChance" + data);
        var {userChance} = data;
        this.setState({userChance: userChance});
    },

	handleMessageSubmit(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
		socket.emit('send:message', message);
	},

	handleChangeName(newName) {
		var oldName = this.state.user;
		socket.emit('change:name', { name : newName}, (result) => {
			if(!result) {
				return alert('There was an error changing your name');
			}
			var {users} = this.state;
			var index = users.indexOf(oldName);
			users.splice(index, 1, newName);
			this.setState({users, user: newName});
		});
	},

	render() {
		return (
			<div>
				<GameUI
                    users={this.state.users}
                    user={this.state.user}
                    cards={this.state.cards}
                    userChance={this.state.userChance}
                />
			</div>
		);
	}
});

React.render(<GameUI/>, document.getElementById('app'));
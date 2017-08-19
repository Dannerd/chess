/**
 * Created by Daniel on 23/06/2017.
 */
function Chess(size){
    createCanvas(size, size + 100);

    this.rowscols = 8;
    this.size = size;
    this.squaresize = this.size/this.rowscols;

    this.board = [];
    this.pieces = [];
    this.moves = [];
    this.curplayer = 1;
    this.players = [];
}



Chess.prototype.serverPing = 300;





Chess.prototype.range = function(min,max){
    return Math.floor(Math.random()*(max-min+1)+min);
};
Chess.prototype.game_id = Chess.prototype.range(0, 1000000);

Chess.prototype.myplayer = {
    color: 1,
    taken: []
};

Chess.prototype.resize = function(size){
    resizeCanvas(size, size + 100);
    this.size = size;
    this.squaresize = this.size/this.rowscols;
};


Chess.prototype.colors = ["Black", "White"];

var loadedAssets = {};

var loadAsset = function(x){
    if(!loadedAssets[x]){
        loadedAssets[x] = loadImage(x);
    }

    return loadedAssets[x];
};


Chess.prototype.api = function(x){return "api/"+x+".php";};



Chess.prototype._post = function(data, callback){
    var game = this;
    var http = new XMLHttpRequest();
    var url = game.api("save");

    var params = data;
    http.open("POST", url, true);

//Send the proper header information along with the request
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

    http.onreadystatechange = function() {//Call a function when the state changes.
        if(http.readyState === 4 && http.status === 200) {
            if(typeof callback==="function"){
                callback.bind(game);
                callback(http.responseText);
                return false;
            }
            return false;
        } else if(http.readyState === 4 && http.status !== 200){
            game._post(data, callback);
        }
    }.bind(game);
    http.send(params);
};





Chess.prototype.getGamesList = function(callback){
    var game = this;
    var data = "currentgames=true";
    this._post(data, callback);
};



Chess.prototype.connectToGame = function(game_id){
    var game = this;
    if(game.game_id===game_id){
        game.connect();
        return false;
    } else{
        var oldgame_id = game.game_id;
        var data = "connecttogame=true&game_id="+game_id;
        this._post(data, function(result){
            game.game_id = game_id;
            game.getFromServer(function(){
                var gameplayers = [];


                for(var i = 0; i < game.players.length; i++){
                    var player = game.players[i];

                    if(player.color!=="spectate"){
                        gameplayers.push(player);
                    }
                }


                if(gameplayers.length === 1){
                    console.log(1 - gameplayers[0].color);
                    game.myplayer.color = 1 - gameplayers[0].color;
                }
                if(gameplayers.length !== 1){
                    //you're a spectator
                    game.myplayer.color = "spectate";
                }


                if(game.game_id!==oldgame_id){
                    game.players.push(game.myplayer);
                }





                game.connect();
            });
        });
    }
};

Chess.prototype.interval = false;

Chess.prototype.connect = function(){
    clearInterval(this.interval);
    this.sendToServer(function(){
        this.interval = window.setInterval(function(){
            if(this.curplayer!==this.myplayer.color){
                //console.log("getting game data from server...");
                this.getFromServer(function(){
                    //console.log("new game data imported..");
                });
            }
        }.bind(this), this.serverPing);
    }.bind(this));
};



Chess.prototype.sendToServer = function(callback){
    var game = this;
    if(game.game_id){
        var data = "savegamedata=true&game_id="+this.game_id+"&game_data="+this.export();


        this._post(data, function(result){
            if(typeof callback==="function"){
                callback();
            }
        });
    } else{

    }
};

Chess.prototype.getFromServer = function(callback){
    var game = this;
    var data = "getgamedata=true&game_id="+this.game_id;


    this._post(data, function(result){
        game.import(result);
        if(typeof callback==="function"){
            callback();
        }
    });
};

Chess.prototype.Piece = function(y, x, type,color,taken){
    this.x = x;
    this.y = y;
    this.type = type;
    this.img = loadAsset("assets/"+color+"-"+this.type+".png");
    if(color==="b"){color=0}
    if(color==="w"){color=1}
    this.color = color;
    this.taken = taken || false;
};




Chess.prototype.Piece.prototype.isPiece = true;

Chess.prototype.Piece.prototype.ownedBy = function(player){
    return (player===this.color);
};

Chess.prototype.export = function(){
    return JSON.stringify(this);
};




Chess.prototype.import = function(j){
    var js = JSON.parse(j);
    var ks = Object.keys(js);

    for(var i = 0; i < ks.length; i++){
        var k = ks[i];
        var o = js[k];

        if(k==="players"){
            for(var hk = 0; hk < o.length; hk++){
                var player = o[hk];
                for(var ae = 0; ae < player.taken.length; ae++){
                    var pie = player.taken[ae];
                    if(pie.color===0){pie.color="b";}
                    if(pie.color===1){pie.color="w";}
                    o[hk].taken[ae] = new this.Piece(pie.y, pie.x, pie.type, pie.color,pie.taken);
                }
            }
        }

        if(k==="pieces"){
            for(var jk = 0; jk < o.length; jk++){
                var p = o[jk];

                if(p.color===0){p.color="b";}
                if(p.color===1){p.color="w";}
                o[jk] = new this.Piece(p.y, p.x, p.type, p.color,p.taken);
            }
        }

        if(k!=="size" && k!=="squaresize")
        this[k] = o;
    }



    return this;
};



Chess.prototype.getDir = function(square, dir, count){
    if(square){
        count = count || 1;
        var x = square.x;
        var y = square.y;
        if(dir==="n"){
            return this.getSquare(x, y-count);
        }
        if(dir==="ne"){
            return this.getSquare(x+count, y-count);
        }
        if(dir==="e"){
            return this.getSquare(x+count, y);
        }
        if(dir==="se"){
            return this.getSquare(x+count, y+count);
        }
        if(dir==="s"){
            return this.getSquare(x, y+count);
        }
        if(dir==="sw"){
            return this.getSquare(x-count, y+count);
        }
        if(dir==="w"){
            return this.getSquare(x-count, y);
        }
        if(dir==="nw"){
            return this.getSquare(x-count, y-count);
        }
    } else{
        return false;
    }
};



Chess.prototype.findMoves = function(piece){
    var moves = [];
    var turnnum = this.moves.length;
    if(piece.type==="pawn"){
        if(turnnum===0){

        } else{
            moves.push(this.getDir(piece, "up"));
        }
    }

    return moves;
};

Chess.prototype.movePiece = function(col, row, tocol, torow){
    this.currentMove.start = false;
    this.currentMove.finish = false;
    if(col===tocol && row===torow){
        return false;
    } else{
        var square = this.board[row][col];
        var tosquare = this.board[torow][tocol];



            var piece = this.pieces[square.piece];

            if(piece){
                piece.x = tocol;
                piece.y = torow;

                if(tosquare.piece!==false){
                    this.pieces[tosquare.piece].taken = true;
                    this.myplayer.taken.push(this.pieces[tosquare.piece]);
                }

                this.board[torow][tocol].piece = square.piece;
                this.board[row][col].piece = false;

                this.moves.push({
                    fromx: col,
                    fromy: row,
                    tox:  tocol,
                    toy: torow
                });

                if(this.curplayer===1){
                    this.curplayer=0;
                } else{
                    this.curplayer=1;
                }
                this.sendToServer(function(){

                }.bind(this));
                return this;
            } else{
                return false;
            }


    }
};



Chess.prototype.getSquare = function(x, y){
    if(x>=0&&y>=0 && x<this.rowscols&&y<this.rowscols){
        var square = this.board[y][x];
        if(square && square.piece!==false){
            return this.pieces[square.piece];
        }
        return square;
    }
    return false;
};



Chess.prototype.getPieces = function(player){
    var v = this.colors[player];
    var playerpieces = [];

    for(var i = 0; i < this.pieces.length; i++){
        var p = this.pieces[i];

        if(p.color===player){
            playerpieces.push(p);
        }
    }
    return playerpieces;
};








Chess.prototype.initBoard = function(){
    var t = 1;
    for(var row = 0; row < this.rowscols; row++){
        this.board[row] = [];
        for(var col = 0; col < this.rowscols; col++){
            this.board[row][col] = {x: col, y: row};
            if ((row+col) % 2 === 0) {
                this.board[row][col].color = {r: 255, g: 255, b: 255};
            } else {
                this.board[row][col].color = {r: 150, g: 0, b: 0};
            }
        }
    }
};


Chess.prototype.initPieces = function(){

    var b = [
        ["b-rook", "b-knight", "b-bishop", "b-queen", "b-king", "b-bishop", "b-knight", "b-rook"],
        ["b-pawn", "b-pawn"  , "b-pawn"  , "b-pawn" , "b-pawn", "b-pawn"  , "b-pawn"  , "b-pawn"]
    ];
    var n = new Array(8).fill("blank");
    b.push(n);
    b.push(n);
    b.push(n);
    b.push(n);
    b[6] = b[1].slice(0);
    b[7] = b[0].slice(0);
    b[6].reverse();
    b[7].reverse();





    for(var i = 0; i < b[6].length; i++){
        b[6][i] = b[6][i].replace("b-", "w-");
    }
    for(var j = 0; j < b[6].length; j++){
        b[7][j] = b[7][j].replace("b-", "w-");
    }




    for(var row = 0; row < this.rowscols; row++){
        for(var col = 0; col < this.rowscols; col++){

            var square = b[row][col];
            if(square==="blank"){
                this.board[row][col].piece = false;
            } else{
                var s = square.split("-");
                var color = s[0];
                var type = s[1];


                this.board[row][col].piece = this.pieces.length;
                this.pieces.push(new this.Piece(row, col, type, color));
            }


        }
    }

};


Chess.prototype.rotateBoard = function(){


    this.board.reverse();
    for(var row = 0; row < this.rowscols; row++){
        this.board[row].reverse();
        for(var col = 0; col < this.rowscols; col++){

            var square = this.board[row][col];


            square.x = col;
            square.y = row;


            if(square.piece!==false){
                var piece = this.pieces[square.piece];
                //console.history(piece);
                piece.x = col;
                piece.y = row;
            } else{

            }

            // fill(square.color.r, square.color.g, square.color.b);
            // rect(square.x*size, square.y*size, size, size);

        }
    }





};




Chess.prototype.initGameplay = function(){



    this.currentMove = {};
    window.touchStarted = function() {
        var square;
        if(this.myplayer.color===0){
            square = this.getSquare(this.rowscols - floor(mouseX / this.squaresize) - 1, this.rowscols - floor(mouseY / this.squaresize) - 1);
        } else {
            square = this.getSquare(floor(mouseX / this.squaresize), floor(mouseY / this.squaresize));
        }
        if(square.piece!==false){
            if(square.isPiece){
                if(square.ownedBy(this.curplayer) && this.curplayer===this.myplayer.color){
                    this.currentMove.start = square;
                    this.currentMove.progress = {x: mouseX, y: mouseY};
                    this.currentMove.finished = false;
                }
            }
        }
        // prevent default
        //return false;
    }.bind(this);
    window.touchMoved = function() {
        var square;
        if(this.myplayer.color===0){
            square = this.getSquare(this.rowscols - floor(mouseX / this.squaresize) - 1, this.rowscols - floor(mouseY / this.squaresize) - 1);
        } else {
            square = this.getSquare(floor(mouseX / this.squaresize), floor(mouseY / this.squaresize));
        }
        if(square){
            this.currentMove.progress = {x: mouseX, y: mouseY};
            this.currentMove.finished = false;
        }
        // prevent default
        //return false;
    }.bind(this);
    window.touchEnded = function() {
        var square;
        if(this.myplayer.color===0){
            square = this.getSquare(this.rowscols - floor(mouseX / this.squaresize) - 1, this.rowscols - floor(mouseY / this.squaresize) - 1);
        } else {
            square = this.getSquare(floor(mouseX / this.squaresize), floor(mouseY / this.squaresize));
        }
        if(square && this.currentMove.finished===false){
            this.currentMove.finished = true;
            this.currentMove.finish = square;
            this.currentMove.progress = {x: square.x, y: square.y};
            if(this.currentMove.start && this.currentMove.finish){
                this.movePiece(this.currentMove.start.x, this.currentMove.start.y, this.currentMove.finish.x, this.currentMove.finish.y);
            }
        }


        //return false;
    }.bind(this);
};



Chess.prototype.init = function(){
    this.players = [this.myplayer];
    this.initBoard();
    this.initPieces();
    this.initGameplay();
    this.sendToServer(function(){
        this.connectToGame(this.game_id, function(){

        });
    }.bind(this));

    var input,button;
    input = createInput();
    input.position((width/2 - input.width/2), height+(input.height * 2));
    input.attribute("placeholder", "Game ID");
    fill(0);
    button = createButton('Connect');
    button.position(input.x + input.width, input.y);
    button.mousePressed(function(){
        this.connectToGame(parseInt(input.value()));
        input.attribute("placeholder", parseInt(input.value()));
        input.value("");

    }.bind(this));
    return this;
};




Chess.prototype.showBoard = function(){

    if(this.myplayer.color===0){ this.rotateBoard(); }
    var size = this.squaresize;
    for(var row = 0; row < this.rowscols; row++){
        for(var col = 0; col < this.rowscols; col++){

            var square = this.board[row][col];

                fill(square.color.r, square.color.g, square.color.b);
                rect((square.x*size), square.y*size, size, size);

        }
    }
    if(this.myplayer.color===0){ this.rotateBoard(); }
};

Chess.prototype.showPieces = function(){
    if(this.myplayer.color===0){ this.rotateBoard(); }
    var size = this.squaresize;
    var movingPiece = false;
    if(this.currentMove.start && this.currentMove.finished!==true){
        movingPiece = this.currentMove;
    }





    for(var i = 0; i < this.pieces.length; i++){
        var piece = this.pieces[i];

        if(piece.taken!==true){
            if(movingPiece && movingPiece.start.x===piece.x && movingPiece.start.y===piece.y){
                tint(255, 127);
                image(piece.img, (movingPiece.progress.x - (size/2)), movingPiece.progress.y - (size/2), size, size);
            } else{
                tint(255, 255);
                image(piece.img, (piece.x * size), piece.y * size, size, size);
            }
        }

    }
    if(this.myplayer.color===0){ this.rotateBoard(); }
};


Chess.prototype.getTaken = function(player){
    if(this.players[player]){
        return this.players[player].taken;
    }
    return [];
};


Chess.prototype.showScore = function(){
    textSize(28);
    textAlign(CENTER);
    fill(0);
    text(this.colors[this.curplayer]+"'s Turn!", width/2, height-30);
    textSize(14);
    textAlign(CENTER);
    fill(0);
    text("Current Game ID: "+ this.game_id, width/2, height);

    var taken0 = this.getTaken(0);
    var taken1 = this.getTaken(1);

    //console.log(taken0, taken1);

    // if(taken0.length > 0){
    //     textSize(16);
    //     textAlign(LEFT);
    //     fill(0);
    //     text("Black has taken: " + taken0.length, 0, height);
    // }
    //
    //
    // if(taken1.length > 0){
    //     textSize(16);
    //     textAlign(RIGHT);
    //     fill(0);
    //     text("White has taken: " + taken1.length, width, height);
    // }
};



Chess.prototype.show = function(){
    clear();
    noStroke();
    this.showBoard();
    this.showPieces();
    this.showScore();
};
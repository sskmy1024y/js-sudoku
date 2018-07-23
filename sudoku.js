//問題ファイルの情報
var Q = {
  board: [],  //問題の多元配列

  area: 0,  //全セル数

  rows: 0,  //列数
  cols: 0,  //行数

  size: 0,  //分割数（9x9の時は3）
  blks: 0,  //分割ブロック数 (9x9の時は9)
};

//設定関連の変数
var opt = {
  isLoaded: false,  //問題ファイルをロード済みかのフラグ
  changeView: false, //表示オプション。変更推移を表示するかどうか
};

//座標情報を格納
function Coordinate(p){
  this.col = p % Q.cols; //行
  this.row = Math.floor(p / Q.rows); //列
  this.blk = Math.floor(this.row / Q.size) * Q.size + Math.floor(this.col / Q.size); //(size)x(size)ブロックの座標
}

function Coordinate_toString() {
  return "Coordinate(" + this.col + ", " + this.row + ", " + this.blk + ")";
}

new Coordinate(0);
Coordinate.prototype.toString = Coordinate_toString;

//数独情報をオブジェクトへ
function Sudoku() {
  this.board = new Array(Q.area);
  this.col_flags = new Array(Q.cols);
  this.row_flags = new Array(Q.rows);
  this.blk_flags = new Array(Q.blks);
  for (let i = 0; i < Q.cols; i++) this.col_flags[i] = 0x3fe;
  for (let i = 0; i < Q.rows; i++) this.row_flags[i] = 0x3fe;
  for (let i = 0; i < Q.blks; i++)  this.blk_flags[i] = 0x3fe;
  for (let i = 0; i < Q.area; i++) this.board[i] = 0;
  this.remain = Q.area;
}
function Sudoku_done() {
  return this.remain == 0;
}
function copyArray(dest, sou) {
  for (var i = sou.length - 1; i >= 0; i--)
  dest[i] = sou[i];
}
function Sudoku_copy(source) {
  copyArray(this.board,     source.board);
  copyArray(this.col_flags, source.col_flags);
  copyArray(this.row_flags, source.row_flags);
  copyArray(this.blk_flags, source.blk_flags);
  this.remain = source.remain;
}
function Sudoku_setData(s) {
  var p = 0;
  for (var i = 0; i < s.length && p < Q.area; i++) {
    c = s.charAt(i);
    if ("-0123456789".indexOf(c) >= 0) {
      var n = parseInt(c);
      if (n > 0)
      this.setNum(p, n);
      p++;
    }
  }
  for (; p < this.board_array; p++) {
    this.board[p] = 0;
  }
}
function Sudoku_getData() {
  var b = Q.board;
  var a = [];
  for (var i = 0; i < b.length; i++) {
    for (var j = 0; j < b[i].length; j++) {
      var p = (i*Q.cols)+j;
      var n = b[i][j];
      if (n > 0){
        this.setNum(p, n, false);
      } else this.board[p] = 0;
    }
  }
}
function Sudoku_view(p) {
  var opt = {};
  var tmp_array = new Array(Q.cols);
  for (var i = 0; i < Q.cols; i++) {
    tmp_array[i] = new Array(Q.cols);
  }
  for (var i = 0; i < Q.area; i++) {
    tmp_array[((i - i%Q.cols) / Q.cols)][(i % Q.cols)] = this.board[i] != 0 ? this.board[i] : " ";
    if (p != undefined && p == i) {
      opt.view = 'change';
      opt.x = (i % Q.cols);
      opt.y = ((i - i%Q.cols) / Q.cols);
    }
  }
  setTable(tmp_array, opt);
}

function Sudoku_setNum(p, n, f) {
  var coord = new Coordinate(p);
  var mask = ~(1 << n);
  this.col_flags[coord.col] &= mask;
  this.row_flags[coord.row] &= mask;
  this.blk_flags[coord.blk] &= mask;
  this.board[p] = n;
  if (opt.changeView && f != false) this.view(p);
  this.remain--;
}
function Sudoku_getFlags(p) {
  var coord = new Coordinate(p);
  var flag = 	this.col_flags[coord.col] & this.row_flags[coord.row]
  & this.blk_flags[coord.blk];
  return flag;
}
function Sudoku_canPlace(p, n) {
  if (this.board[p] != 0)
  return 0;
  var coord = new Coordinate(p);
  return this.col_flags[coord.col] & this.row_flags[coord.row]
  & this.blk_flags[coord.blk] & (1 << n);
}
function Sudoku_countAvail(p) {
  var flag = this.getFlags(p);
  return countBits(flag);
}

function Sudoku_nextAvail() {
  var min_c = Q.cols + 1;		// 10 = 9 + 1
  var min_p = -1;

  for (var p = 0; p < Q.area; p++) {
    if (this.board[p] == 0) {
      var c = this.countAvail(p);
      if (c < min_c) {
        min_c = c;
        min_p = p;
      }
    }
  }
  return min_p;
}
function Sudoku_save() {
  var area = new Sudoku();
  area.copy(this);
  return area;
}
function Sudoku_load(area) {
  this.copy(area);
}

new Sudoku();	// dummy
Sudoku.prototype.getData = Sudoku_getData;
Sudoku.prototype.setData = Sudoku_setData;
Sudoku.prototype.view = Sudoku_view;
Sudoku.prototype.setNum = Sudoku_setNum;
Sudoku.prototype.getFlags = Sudoku_getFlags;
Sudoku.prototype.canPlace = Sudoku_canPlace;
Sudoku.prototype.nextAvail = Sudoku_nextAvail;
Sudoku.prototype.countAvail = Sudoku_countAvail;
Sudoku.prototype.copy = Sudoku_copy;
Sudoku.prototype.save = Sudoku_save;
Sudoku.prototype.load = Sudoku_load;
Sudoku.prototype.done = Sudoku_done;


function dumpx(objName, obj) {
  for (var prop in obj) {
    document.writeln(objName + "." + prop + " = " + obj[prop] + "<BR>");
  }
}
function getFirstNum(flag) {
  var n = 0;
  if (flag == 0)
  return 0;
  while ((flag & 1) == 0) {
    n++;
    flag >>= 1;
  }
  return n;
}
function methodA(sudoku) {
  for (var p = 0; p < Q.area; p++) {
    if (sudoku.board[p] == 0) {
      flag = sudoku.getFlags(p);
      if (flag != 0 && 512 % flag == 0) {
        n = getFirstNum(flag);
        sudoku.setNum(p, n);
        return true;
      }
    }
  }
  return false;
}
function makeZeroArray(n) {
  var a = new Array(n);
  for (var i = 0; i < n; i++)
  a[i] = 0;
  return a;
}
function methodB(sudoku) {
  var prow = new Array(Q.rows);
  var pcol = new Array(Q.cols);
  var pblk = new Array(Q.blks);

  for (var n = 1; n <= Q.cols; n++) {
    var crow = makeZeroArray(Q.rows);
    var ccol = makeZeroArray(Q.cols);
    var cblk = makeZeroArray(Q.blks);
    for (var p = 0; p < Q.area; p++) {
      if (sudoku.canPlace(p, n)) {
        var coord = new Coordinate(p);
        crow[coord.row]++; prow[coord.row] = p;
        ccol[coord.col]++; pcol[coord.col] = p;
        cblk[coord.blk]++; pblk[coord.blk] = p;
      }
    }
    for (var row = 0; row < Q.rows; row++) {
      if (crow[row] == 1) {
        sudoku.setNum(prow[row], n);
        return true;
      }
    }
    for (var col = 0; col < Q.cols; col++) {
      if (ccol[col] == 1) {
        sudoku.setNum(pcol[col], n);
        return true;
      }
    }
    for (var blk = 0; blk < Q.blks; blk++) {
      if (cblk[blk] == 1) {
        sudoku.setNum(pblk[blk], n);
        return true;
      }
    }

  }
  return false;
}

function countBits(f) {
  var n = 0;
  while (f) {
    if (f & 1)
    n++;
    f >>= 1;
  }
  return n;
}

function backtrack(sudoku) {
  var backupSpace = sudoku.save();
  var p = sudoku.nextAvail();
  for (var n = 1; n <= Q.cols; n++) {
    if (sudoku.canPlace(p, n)) {
      sudoku.setNum(p, n);
      tryIt(sudoku);
      sudoku.load(backupSpace);
    }
  }
}
function tryIt(sudoku) {
  var cont;
  do {
    do {
      cont = methodA(sudoku);
    } while (cont);
    if (! sudoku.done())
    cont = methodB(sudoku);
  } while (cont);
  if (sudoku.done())
  sudoku.view();
  else
  backtrack(sudoku);
}
function setInitData(str) {
  sudoku = new Sudoku();
  sudoku.setData(str);
  sudoku.view();
  return sudoku;
}


function solve(){
  if (!opt.isLoaded) {
    alert('問題ファイルを読み込んでください.');
    return;
  }

  var d1 = (new Date).getTime();
  sudoku = new Sudoku();
  var d2 = (new Date).getTime();
  sudoku.getData();
  var d3 = (new Date).getTime();
  tryIt(sudoku);
  var d4 = (new Date).getTime();
  alert("init = " + (d2 - d1) + "\nload = "
  + (d3 - d2) + "\nsolve = " + (d4 - d3) + " [ms]");
}

function next(){
  if (!opt.isLoaded) {
    alert('問題ファイルを読み込んでください.');
    return;
  }

  opt.changeView = true;　//変更推移を残す
  var d1 = (new Date).getTime();
  sudoku = new Sudoku();
  var d2 = (new Date).getTime();
  sudoku.getData();
  var d3 = (new Date).getTime();
  tryIt(sudoku);
  var d4 = (new Date).getTime();
  alert("init = " + (d2 - d1) + "\nload = "
  + (d3 - d2) + "\nsolve = " + (d4 - d3) + " [ms]");
  opt.changeView = false;　//設定を元に戻す
}


//配列情報からテーブル表示
function setTable(array, option) {
  var col = array.length;
  var row = array[0].length;
  if (!opt.changeView) $("#tableCel").empty();

  if (option) console.log(option);

  var tableJQ = $('<table id="table_id1" class="table table-bordered" style="width:auto;"></table>');
  if (option && option.view == 'change') tableJQ.addClass('changing');
  for (var r = 1; r <= row; r++) {
    var trJQ_r = $('<tr></tr>').appendTo(tableJQ);
    for (var c = 1; c <= col; c++) {
      var num = array[(r-1)][(c-1)] > 0 ? array[(r-1)][(c-1)] : '';
      var td = $('<td style="width:40px;">'+num+'</td>')
      if (option && option.x != undefined && option.y != undefined && option.x == (c-1) && option.y == (r-1)) td.addClass('changed');
      td.appendTo(trJQ_r);
    }
  }
  $("#tableCel").append(tableJQ);
}

//ファイルを取得
function loadFile(){
  var input = $("#questionFile"),
  file = input.get(0).files[0];

  xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", file.path, false);
  xmlHttp.send(null);

  initLoadFile(xmlHttp.responseText);
}

//取得したファイルを変数へ格納
function initLoadFile(text){
  var cols = text.split(/\r\n|\r|\n/);
  var rows = [];
  for(let i=0; i < cols.length; i++){
    rows[i] = cols[i].split(" ");
    for(let j=0; j < rows[i].length; j++){
      rows[i][j] = parseInt(rows[i][j]);
      if (isNaN(rows[i][j])) rows[i][j] = -1;
    }
  }
  if (cols.length == rows.length) {
    //問題情報を変数に格納
    Q.board = rows;
    Q.rows = rows.length;
    Q.cols = rows.length;
    Q.area = Q.rows * Q.cols;

    if (Q.rows > 3 && Q.rows % 3 == 0) {
      Q.size = 3;
    } else if (Q.rows > 2 && Q.rows % 2 == 0){
      Q.size = 2;
    } else {
      Q.size = Q.rows;
    }

    Q.blks = Q.rows * Q.cols / (Q.size * Q.size);

    //動作準備完了
    opt.isLoaded = true;

    //問題データを表示
    setTable(rows);
  } else alert("問題文の形式が違います.");
}

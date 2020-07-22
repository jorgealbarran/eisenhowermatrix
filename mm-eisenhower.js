//Modelo Mental: Matriz de Eisenhower
//
// Explicación del modelo mental: Si eres eficiente, 20% de tus recursos te darán el 80% de tus resultados.
// Version: 1
// Author: Jorge Albarran
// Date: 20/07/2020

// Canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// Colors
const shipColor = "#3F7BFA";
const bgColor = "#242435";
const activeProblemColor = "#FF5C5C";
const inocuousProblemColor = "#AC5DD8";
const solvedProblemColor = "#39D98A";
const textColor="#EBEBF0";
const gameOverColor="#3cc8d8";
const shootColor="#FDDD48";
const mineColor="#FDDD49";

// Structures
const problems = [];
const problemtypes = [];
const shoots = [];
const mines = [];

// Sizes
    // Ship
const shipSize = 30;
    // Problems array
const problemsFrec = 2000;
const problemSize = 20;
    // Shoot size
const shootsize=15;

// Dynamics variables
var frames = 0;
var interval;
var maxSpeed=1;
var minSpeed=.7;
var shipSpeed=15;
var executionTime=60000;
var remainingTime=Math.round(executionTime/1000)-1;
var seconds=0;
// Score variables
var score=0;
//var power=0;

// Classes
// Board class. Uses a generic rectangle with a predefined color.
class Board {
    constructor() {
      this.onload = () => {
        this.draw();
      };
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = bgColor;
        ctx.rect(0, 0, 500, 550);
        ctx.fill();
        ctx.closePath();
    }
  }
 
  // Paddle class. Draws a standard rectangle with a predefined color.
  class Ship {
    constructor() {
        this.width = shipSize;
        this.x = (canvas.width-shipSize)/2;
        this.y = canvas.height-5;
        this.onload = () => {
            this.draw();
        };
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = shipColor;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x+shipSize,this.y);
        ctx.lineTo(this.x+shipSize/2,this.y-shipSize);
        ctx.lineTo(this.x,this.y);
        ctx.fill();
        ctx.closePath();
    }
    moveLeft() {
        this.x -= shipSpeed;
    }
    moveRight() {
        this.x += shipSpeed;
    }
    stop(){
        this.x=this.x;
    }
  shoot() {
    const w = new Shoot(this.x + shipSize/2, this.y - shipSize);
    shoots.push(w);
    score--;
  }
  setMine() {
    const m = new Mine(this.x,this.y-shipSize-25);
    mines.push(m);
  }
}

class Problem {
    constructor(x,type,speed){
        this.x = x;
        this.y = 0;
        this.size = problemSize;
        this.type = type;
        this.active=true;
        console.log(type);
        //this.color = activeProblemColor;
        type==0 ? this.speed=minSpeed*(1+speed)+maxSpeed*speed : this.speed=minSpeed;
        this.onload = () => {
            this.draw();
        };
    }
    draw(){
        switch (this.type){
            case 0:
                this.color = activeProblemColor;  
                break;
            case 1:
                this.color = inocuousProblemColor;
                break;
            case 2:
                this.color = solvedProblemColor;
                break;
        }
        if(this.active==true){
            this.y += this.speed;
            ctx.beginPath();
            ctx.arc(this.x,this.y+this.speed, this.size, 0, Math.PI*2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.closePath();
        }
    }
    vanish(){
        this.y=0;
        this.size=0;
        this.type=2;
        this.active=false;
        this.speed=0;
    }
}

class Shoot {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.width = 3;
      this.height = 20;
      this.alive=true;
      this.onload = () => {
          this.draw();
        };
    }
    draw() {
      if(this.alive == true){
          this.y -= 2;
          ctx.beginPath();
          ctx.fillStyle = shootColor;
          ctx.rect(this.x, this.y, this.width, this.height);
          ctx.fill();
          ctx.closePath();
          }
      }
      touchProblem(problem){
          return(
              this.x>problem.x-problem.size &&
              this.x<problem.x+problem.size &&
              this.y<problem.y+problem.size
          );
      }
      vanish(){
          this.y=canvas.height+10;
          this.x=-10;
          this.alive=false;
      }
  }

  class Mine {
    constructor(x,y){
        this.x=x;
        this.y=y;
        this.width=30;
        this.height=15;
        this.active=true;
        this.onload = () => {
            this.draw();
        };
    }
    draw() {
        if(this.active == true){
        ctx.beginPath();
        ctx.fillStyle = mineColor;
        ctx.rect(this.x, this.y, this.width, this.height);
        ctx.fill();
        ctx.closePath();
        }
    }
    touchProblem(problem){
        var touches=false;
        if (this.y<problem.y+problem.size){
            if ((this.x < problem.x+problem.size && this.x+this.width > problem.x + problem.size) || 
                (this.x < problem.x && this.x+this.width > problem.x) ||
                (this.x < problem.x-problem.size && this.x+this.width > problem.x - problem.size)
            ){
                touches=true;
                console.log(touches);
            }
        }
        return touches;
    }
    vanish(){
        this.y=canvas.height+30;
        this.x=-10;
        this.active=false;
    }
}
  
const board = new Board();
const ship = new Ship();

// Le jeu
function update() {
  frames++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  board.draw();
  ship.draw();
  drawProblems();
  drawShoots();
  drawMines();
  checkCollitions();
  drawScore();
}

// inicio
function start() {
    interval = setInterval(update, 1000 / 60);
    problematic = setInterval(generateproblem, problemsFrec);
    counter = setInterval(incrementSeconds, 1000);
    countdown = setInterval(gameOver,executionTime);
  }

  function generateproblem(){
    const p = new Problem(Math.random()*canvas.width,coinFlip(),coinFlip());
    problems.push(p);
  }

  function coinFlip(){
      var y=Math.random();
      if(y<0.5){
          return 0;
      }
      return 1;
  }

  function drawProblems() {
    problems.forEach(problem => problem.draw());
  }

  function drawShoots() {
    shoots.forEach(shoot => shoot.draw());
  }

  function drawMines() {
      mines.forEach(mine => mine.draw());
  }
  
  function incrementSeconds() {
    --remainingTime;
}
  
  function gameOver() {
      clearInterval(interval);
      ctx.font = "100px Arcade";
      ctx.fillStyle = gameOverColor;
      ctx.fillText("GAME OVER", 17, 190);     
    }

function checkCollitions(){
    problems.forEach(problem => {
        if (problem.type != 2){
            if (problemHits(problem)){score=score-10; problem.vanish();}
            shoots.forEach(shoot => {
                shootLeaves(shoot);
                if(shoot.touchProblem(problem)){
                    if(problem.type == 1){
                        score=score-5;
                    } else if (problem.type == 0) {
                        score=score+5;
                    }
                    shoot.vanish();
                    problem.type=2;
                }
            });
            if (problem.type==1){
                mines.forEach(mine => {
                    if(mine.touchProblem(problem)){
                        problem.vanish();
                        mine.vanish();
                        score=score+5;
                        
                    }
                });
            }
        } 
    });
}  

function shootLeaves(shoot){
    if(shoot.y<=0){
        shoot.vanish();
    }
}

function problemHits(problem){
    return (
       problem.y+problemSize > canvas.height
    )
}

function drawScore() {
    ctx.font = "25px Arcade";
    ctx.fillStyle = textColor;
    ctx.fillText("Score: "+ score, 8, 20);
    ctx.fillText("Tiempo: "+Math.round(remainingTime), 353, 20);
}

addEventListener("keydown", function(e) {
    if (e.keyCode === 37) {
        if(ship.x>0){
            ship.moveLeft();
        }
    } else if (e.keyCode === 39) {
        if(ship.x+shipSize<canvas.width){
            ship.moveRight();
        }
    } 
  });

addEventListener("keyup", function(e) {
    if (e.keyCode === 32) {
        ship.shoot();
    } else if (e.keyCode === 68) {
        ship.setMine();
        score=score-3;
    }
  });
 
  start();
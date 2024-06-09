function createHawks(){
    let Hawk = function(x, y){
        this.position = createVector(x, y);
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
        
        
        this.sprite = images.hawkFlight1;
        this.direction = 1;
        this.flapPeriod = 120;
        this.flapVel = 1;
        this.flapCounter = 0;


        this.width = round(random(100, 150));
        this.maxFlightSpeed = random(jay.maxFlightSpeed/50, (jay.maxFlightSpeed + 50)/50);

        this.willPower = random(30, 100);
        this.gone = false;


        this.seeJay = false;
        
        this.blitz = 1.1;
        this.blitzCounter = 0;
        switchTrack(soundTrack.hawks, true);
    };

    Hawk.prototype.move = function(){
        let vel = this.velocity;
        vel.mult(0.9);
        if(this.blitzCounter > 0){
            vel.mult(this.blitz);
        }
        //this.position.x+=vel.x;
        //this.position.y+=vel.y;
        this.position.add(vel);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.flightSpeed);

        if(this.willPower > 0 && this.seeJay){
            let dir = createVector(jay.position.x - this.position.x, jay.position.y - this.position.y);
            dir.normalize();
            this.acceleration = dir;

            this.velocity.limit(this.maxFlightSpeed);
        }


        if(this.seeJay){
            if(this.blitzCounter <= 0){
                if(random(1) < 1/60/3){
                    console.log("blitz")
                    this.blitzCounter = 3;
                } 
            } else{
                this.blitzCounter-=1/60;
                
            }
        }

        let groundHeight = world.findGroundHeight(this.position.x);
        if(this.position.y > groundHeight){
            this.position.y = groundHeight;
            this.velocity = createVector(0, 0);
            this.willPower-=10;
        }
    }

    // try to see jay
    Hawk.prototype.hunt = function(){
        if(!this.seeJay){
            let chance = 0;
            if(jay.inNest){ // hiding in nest
                chance = 1/60/60;
            } else if(jay.isPerched){ // hiding in tree
                chance = 1/60/10;
            } else if(!jay.airborne){
                for(var i = 0; i < world.objects.fruitTrees.legnth; i++){ // hiding in fruit tree
                    let fruitTree = world.objects.fruitTrees[i];
                    if(dist(jay.position.x, jay.position.y, fruitTree.x, fruitTree.y) < 50){
                        chance = 1/60/60;
                        break;
                    } else{
                        chance = 1/60/5; // on ground
                    }
                }
            } else{
                chance = 1/60/2 // flying
            }
    
            if(random(1) < chance){ // check is jay is seen
                this.seeJay = true;
                this.maxFlightSpeed*=50;
            } else{ // patroll the skies
                let position = world.findXInFrame(this.position.x);
                if(position < width/5){
                    this.acceleration.x = 0.5;
                } else if(position > width*0.8){
                    this.acceleration.x = -0.5;
                } else if(this.acceleration.x === 0){
                    this.acceleration.x = 0.5;
                }
            }
        }
    };

    Hawk.prototype.draw = function(){
        this.flapPeriod = frameRate() / 3;
        

        if(this.acceleration.x > 0){
            this.direction = 1;
        } else{
            this.direction = 0;
        }

        let direction = this.direction;
        if(this.flapCounter > 0){
            this.sprite = images.hawkFlight1[direction];
        } else{
            this.sprite = images.hawkFlight2[direction];
        }
        if(this.flapPeriod - abs(this.flapCounter) <= 0){
            this.flapVel*=-1;
        }
        this.flapCounter+=this.flapVel;
        

/*        let ground = world.findYInFrame(world.findGroundHeight(this.position.x));
        fill(0, 0, 0, 100);
        noStroke();
        ellipse(this.position.x, ground+50, this.width, 20);
        ellipse(x, ground, this.width, 20)
        stroke(0);*/

        image(this.sprite, world.findXInFrame(this.position.x), world.findYInFrame(this.position.y), this.width, this.width * 0.75);
    };
    
    Hawk.prototype.attack = function(){
        if(jay.Iframes <= 0 && dist (this.position.x, this.position.y, jay.position.x, jay.position.y) < 50){
            jay.health--;
            jay.Iframes = 60 * 3;
        }
    };

    Hawk.prototype.loseInterest = function(){
        if(this.willPower <= 0){
            let direction = -1;
            if(this.direction === 1){
                direction = 1;
            }
            this.acceleration.x = direction;
            this.acceleration.y = -0.25;
            let xFrame = world.xRangeInFrame();
            let yFrame = world.yRangeInFrame();
            if(this.position.x + this.width < xFrame[0] || this.position.x - this.width > xFrame[1]){
                if(this.position.y + this.width < yFrame[0] || this.position.y - this.width > yFrame[1]){
                    this.gone = true;
                    jay.hawksEscaped++;
                }
            }
        } else{
            this.willPower-=1/60;
        }
    }

    world.spawnHawks = function(){
        if(hawks.length === 0){
            let attempt = false;
            if(world.isDay()){
                attempt = true;
            } else if(random(1) > 0.9){
                attempt = true;
            }

            if(attempt && random(1) < 1/FPS/60){
                console.log("spawn hawk")
                let frame = world.xRangeInFrame();
                let x = frame[0] - 200;
                if(random(1) > 0.5){
                    x = frame[1] + 200;
                }
                hawks.push(new Hawk(x, jay.position.y - height/2))
            }
        }
    }

    /*onKeyPress.push(function(){
        if(key === "p"){
            hawks.push(new Hawk(jay.position.x+1, jay.position.y - 100));
            console.log("hawk")
        }
    })*/

    hawks = [];
    runHawks = function(){
        for(var i = 0; i < hawks.length; i++){
            hawks[i].hunt();
            hawks[i].move();
            hawks[i].attack();
            hawks[i].draw();
            hawks[i].loseInterest();
            if(hawks[i].gone){
                hawks.splice(i, 1);
                switchTrack(chooseTrack(), true);
            }
        }
    };

    console.log("hawks done")
}

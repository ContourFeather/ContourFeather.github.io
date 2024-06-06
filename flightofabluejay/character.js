function createCharacter(){
    console.log("make character")
    jay = {
        airborne: false,
        flying: false,
        hopping: false,
        tryingToLand: false,
        inNest: true,
        isPerched: true, // ok yes being in the nest doesn't normally count as perching
        finding: false,
        position: createVector(0, 0),
        velocity: createVector(0, 0),
        acceleration: createVector(0, 0),
        maxFlightSpeed: 10,
        direction: 1,
        sprite: images.jaySprite[this.direction],

        displayPoint: createVector(width/2, height-200),
        
        hunger: 100,
        maxHunger: 100,
        energy: 100,
        maxEnergy: 100,
        foodCaching: 0, // food being carried
        caches: [],  // locations of caches
        bodyTemperature: 100,
        thermalInsulation: 0.9, // percent kept per hour
        health: 5,
        maxHealth: 5,
        Iframes: 0,
        hawksEscaped: 0,

        gamePlaying: false,
        gameOver: false,
        gameResult: "n/a",
        gameOverFade: 0,
        gameOverTransisionDone: false,

        width: 100,
        height: 100,

        flapCounter: 0,
        flapVel: -1,
        flapPeriod: 60,
        victoryPoints: 0
    }
    

    jay.findDirection = function(){
        if(this.velocity.x > 0){
            this.direction = 1;
        } else if(this.velocity.x < 0){
            this.direction = 0;
        }
    }

    jay.flapSprite = function(){
        if(this.flying){
            this.flapPeriod = frameRate() / 3;
            if(this.flapCounter > 0){
                jay.sprite = images.jayFlight1[jay.direction];
            } else{
                jay.sprite = images.jayFlight2[jay.direction];
            }
            if(this.flapPeriod - abs(this.flapCounter) <= 0){
                this.flapVel*=-1;
            }
            this.flapCounter+=this.flapVel;
        }
    };

    jay.draw = function(){
        this.findDirection();
        if(this.flying){
            this.flapSprite();
        } else{
            this.sprite = images.jaySprite[this.direction];
        }

        
        if(this.flying){
            let theta = atan(this.acceleration.y / this.acceleration.x)/20;
            push();
            translate(width/2, this.displayPoint.y);
            rotate(theta);

            if(jay.Iframes > 0){
                image(this.sprite, 10*sin(world.time/10), 10*sin(world.time/10), 100, 100)
            }
            image(this.sprite, 0, 0, 100, 100);

            pop();
        } else{
            if(jay.Iframes > 0){
                image(this.sprite, 10*sin(world.time/10) + jay.displayPoint.x, jay.displayPoint.y + 10*sin(world.time/10), 100, 100)
            }
            image(this.sprite, width/2, this.displayPoint.y, 100, 100);
        }


    };

    jay.hop = function(){
        if(mouseIsPressed && !this.flying && !this.hopping && !this.isPerched){
            this.airborne = true;
            this.hopping = true;
            this.position.y-=15;
            this.velocity.y = -5;
            this.acceleration.y = -0.8;
            if(mouseX < width/2){
                this.velocity.x = -5;
                this.acceleration.x = -0.1;
            } else{
                this.velocity.x = 5;
                this.acceleration.x = 0.1;
            }
        }

    }

    jay.onDoubleClick = function(){
        console.log("double click")
        if(!this.flying){
            this.hopping = false;
            this.flying = true;
            this.airborne = true;
        }
    };

    jay.fly = function(){
        if(this.flying){
            let dir = createVector(mouseX - this.displayPoint.x, mouseY - this.displayPoint.y);
            dir.normalize();
            this.acceleration = dir;

            let modifier = 1 + (this.energy / this.maxEnergy * 0.33);
            this.velocity.limit(this.maxFlightSpeed * modifier);
        }
    };

    jay.move = function(){
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        if(this.hopping){
            this.acceleration.y+=0.5;
        }
        
        
        if(this.position.y > world.findGroundHeight(this.displayPoint.x)){
            this.airborne = false;
            this.flying = false;
            this.hopping = false;
            this.velocity.set(0, 0);
            this.acceleration.set(0, 0);
        }
        
    };

    jay.stop = function(){
        this.velocity.x = 0;
        this.velocity.y = 0;
        this.acceleration.x = 0;
        this.acceleration.y = 0;
    };

    jay.land = function(){
        if(this.tryingToLand){
            if(dist(world.nest.position.x, world.nest.position.y, this.position.x, this.position.y) < 50){
                this.stop();
                this.position.x = world.nest.position.x;
                this.position.y = world.nest.position.y;
                this.inNest = true;
                this.isPerched = true;
                this.flying = false;
                this.airborne = false;
                this.tryingToLand = false;
            }
        

            let frame = world.xRangeInFrame()
            let branches = [];
            for(var i = 0; i < world.objects.trees.length; i++){
                if(withinRange(world.objects.xPositions[i], frame[0] - world.maxTreeBranchLength, frame[1] + world.maxTreeBranchLength)){
                    branches = branches.concat(world.objects.trees[i].branches)
                }
            }

            for(var i = 0; i < branches.length; i++){
                let branch = branches[i];
                let jOrigin = createVector(jay.position.x - branch.origin.x, jay.position.y - branch.origin.y);
                let isSameSide = (jOrigin.x < 0 && branch.direction === -1) || (jOrigin.x > 0 && branch.direction === 1)
                if(isSameSide && dist(jay.position.x, jay.position.y, branch.origin.x, branch.origin.y) < branch.radius){
                    // We know our radius for our jay
                    let branchSlope = (branch.origin.y - branch.endPoint.y) / (branch.origin.x - branch.endPoint.x);
                    // formula of line for branch: y = x * branchSlope + branch.origin.y
                    let branchY = branchSlope * jOrigin.x + branch.origin.y
                    if(linearDist(branchY, jay.position.y) < 5){
                        this.stop();
                        this.position.y = branchY - 25;
                        this.isPerched = true;
                        this.flying = false;
                        this.airborne = false;
                        this.tryingToLand = false;
                    }
                }
            }
        }
    }

    jay.eat = function(){
        if(!this.flying && key.toLowerCase() === "e"){
            let foodSources = world.objects.fruitTrees.concat(jay.caches);
            for(var i = 0; i < foodSources.length; i++){
                var food = foodSources[i];
                if(food.level > 0 && dist(food.x, food.y, jay.position.x, jay.position.y) < 50){
                    food.level--;

                    /*
                    Metabolism for a specific temperature
                    M = 55.3 - 0.657t

                    M = energy intake
                    T = time
                    */
                    jay.hunger+=(55.3 - 0.657 * world.temperature) / 3;
                    if(jay.hunger > jay.maxHunger){
                        jay.hunger = jay.maxHunger;
                    }
                    return;
                }
            }
        }
    };

    jay.storeFood = function(){
        if(!jay.flying && !jay.isPerched && key.toLowerCase() === "c"){
            if(jay.foodCaching < 1){
                // store food in "crop"
                let foodSources = world.objects.fruitTrees.concat(jay.caches);
                for(var i = 0; i < foodSources.length; i++){
                    var food = foodSources[i];
                    if(food.level > 0 && dist(food.x, food.y, jay.position.x, jay.position.y) < 50){
                        food.level--;
                        jay.foodCaching++;
                        return;
                    }
                }
            }

            // if not on a food source, try to create a chache
            if(jay.foodCaching > 0){
                for(var i = 0; i < jay.caches.length; i++){
                    let cache = jay.caches[i];
                    if(dist(cache.x, cache.y, jay.position.x, jay.position.y) < 600){
                        return;
                    }
                }
                jay.caches.push(new jay.FoodCache());
                jay.foodCaching--;
            }
        }
    };

    

    jay.FoodCache = function(){
        this.x = jay.position.x;
        this.y = world.findGroundHeight(jay.position.x);
        this.level = 1;
        this.type = "cache";
    }

    
    jay.manageFoodCaches = function(){
        for(var i = 0; i < this.caches.length; i++){
            let cache = this.caches[i];
            let x = world.findXInFrame(cache.x);
            
            noStroke();
            fill(0, 255, 0, 100);
            ellipse(world.findXInFrame(cache.x), world.findYInFrame(cache.y), 100, 100)
            stroke(0);

            if(cache.level < 1){
                this.caches.splice(i, 1);
            }
        }

        if(random(1) < 1/FPS/180){
            this.loseFoodCaches();
        }
    }

    jay.loseFoodCaches = function(){
        for(var i = 0; i < this.caches.length; i++){
            if(random(1) > 0.9){
                this.caches[i].level = 0;
            }
        }
    }

    jay.find = function(){
        if(jay.finding){
            noStroke()
            fill(0, 200, 0, 100);
            for(var i = 0; i < jay.caches.length; i++){
                let cache = jay.caches[i];
                //let dir = createVector(cache.x - jay.position.y, cache.y - jay.position.y);
                //dir.normalize();
    
    
                let theta = atan((jay.position.y - cache.y) / (jay.position.x - cache.x));
    
                if(jay.position.x > cache.x){
                    theta+=PI;
                }
    
    
                push();
                translate(jay.displayPoint.x, jay.displayPoint.y);
                rotate(theta);
                ellipse(100, 0, 30, 10);
                pop();
            }
    
    
            // locate nest
            fill(200, 100, 0, 100);
            let theta = atan((jay.position.y - world.nest.position.y) / (jay.position.x - world.nest.position.x));
    
            if(jay.position.x > world.nest.position.x){
                theta+=PI;
            }
    
    
            push();
            translate(jay.displayPoint.x, jay.displayPoint.y);
            rotate(theta);
            ellipse(100, 0, 30, 10);
            pop();
    
            stroke(0);
        }
    }

    onKeyPress.push(function(){
        if(key === "f"){
            if(jay.finding){
                jay.finding = false;
            } else{
                jay.finding = true;
            }
        }
    })




    onKeyPress.push(jay.eat);
    onKeyPress.push(jay.storeFood);

    jay.calcVictoryPoints = function(){
        this.victoryPoints = this.caches.length / 2 + this.hawksEscaped + world.day * 3;
    }


    jay.endGame = function(){
        if(!this.gameOver){
            if(this.hunger <= 0 || this.health <= 0 || this.energy <= 0){
                console.log("too bad")
                this.gameOver = true;
                this.gameResult = "defeat";
            } else if(this.victoryPoints >= 20){
                if(!this.gameOver){
                    switchTrack(soundTrack.victory, true);
                }
                this.gameOver = true;
                this.gameResult = "victory";
            }
        } else {
            //console.log(this.gameOverFade/(60*3) * 255)
            let brightness = 255;
            if(this.gameResult === "defeat"){
                brightness = 0;
            }

            let alpha = (this.gameOverFade/(60*3) * 255)
            noStroke();
            fill(brightness, brightness, brightness, alpha);

            rect(0, 0, 1200, 800);

            let invertBrightness = 255 - brightness;
            textSize(100);
            fill(invertBrightness, invertBrightness/2, invertBrightness/2, alpha)
            text(this.gameResult, width/2, height/2)
            textSize(12);
            if(this.gameOverFade <= 60*3){
                this.gameOverFade++;
            } else{
                jay.gameOverTransisionDone = true;
            }
            
        }

    };

    jay.reset = function(){
        console.log("reset")
        if(this.gameResult === "defeat"){
            this.caches = [];
        }

        for(var i = 0; i < world.objects.fruitTrees.length; i++){
            if(world.objects.fruitTrees[i].level < 2){
                world.objects.fruitTrees[i].level = round(random(0, 4));
            }
        }


        // reset jay
        jay.position.x = world.nest.position.x;
        jay.position.y = world.nest.position.y 
        jay.inNest = true;
        jay.isPerched = true;

        // stop movement
        jay.airborne = false;
        jay.flying = false;
        jay.hopping = false;
        jay.velocity.x = 0;
        jay.velocity.y = 0;
        jay.acceleration.x = 0;
        jay.acceleration.y = 0;

        
        // re-do stats
        jay.health = jay.maxHealth;
        jay.hunger = 100;
        jay.bodyTemperature = 100;
        jay.hawksEscaped = 0;


        // reset other
        hawks = [];


        // turn off the game over message
        jay.gameOver = false;
        jay.gameOverFade = 0;
        jay.gameResult = "n/a";
        jay.gameOverTransisionDone = false;
    };

    jay.updateStats = function(){
        ////////// take hunger
        this.hunger-=this.maxHunger/(world.hourLen * 24)
        
            // for flying
            if(jay.airborne){
            if(jay.flying){
                this.hunger-=this.maxHunger/(world.hourLen * 24) * 4;
            }
        }

        // heal
        if(this.health < this.maxHealth){
            this.health+=1 / FPS / 60 / 12;
            if(this.inNest){
                this.health+=1 / FPS / 30;
            }

            if(this.health > this.maxHealth){
                this.health = this.maxHealth;
            }
        }

        // tire
        let modifier = ((this.energy / this.maxEnergy) + 1) * 3;
        
        if(!this.isPerched){
            this.engergy-=1 / FPS * modifier;
            if(this.flying){
                this.energy-=1 / FPS / 24 * modifier;
            }

            if(!world.isDay()){
                this.energy-=1 / FPS / (257 - world.darkness)
            }
        } else{
            this.energy+=1 / 60 / 12 * modifier;
            if(this.inNest){
                this.energy+=1 / 60 / 12 * modifier;
            }
            if(this.energy > this.maxEnergy){
                this.energy = this.maxEnergy;
            }
        }

        // take temperature penalty on energy and hunger
        let difference = 42 - world.temperature / 30;
        this.energy-=1 / FPS / difference;
        this.hunger-=1 / FPS / difference;

    };

    

    jay.controlDisplayPoint = function(){
        /*for(var i in keys){
            if(keys[i] === "w"){
                this.displayPoint.y-=10;
            } else if(key[i] === "s"){
                this.displayPoint.y+=10;
            } else if(keys[i] === "a"){
                this.displayPoint.x-=10;
            } else if(keys[i] === "d"){
                this.displayPoint.x+=10;
            }
        }*/
    };
}
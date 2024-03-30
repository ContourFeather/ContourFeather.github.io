function createCharacter(){
    console.log("make character")
    jay = {
        airborne: false,
        flying: false,
        hopping: false,
        tryingToLand: false,
        inNest: true,
        isPerched: true, // ok yes being in the nest doesn't normally count as perching
        position: createVector(0, 0),
        velocity: createVector(0, 0),
        acceleration: createVector(0, 0),
        maxFlightSpeed: 10,
        direction: 1,
        sprite: images.jaySprite[this.direction],

        displayPoint: createVector(width/2, height-200),
        hunger: 100,
        maxHunger: 100,
        foodCaching: 0, // food being carried
        caches: [],  // locations of caches
        bodyTemperature: 100,
        thermalInsulation: 0.9, // percent kept per hour
        width: 100,
        height: 100,

        flapCounter: 0,
        flapVel: -1,
        flapPeriod: 60
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
            image(this.sprite, 0, 0, 100, 100);
            pop();
        } else{
            image(this.sprite, width/2, this.displayPoint.y, 100, 100);
        }
    };

    jay.hop = function(){
        if(mouseIsPressed && !this.flying && !this.hopping && !this.isPerched){
            this.airborne = true;
            this.hopping = true;
            this.position.y-=15;
            this.velocity.y = -5;
            this.acceleration.y = -0.5;
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
            dir.mult(0.05)
            this.acceleration = dir;
            this.velocity.limit(this.maxFlightSpeed);
        }
    };

    jay.move = function(){
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        if(this.airborne){
            this.acceleration.y+=0.5;
        }
        
        let acSign = sign(this.acceleration.x);
        if(!this.flying){
            this.acceleration.x-=acSign/10;
        }
        if(sign(this.acceleration.x) !== acSign){
            this.acceleration.x = 0;
        }


        let vSign = sign(this.velocity.x);
        if(!this.flying){
            this.velocity.x-=vSign/100;
        }
        if(sign(this.velocity.x) !== vSign){
            this.velocity.x = 0;
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
            if(dist(world.nest.position.x, world.nest.position.y, this.position.x, this.position.y) < 25){
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
                        this.position.y = branchY;
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
        if(key.toLowerCase() === "e"){
            let foodSources = world.objects.fruitTrees.concat(jay.caches);
            for(var i = 0; i < foodSources.length; i++){
                var food = foodSources[i];
                if(food.level > 0 && dist(food.x, food.y, jay.position.x, jay.position.y) < 50){
                    food.level--;
                    jay.hunger+=10;
                    if(jay.hunger > jay.maxHunger){
                        jay.hunger = jay.maxHunger;
                    }
                    return;
                }
            }
        }
    };

    jay.storeFood = function(){
        if(key.toLowerCase() === "c"){

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

            // if not on a food source, try to create a chache
            if(jay.foodCaching > 0){
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
    }

    onKeyPress.push(jay.eat);
    onKeyPress.push(jay.storeFood);

    jay.updateStats = function(){
        // take hunger
        this.hunger-=this.maxHunger/(world.hourLen * 24)

        // take temperature
        this.bodyTemperature-= (1-world.currentTemperature) * (100/(world.hourLen) * (1 - this.thermalInsulation));
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
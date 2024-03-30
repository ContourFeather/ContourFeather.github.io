function generateWorld(){
    world = {
        screenNodes: [],
        seed: random(1, 2),
        roughness: 100,
        dayLength: 60 * 60 * 12,
        hourLen: 60 * 60, // real minute = game hour
        time: 60 * 60 * 5,
        meridian: "p",
        dayRange: [9, 6], // am/pm
        dayColor: color(200, 200, 250),
        nightColor: color(50, 50, 50),
        sunRiseColor: color(200, 150, 100),
        skyColor: color(200, 200, 250),
        maxTemperature: 1,
        minTemperature: 0,
        dayTemperature: monteCarlo(this.minTemperature, this.maxTemperature),
        nightTemperature: monteCarlo(this.minTemperature, this.maxTemperature, false),
        currentTemperature: 0,
        trees: [],
        maxTreeBranchLength: 300
    };

    for(var i = 0; i < width; i++){
        world.screenNodes.push(i);
    }

    
    // gives range of x values that are being desplayed
    world.xRangeInFrame = function(){
        return [jay.position.x - width/2, jay.position.x + width/2];
    };

    // switches between am and pm
    world.switchMeridian = function(){
        if(this.meridian === "a"){
            this.meridian = "p";
        } else{
            this.meridian = "a";
        }
    }

    // counts time
    world.countTime = function(){
        this.time++;
        if(this.findHour() > 12){
            this.time = 0;
            this.switchMeridian();
        }
    }
    
    world.isDay = function(){
        let hour = floor(this.findHour());
        if((hour > this.dayRange[0] && this.meridian === "a") || (hour < this.dayRange[1] && this.meridian === "p")){
            return true;
        }
        return false;
    };

    // give current hour as decimal
    world.findHour = function(){
        return this.time/this.hourLen;
    }

    // sunset / sunrise
    world.colorTransition = 0;
    world.currentTransition = 0;
    world.findSkyColor = function(){
        let hour = world.findHour();

        if(floor(hour) === world.dayRange[0] && world.meridian === "a"){ // from night to day
            this.colorTransition++;
            if((hour - floor(hour)) * this.hourLen < this.hourLen/2){  // if going from night to sunrise
                this.skyColor = lerpColor(world.nightColor, world.sunRiseColor, world.colorTransition/(world.hourLen/2));
                this.currentTransition = 0;
                
            } else{
                if(world.currentTransition === 0){
                    this.currentTransition = 1;
                    this.colorTransition = 0;
                }
                this.skyColor = lerpColor(world.sunRiseColor, world.dayColor, world.colorTransition/(world.hourLen/2));

            }
        } else if(floor(hour) === world.dayRange[1] && world.meridian === "p"){  // day to night
            this.colorTransition++;
            if((hour - floor(hour)) * this.hourLen < this.hourLen/2){  // if going from day to sunset
                this.skyColor = lerpColor(world.dayColor, world.sunRiseColor, world.colorTransition/(world.hourLen/2));
                this.currentTransition = 1;
                
            } else{
                if(world.currentTransition === 1){
                    this.currentTransition = 0;
                    this.colorTransition = 0;
                }
                this.skyColor = lerpColor(world.sunRiseColor, world.nightColor, world.colorTransition/(world.hourLen/2));

            }
        } else{
            this.colorTransition = 0;
        }
    }

    world.setTemperature = function(){
        if(world.isDay()){
            world.currentTemperature = 0.9
        } else{
            world.currentTemperature = 0.2;
        }
    };

    // makes height for a world node on screen
    world.generateHeight = function(x){
        //return map(sin(x + jay.position.x/50), 0, 1, 0, 100) + height - 200;
        return map(noise(x + jay.position.x/this.roughness), 0, 1, 0, 100) + height - 200;
    }

    // finds height at a specific x coordinate
    world.findGroundHeight = function(x){
        return this.generateHeight(x/this.roughness)
    }

    // finds the relative positon of a x coordinate in the frame
    world.findXInFrame = function(x){
        let frame = world.xRangeInFrame();
        return x-frame[0]
    };
    world.findYInFrame = function(y){
        let feetHeight = this.findGroundHeight(jay.displayPoint.x);
        return y + linearDist(feetHeight, jay.position.y) - linearDist(feetHeight, jay.displayPoint.y)
    }


    world.draw = function(){
        world.findSkyColor();
        background(this.skyColor);
        
        this.renderObjects();

        let frame = this.xRangeInFrame();

        fill(255)
        noStroke();
        beginShape();
        for(var i = frame[0]; i <= frame[1]; i++){
            let x = this.findXInFrame(i)
            var h = this.findYInFrame(this.findGroundHeight(x)) + 20

            vertex(x, h);

           
        }
        vertex(width, height);
        vertex(0, height);
        endShape();

        stroke(0);
       
    };


}
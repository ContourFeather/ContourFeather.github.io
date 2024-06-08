function generateWorld(){
    world = {
        screenNodes: [],
        seed: random(1, 2),
        roughness: 100,
        dayLength: 60 * 60 * 12,
        hourLen: 60 * 60, // real minute = game hour
        time: 60 * 60 * 10,
        day: 0,
        meridian: "a",
        dayRange: [9, 6], // am/pm
        dayColor: color(200, 200, 250),
        nightColor: color(50, 50, 50),
        sunRiseColor: color(200, 150, 100),
        skyColor: color(200, 200, 250),
        temperature: 10,
        trees: [],
        maxTreeBranchLength: 300,
        skippingNight: false,
        skipTransition: 0,
        darkness: 0
    };

    for(var i = 0; i < width; i++){
        world.screenNodes.push(i);
    }

    
    // gives range of x values that are being desplayed
    world.xRangeInFrame = function(){
        return [jay.position.x - width/2, jay.position.x + width/2];
    };
    world.yRangeInFrame = function(){
        return [jay.position.y - height/2, jay.position.y + height/2];
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
        if(this.findHour() > 11){
            this.time = this.hourLen;
            if(this.meridian === "p"){
                this.day++
            }
            this.switchMeridian();
        }
    }


    world.jumpHour = function(){
        if(key === "h"){
            world.time+=world.hourLen;
        }
    }
    onKeyPress.push(world.jumpHour) 

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

        /*let meridianAddition = 0;
        if(world.meridian === "p"){
            meridianAddition = 12;
        }
        if(world.isDay() && world.findHour() + meridianAddition > world.dayRange[0] + 1){
            this.skyColor = this.dayColor;
        } else if(!world.isDay() && world.findHour() + meridianAddition > world.dayRange[1] + 1){
            this.skyColor = this.nightColor;
        }*/

        if(world.isDay()){
            if(world.time > world.dayRange[0] + 1 && world.meridian === "a"){
                world.darkness = 0;
                this.skyColor = this.dayColor;
            }
        }
    }


    world.darknessCounter = 0;
    world.findDarkness = function(){
        let time = world.findHour();
        if(!world.isDay()){
            if(world.meridian === "a"){
                if(time > world.dayRange[0] && time < world.dayRange[0] + 1){
                    this.darknessCounter++;
                    world.darkness = 255 - this.darknessCounter / this.hourLen * 255;
                } else{
                    this.darkness = 0;
                    this.darknessCounter = 0;
                }
            } else {
                if(time > world.dayRange[1] + 1){
                    this.darkness = 255;
                    this.darknessCounter = 0;
                } else{
                    this.darknessCounter++;
                    this.darkness = this.darknessCounter / this.hourLen * 255;
                }
            }
        }

        
    }

    tempMap = generateTEMP(14)
    console.log(tempMap)
    world.setTemperature = function(){
        let currentHour = world.findHour()
        let low = tempMap[world.day][floor(currentHour)] // previous hour
        let high = tempMap[world.day][ceil(currentHour)] // next our
        let percentHour = (currentHour-floor(currentHour)) // percent of way though hour
        let temp = percentHour * high + (1-percentHour) * low;

        world.temperature = temp;


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

    world.skipNight = function(){
        // start skipping
        if(!this.isDay() && jay.inNest && hawks.length === 0){
            this.skippingNight = true;            
        } 


        if(this.skippingNight){

            // stop skipping if conditions are no longer met
            if((this.isDay() && !this.skipTransition >= FPS * 5) || !jay.inNest || hawks.legnth > 0){
                this.skippingNight = false;
                this.skipTransition = 0;
                return;
            }

            this.skipTransition++;

            let opacity;
            if(this.skipTransition < FPS*5){
                opacity = (this.skipTransition / (FPS * 5)) * 255;
            } else{
                if(!world.isDay()){
                    world.time = FPS * 60 * (world.dayRange[0] + 1);
                    world.meridian = "a";
                }
                opacity = ((FPS * 5) / this.skipTransition) * 255;
                jay.energy = jay.maxEnergy;
            }
            background(0, 0, 0, opacity);
            
            /* 
            this.health+=1 / FPS / 60 / 24;
            if(this.inNest){
                this.health+=1 / FPS / 60;
            */

            this.health++;

            if(this.skipTransition > FPS * 10){
                console.log(world.findHour())
                this.skippingNight = false;
                this.skipTransition = 0;
            }
        }
    };


    world.draw = function(){
        world.findSkyColor();
        background(this.skyColor);
        
        this.renderObjects();

        let frame = this.xRangeInFrame();

        fill(255 - this.darkness);
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

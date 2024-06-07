function loadHUD(){
    let makeGradientBar = function(v, mv, c1, c2, x, y, w, h){
        let percent = v / mv;
        let length = percent * w;
        for(var i = 0; i < length; i++){
            stroke(lerpColor(c1, c2, i/w))
            line(x + i, y, x + i, y + h)
        }
        stroke(0);
        noFill();
        rect(x, y, w, h) 
    }

   
    let graphTemp = function(){
        let dayTemp = tempMap[world.day]
        stroke(255, 0, 0)
        noFill()
        beginShape()
        for(var i = 0; i < dayTemp.length; i++){
            vertex(i*15 + 50, dayTemp[i] * 10 + 600)
        }
        endShape()
        stroke(0)
    }
    
    let showBarStats = function(){
        fill(0);
        text("Health: ", 10, 30);
        makeGradientBar(jay.health, jay.maxHealth, color(0), color(255, 0, 0), 80, 20, 150, 10);

        text("Hunger: ", 10, 50);
        makeGradientBar(jay.hunger, jay.maxHunger, color(50, 0, 40), color(100, 200, 150), 80, 40, 150, 10); // hunger bar
        
        text("Energy: ", 10, 70);
        makeGradientBar(jay.energy, jay.maxEnergy, color(0), color(255, 255, 0), 80, 60, 150, 10);

        text("Points: ", 10, 90);
        makeGradientBar(jay.victoryPoints, 20, color(255, 255, 0), color(255, 0, 0), 80, 80, 150, 10);

        let gameHour = world.findHour();
        let gameMins = floor((gameHour - floor(gameHour)) * 60);

        text("Time: " + floor(gameHour) + ":" + gameMins + world.meridian + "m", 10, 110);
        text("temperature: " + floor(world.temperature * 10) / 10 + "˚C", 10, 130);
    }

    let devHUD = function(){
        text("position: " + round(jay.position.x) + ", " + round(jay.position.y), 10, 10);
        text("acceleration: " + round(jay.acceleration.x) + ", " + round(jay.acceleration.y), 10, 30);
        text("velocity: " + round(jay.velocity.x) + ", " + round(jay.velocity.y), 10, 50);
        text("FPS: " + round(frameRate()), 10, 70);
        text("hour: " + floor(world.findHour()*10)/10 + world.meridian + "m", 10, 90);
        text("time: " + world.time, 10, 110);
        text("food holding: " + jay.foodCaching, 10, 130);
        text("# of caches: " + jay.caches.length, 200, 130)
        text("temperature: " + world.temperature + "˚C", 10, 150);
        text("day: " + world.day, 10, 170);
        text("Hawks escaped: " + jay.hawksEscaped, 10, 190);
        text("is day: " + world.isDay(), 200, 190);
    };


    displayHUD = function(){
        //graphTemp()
        showBarStats()
        
    }
}
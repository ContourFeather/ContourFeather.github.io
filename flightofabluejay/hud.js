function loadHUD(){
    makeGradientBar = function(v, mv, c1, c2, x, y, w, h){
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

    showMovement = function(){
        fill(30, 50, 40);
        ellipse(100, height-100, 150, 150)

        stroke(0, 255, 0);
        let velocity = toPolar(jay.velocity.x, jay.velocity.y);
        let radius = velocity.x / jay.maxFlightSpeed * 35;
        velocity = toCartesian(radius, jay.velocity.y);
        line(100, height-100, velocity.x + 100, velocity.y + height-100);

        stroke(255, 0, 0);
        let acceleration = toPolar(jay.acceleration.x, jay.acceleration.y);
        radius = acceleration.x * 35;
        acceleration = toCartesian(acceleration.x, jay.acceleration.y);
        line(100, height-100, acceleration.x + 100, acceleration.y + height-100);

        stroke(0)
    }
    showBarStats = function(){
        makeGradientBar(jay.hunger, jay.maxHunger, color(50, 0, 40), color(100, 200, 150), 50, 200, 150, 10); // hunger bar
        makeGradientBar(jay.bodyTemperature, 100, color(0, 200, 255), color(255, 0, 0), 50, 250, 150, 10);  // temperature bar
        makeGradientBar(world.currentTemperature, 1, color(0, 200, 255), color(255, 255, 0), 50, 270, 150, 10);
    }
    displayHUD = function(){
        showMovement();
        showBarStats()
        text("position: " + round(jay.position.x) + ", " + round(jay.position.y), 10, 10);
        text("acceleration: " + round(jay.acceleration.x) + ", " + round(jay.acceleration.y), 10, 30);
        text("velocity: " + round(jay.velocity.x) + ", " + round(jay.velocity.y), 10, 50);
        text("FPS: " + round(frameRate()), 10, 70);
        text("hour: " + floor(world.findHour()*10)/10, 10, 90);
        text("time: " + world.time, 10, 110);
        text("food holding: " + jay.foodCaching, 10, 130);
    }
}
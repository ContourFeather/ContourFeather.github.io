placeObjects = function(){
    world.objects = {
        trees: [],
        fruitTrees: [],
        xPositions: [], // all x coordinate of objects
        currentArray: 1, // which array to use
        inFrame: [], // all objects in the frame
    },

    world.TreeBranch = function(x, y, i){
        this.origin = createVector(x, y);

        this.direction = sign(tan(y));
        /*if(random(1) > 0.5){
            direction = -1
        }*/
        this.theta = random(TAU/8, TAU/4) * this.direction - TAU/4;
        this.radius = random(100, world.maxTreeBranchLength);
        this.endPoint = toCartesian(this.radius, this.theta);
        this.endPoint.add(x, y);
        //this.endPoint = createVector(this.origin.x + random(-100, 100), this.origin.y + 100)
        
        this.i = i;
        
        
    }
    world.Tree = function(x){
        this.x = x;
        this.height = random(500, 800);
        this.branches = [];
        let brightness = random(0, 100);
        this.color = color(brightness, brightness/2, 0)

        for(var i = 0; i < this.height; i+=80){
            let baseHeight = world.findGroundHeight(this.x)
            let y = baseHeight - (this.height - i)
            if(y > baseHeight-this.height && y < baseHeight){
                this.branches.push(new world.TreeBranch(this.x, y, i))
            } 
        }
        
    };


    world.Tree.prototype.draw = function(){
        stroke(this.color);

        let feetHeight = world.findGroundHeight(jay.displayPoint.x);


        let x = world.findXInFrame(this.x)
        var h = world.findGroundHeight(x) //  Absolute height
        + linearDist(feetHeight, jay.position.y) // shifts down when jay's Y increases
        - linearDist(feetHeight, jay.displayPoint.y)
        + 20
        

        strokeWeight(50)
        line(x, h, x, h-this.height);
        strokeWeight(10)
        for(var i = 0; i < this.branches.length; i++){
            let branch = this.branches[i];
            let originX = world.findXInFrame(branch.origin.x);
            let originY = world.findYInFrame(branch.origin.y);
            let endX = world.findXInFrame(branch.endPoint.x);
            let endY = world.findYInFrame(branch.endPoint.y);
            line(originX, originY, endX, endY);
        }
        strokeWeight(1)
        stroke(0)
    }
    
    world.nest = {};
    world.nest.findX = function(){
        
        let tree = world.objects.trees[round(world.objects.trees.length/2)];

        let branch = tree.branches[0];
        this.theta = branch.theta;
        this.radius = branch.radius / 2;
        this.position = toCartesian(this.radius, this.theta);
        this.position.add(branch.origin);


        jay.position.x = this.position.x;
        jay.position.y = this.position.y
    }
    world.nest.draw = function(){
        let theta = this.theta;
        if(this.direction === -1){
            theta+=TAU/2;
        }
        push();
        translate(world.findXInFrame(this.position.x), world.findYInFrame(this.position.y));
        rotate(theta)
        image(images.nest, 0, 0, jay.width + 20, jay.height/2);
        pop();
    }

    world.fruitTree = function(x){
        this.x = x;
        this.y = world.findGroundHeight(x);
        this.position = createVector(this.x, this.y);
        this.level = round(random(0, 4));
    };
    world.fruitTree.prototype.draw = function(){
        image(images.fruitTree[this.level], world.findXInFrame(this.x), world.findYInFrame(this.y), 100, 150)
    };

    // Add objects to world
    for(var i = 0; i < 1000; i++){
        if(random(1) > 0.9){
            let r = random(0.7, 1.3)
            world.objects.fruitTrees.push(new world.fruitTree(i*1000*r));
        }
    }

    for(var i = 0; i < 1000; i++){
        if(random(1) > 0.5){
            let r = random(0.7, 1.3)
            world.objects.trees.push(new world.Tree(i*1000*r));
            world.objects.xPositions.push(i * 1000*r);
        }
    }

    console.log("trees done")
    world.nest.findX(); // place nest

    

    world.renderObjects = function(){
        let frame = this.xRangeInFrame();
        for(var i = 0; i < this.objects.trees.length; i++){
            if(withinRange(world.objects.xPositions[i], frame[0] - world.maxTreeBranchLength, frame[1] + world.maxTreeBranchLength)){
                this.objects.trees[i].draw();
            }
        }
        for(var i = 0; i < this.objects.fruitTrees.length; i++){
            if(withinRange(world.objects.fruitTrees[i].x, frame[0] - 100, frame[1] + 100)){
                world.objects.fruitTrees[i].draw();
            }
        }
        world.nest.draw()
    };
};
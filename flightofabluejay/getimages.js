function getImages(){
    console.log("Load Images");
    images = {
        jaySprite: [loadImage("./assets/Sprites/bluejayspriteleft.png"), loadImage("./assets/Sprites/bluejaysprite.png")],
        jayFlight1:[loadImage("./assets/Sprites/bluejayflight1left.png"), loadImage("./assets/Sprites/bluejayflight1.png")],
        jayFlight2:[loadImage("./assets/Sprites/bluejayflight2left.png"), loadImage("./assets/Sprites/bluejayflight2.png")],
        
        hawkFlight1:[loadImage("./assets/Sprites/hawkflight1left.png"), loadImage("./assets/Sprites/hawkflight1.png")],
        hawkFlight2:[loadImage("./assets/Sprites/hawkflight2left.png"), loadImage("./assets/Sprites/hawkflight2.png")],
        
        nest: loadImage("./assets/Sprites/nest.png"),
        fruitTree: [loadImage("./assets/Sprites/fruittree/emptytree.png"), loadImage("./assets/Sprites/fruittree/levelone.png"), loadImage("./assets/Sprites/fruittree/leveltwo.png"), loadImage("./assets/Sprites/fruittree/levelthree.png"), loadImage("./assets/Sprites/fruittree/levelfour.png")]
    };
}

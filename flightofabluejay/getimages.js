function getImages(){
    console.log("load images with poor organization");
    images = {
        jaySprite: [loadImage("./assets/bluejayspriteleft.png"), loadImage("./assets/bluejaysprite.png")],
        jayFlight1:[loadImage("./assets/bluejayflight1left.png"), loadImage("./bluejayflight1.png")],
        jayFlight2:[loadImage("./assets/bluejayflight2left.png"), loadImage("./assets/bluejayflight2.png")],
        
        hawkFlight1:[loadImage("./assets/sprites/hawkflight1left.png"), loadImage("./assets/hawkflight1.png")],
        hawkFlight2:[loadImage("./assets/hawkflight2left.png"), loadImage("./assets/hawkflight2.png")],
        
        nest: loadImage("./assets/nest.png"),
        fruitTree: [loadImage("./assets/fruittree/emptytree.png"), loadImage("./assets/fruittree/levelone.png"), loadImage("./assets/fruittree/leveltwo.png"), loadImage("./assets/fruittree/levelthree.png"), loadImage("./assets/fruittree/levelfour.png")]
    };
}

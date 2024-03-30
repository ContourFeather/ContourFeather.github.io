function getMusic(){
    soundTrack = {
        day: "./assets/music/Snowy Day.wav",
        night: "./assets/music/Snowy Night.WAV",
        foodCaching: "./assets/music/Food cache song.wav",
    };

    music = document.createElement("audio");
    function startMusic(){
        music.src = soundTrack.day;
        music.play();
    }

    nextSoundTrack = function(){
        if(music.ended){
            if(world.isDay()){
                music.src = soundTrack.day;
            } else{
                music.src = soundTrack.night;
            }
            music.play();
        }
    };
    startMusic();
}
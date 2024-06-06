function getMusic(){
    soundTrack = {
        day: "./assets/music/Snowy Day.wav",
        night: "./assets/music/Snowy Night.WAV",
        foodCaching: "./assets/music/Food cache song.wav",
        hawks: "./assets/music/Birds Of Prey.wav",
        victory: "./assets/music/Victory Song.wav"

    };

    music = document.createElement("audio");
    function startMusic(){
        music.src = soundTrack.day;
        music.play();
    }

    switchTrack = function(track, instantly){
        if(music.ended){
            music.load();
            music.src = track;
            music.play();
        }
        if(instantly){
            music.load();
            music.src = track;
            music.play();
        }

    };

    chooseTrack = function(){
        let src;
        if(hawks.legnth > 0){
            src = soundTrack.hawks;
        } else if(jay.flying && random(1) > 0.7){
            src = soundTrack.foodCaching;
        } else if(world.isDay()){
            src = soundTrack.day;
        } else{
            src = soundTrack.night;
        }
        return src;
    }

    nextSoundTrack = function(){
        let desiredTrack = chooseTrack();
        switchTrack(desiredTrack);
        
    };
    startMusic();
}
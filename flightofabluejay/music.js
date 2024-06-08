function getMusic(){
    soundTrack = {
        day: "./assets/Music/Snowy Day.wav",
        night: "./assets/Music/Snowy Night.WAV",
        foodCaching: "./assets/Music/Food cache song.wav",
        hawks: "./assets/Music/Birds Of Prey.wav",
        victory: "./assets/Music/Victory Song.wav"

    };

    music = document.createElement("audio");

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
}

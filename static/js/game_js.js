$(document).ready(function(){
GAMESTATE = "READY";
game = {position: 0};
isRest = false;
TIMEREMAINING = [];
timerID = [];
timerID2 = [];

var model = {
  init: function(){
    localStorage = JSON.stringify([]);
    var data = [];
    $.get("/getData")
      .done(function(server_data){
        for (var i = 0; i < server_data.length; i++){
          data.push({name: server_data[i].name, time: server_data[i].time, rest: server_data[i].rest});
        }  
      })
      .fail(function(jqxhr, textStatus, error){
        var err = textStatus + ", " + error;
        console.log("Get Request Failed: " + err); 
      });

    localStorage.exercises = JSON.stringify(data);
  },

  get_nth: function(n){
    return JSON.parse(localStorage.exercises)[n];
  },

  get_length: function(){
    return JSON.parse(localStorage.exercises).length;

  },
  add: function(exc){
    var data = JSON.parse(localStorage.exercises);
    data.push(exc);
    localStorage.exercises = JSON.stringify(data);
  }


};

var controller = {

  init: function(){
    //model.init();
    view.init();
    controller.handle_workout();
  },

  handle_timer: function( t , d3){
      TIMEREMAINING = t;
      view.display_time( t );
      if (t === 0){
        timerID2 = setTimeout(function(){ d3.resolve(); }, 1000);
      }
      if (t > 0) {
        timerID = setTimeout(function(){ t--; controller.handle_timer(t, d3); }, 1000 );
      }

    },

    handle_rest: function(time){
      isRest = true;
      var d2 = new $.Deferred();
      view.display_name( "Rest");
      this.handle_timer( time, d2  );
      $.when(d2).done(function(){
        if (isRest){
        game.position++;
        controller.handle_workout();
        }
      });
    },

    handle_exercise: function(name, time, rest){
      view.display_name( name );
      var d1 = new $.Deferred();
        this.handle_timer( time, d1 );
        var controller = this;
        $.when(d1).done(function(){
          controller.handle_rest(rest);
        });
    },

    handle_workout: function(){
      GAMESTATE = "PLAYING";
      isRest = false;
      if (game.position < model.get_length(       game.position )){
        var exercise = model.get_nth(  game.position  );
        controller.handle_exercise(exercise.name, exercise.time, exercise.rest);
      }
      else {
        view.display_end();
      }
    },

    pause: function(){

      window.clearTimeout(timerID);

      window.clearTimeout(timerID2);
      GAMESTATE = "PAUSED";
    },

    resume: function(){
      GAMESTATE = "PLAYING";
      var exercise = model.get_nth(  game.position  );
      if (isRest){
        controller.handle_rest(TIMEREMAINING);
      }
      else{
        controller.handle_exercise(exercise.name, TIMEREMAINING, exercise.rest);
      }
    }

  };


var view = {
    init: function(){
    //     $(document).keypress(function( event ) {
    //     if ( event.which == 32 ) {
    //       if (GAMESTATE == "PLAYING") {
    //         controller.pause(); }
    //       else if (GAMESTATE == "PAUSED") {
    //           controller.resume(); }
    //     }
    // });
      $("#pause").click(function(){
        console.log(GAMESTATE);
         if (GAMESTATE == "PLAYING") {
             controller.pause();
             $(this).html("Resume");
             $("#myModal").modal('show');
         }
          else {
              controller.resume(); 
              $(this).html("Pause");
          $("#myModal").modal('hide');
          }
              
        
      });
      
      $('#myModal').on('hidden.bs.modal', function (e) {
          if (GAMESTATE == "PLAYING") {
             controller.pause();
             $("#pause").html("Resume");
             $("#myModal").modal('show');
         }
          else {
              controller.resume(); 
              $("#pause").html("Pause");
          $("#myModal").modal('hide');
          }
        
      });
      $("#skip").click(function(){
        controller.pause();
        game.position++;
        controller.handle_workout();
      });
      $("#restart").click(function(){
        controller.pause();
        isRest = false;
        controller.handle_workout();
      });
    },

    display_time: function(t){
      $(".timer").text(t);
    },

    display_name: function(name){
      $(".current-exercise-header").text(name);
    },

    display_end: function(name){
      $(".current-exercise").text("Congrats");
      $(".timer").text("");
    },

};

controller.init();

});
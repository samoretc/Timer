$(document).ready(function(){
GAMESTATE = "READY";
game = {position: 0};
isRest = false;
TIMEREMAINING = [];
timerID = [];
timerID2 = [];
globalTitle = ''
  var model = {
    init: function(){
      localStorage = JSON.stringify({});
      var data = [];

      $(".exc").each(function(){
        var name = $(this).find(".e").text();
        var time = $(this).find(".time").text();
        var rest = $(this).find(".rest").text();

        var parent = $(this).siblings(".titlehidden").text();
        console.log("parent: " + parent);
        data.push({
          parent: parent, 
          name: name,
          time: time,
          rest: rest, 
        });
      });
      //localStorage[parent]['exercises'] = JSON.stringify(data);
      localStorage['exercises'] = JSON.stringify(data);
    },

    get_nth: function(n, parent){
      var these_exercises = JSON.parse(localStorage.exercises).filter(function(elm){ 
        return elm.parent === parent; 
      });
      return these_exercises[n];
    },

    get_length: function(parent){
      var these_exercises = JSON.parse(localStorage.exercises).filter(function(elm){ 
        return elm.parent === parent; 
      });

      return these_exercises.length;

    }


  };

  var controller = {
    init: function(){
      model.init();
      view.init();
    },
    add: function(exc){
      model.add(exc);
      view.add_exercise(exc);
    },

    handleEditModal: function(button){
      var header = button.data('id'); // Extract info from data-* attributes
      $("#table_header").val(header);
      var workout_data = button.siblings('.workout_data');
      $("#first-row").addClass("hidden");
      controller.getEachExercise(workout_data);
    },

    getEachExercise: function(workout_data){
      workout_data.find(".exc").each(function(){
        var exercise_name = $(this).find(".e").text();
        var exercise_time = $(this).find(".time").text();
        var exercise_rest = $(this).find(".rest").text()
        controller.setModalTable(exercise_name, exercise_time, exercise_rest);
      });

    },

    setModalTable: function(exercise_name, exercise_time, exercise_rest){
        var $newRow = $("#template-row").clone();
        $newRow.removeClass("hidden");
        $newRow.removeAttr("id");
        $newRow.addClass("temp-exc");
        $newRow.find('.e_name').val(exercise_name);
        $newRow.find('.e_time').val(exercise_time);
        $newRow.find('.e_rest').val(exercise_rest);
        $newRow.find(".delete-exer").click(function(){
          $(this).closest("tr").remove();
        });
        $newRow.appendTo( $("#exc-table"));
        
    },
    handleAJAX: function(){
       var workout_header = $("#table_header").val();
        var exercises = [];
        $(".data-row").each(function(){
          console.log("reached inside function");
          if ($(this).hasClass("hidden")) {}
          else{
            exercises.push( {
              "name": $(this).find(".e_name").val(),
              "time": $(this).find(".e_time").val(),
              "rest": $(this).find(".e_rest").val()
           } );
        }
        });

        var datatoSend = {  "workout": workout_header,
                            "exercises": exercises };
                  

    
        
        $.post( "/insertworkout", datatoSend).done(function(data){
      console.log("Response JSON: " + JSON.stringify(data)); 
      
    }).fail( function(jqxhr, textStatus, error){
      console.log("POST failed: " + textStatus + ", " + error); 
    });
        
        $('#insert-exc-modal').modal('hide');
          // location.reload();
           setTimeout(function() {
            console.log("reached");
            location.reload();
          
    }, 500);
      

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
      view.display_name( name )
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
      if (game.position < model.get_length( globalTitle )){
        console.log("game position" + game.position + "  length  "+  model.get_length( globalTitle) );
        var exercise = model.get_nth(  game.position, globalTitle  );
        controller.handle_exercise(exercise.name, exercise.time, exercise.rest);
      }
      else {
        console.log('reached end');
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
      var exercise = model.get_nth(  game.position, globalTitle  );
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
      $( "#sortable" ).sortable();
      $( "#sortable" ).disableSelection();
      $('.li').on('dragStart', function (e) {
        var $this = $(this);
        $this.width( $this.width() );
        $this.height( $this.height() );
      });

      $(".begin").click(function(){
          $("#homepage").addClass("hidden"); 
          $("#workout_play").removeClass("hidden"); 
          globalTitle = $(this).siblings(".workout_header").text();
          

          controller.handle_workout();

      });

      //Open Modal
      $('#insert-exc-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget); // Button that triggered the modal
        if (button.data('modaltype') === 'edit'){
          controller.handleEditModal(button);
        }
      });

      //Within Modal
      $(".add-exercise").click(function(){
        var $newRow = $("#template-row").clone();
        $newRow.removeClass("hidden");
        $newRow.removeAttr("id");
        $newRow.addClass("temp-exc data-row");
        $newRow.find(".delete-exer").click(function(){
          $(this).closest("tr").remove();
        });
        $newRow.appendTo( $("#exc-table"));
      });


      //Modal Close
      $('#insert-exc-modal').on('hidden.bs.modal', function (e) {
        $("#first-row").removeClass("hidden");
        $('.temp-exc').remove();
        $("input").val("");
      });

    $(".delete-exer").click(function(){
      $(this).closest("tr").remove();
    });

    $("#insert-exc-modal").keypress(function(e){
      if (e.which == 13){
       controller.handleAJAX();      
       }   
    });

    $("#add-workout").click(function(){
      controller.handleAJAX();
     });

    $("#delete_workout").click(function(){
      var workout_name = $(this).siblings(".workout_header").text();
      var datatoSend = {"workout_name": workout_name}
        $.post( "/delete", datatoSend).done(function(data){
      console.log("Response JSON: " + JSON.stringify(data)); 
      
    }).fail( function(jqxhr, textStatus, error){
      console.log("POST failed: " + textStatus + ", " + error); 
    });
 
      setTimeout(function() {
        location.reload();
          
    }, 500);


    });

    $("#begin_workout").click(function(){
      $(".go").removeClass("hidden");
      $()
    });

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

      $("#goback").click(function(){
          console.log("reached");
         location.reload();
      });

    },
    add_exercise: function(exercise) {
      var $new_exc = $("#exc-template").clone().removeClass("hidden");
      $new_exc.find(".e").text(exercise.name);
      $new_exc.find(".time").text(exercise.time);
      $new_exc.appendTo("#sortable");
    },

    display_time: function(t){
      $(".timer").text(t);
    },

    display_name: function(name){
      $(".current-exercise-header").text(name);
    },

    display_end: function(name){
      $(".current-exercise-header").text("Congrats!");
      $(".timer").text("");
    }

  };
  controller.init();
  console.log("init");
});



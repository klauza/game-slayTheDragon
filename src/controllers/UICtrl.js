import LocalStorageCtrl from './LocalStorage.js';
import LevelCtrl from './Level.js';
import PersonCtrl from './PersonCtrl.js';


const UICtrl = (function(){
  const UISelectors = {
    formSubmit: '#start-button',
    startingInput: '#start-input',
    createInput: '#create-input',
    buttonAfterLayoutLoad: '.button-with-class'
  }

  
  const person = {
    items: [], // stores characters from renderPeople
    stage: 0
  }

  return {
    getSelectors: function(){
      return UISelectors;
    },
    getStage: function(){
      return person.stage;
    },
    updateStage: function(){
      person.stage++;
      //console.log('stage updated, now stage: ', person.stage);
    },
    
    showScore: function(){
      let score = LocalStorageCtrl.getScore(); // get score
      LevelCtrl.updateScoreFromLS(score);
      if( score.length === 0 ){ score=Number(score); }  // sets score to 0 if the LS does not exist yet

      //console.log('score is: ',score);
      
      document.querySelector('.scoreValue').textContent = score; 
    },

    getPersonById: function(id){
      // loop through the items and match the id

      let found = null;
      person.items.forEach(function(item){
        if(item.id === id){
          found = item;
        }
      });

      return found;
    },

  

    // Starting animation, display ="block" all UI
    showPersonUi: function(){
      setTimeout(() =>{
        const buttons = document.querySelectorAll(UISelectors.buttonAfterLayoutLoad);
        // console.log(buttons);
        buttons.forEach((button) => {
          button.style.display = "block";
          setTimeout(()=> {
            button.style.opacity = "1";
          }, 50)
        });
        document.querySelector('.statistics').style.display = "block";
        setTimeout(()=> {
          document.querySelector('.statistics').style.opacity = "1";
        }, 50)

      }, 2500)
    },


    renderPeople: function(data){
      document.querySelector('.welcome-text').style.display = "block";  // show text
    
      // get actor ids data from ls to be filtered
      let idsFromLS = LocalStorageCtrl.getIdFromStorage();
      
      // filter out completed actors and create new array 'filtered'
      var filtered = data.filter(function(e){
          return this.indexOf(e.id) < 0;
        }, idsFromLS
      );

      let output = '';

      // check if game is completed     ------------------------------ GAME COMPLETED ---------------------------------
      if(filtered == ''){
        alert("Congratulations, you have completed all tasks, click reset button to start over xD");

      } else {

        filtered.forEach(function(post, index){

          person.items.push(post);  // put each json unit into person.items
          let delay = index*150;
          output += 
          `
          <div id="${post.id}" class="person-block" style="animation-delay: ${delay}ms">
            <div class="person-block_img">
              <img class="front" src="${post.image}">
              <img class="back ${post.adjust}" src="${post.gif}">
            </div>
          </div>
          `;
          
        });

        /* "?" Random Block "?" */
        let actorLength = filtered.length;  // get number of actors
        let delay = actorLength*150;
        output += 
        `
        <div class="random-block" style="animation-delay: ${delay}ms">
            <div class="random-block_img">
              <img src="./img/random.jpg">
            </div>
          </div>
        `;
        
        document.querySelector('.content').innerHTML = output;
        return data
      }
    },

   
    // Add Animation on clicked person [ starting phase ]
    getItemClickEvents: function(){
      const persons = document.querySelectorAll(".person-block");
      persons.forEach((person)=>{
        person.addEventListener('click', function(){

          setTimeout(()=>{
            document.querySelector('.fill-background-top > .welcome-text').style.opacity ="0";
          }, 150);

          setTimeout(()=>{
            let textNode = document.querySelector('.welcome-text');
            // let parent = document.querySelector('.fill-background-top');
            
            textNode.style.animation = "animationText forwards 2.5s";
            textNode.textContent = "Okay, let's start! - click me to begin.";
            
           
          }, 625)


          
          // Setting the coords of person
          let clickedPerson = this;
          let clickedPersonCoords = this.getBoundingClientRect();
          //console.log(clickedPersonCoords);
          let positionLeft = (clickedPersonCoords.x);    // distance from left edge
          let positionTop = (clickedPersonCoords.y);          // distance from top edge

          let contentWidth = document.querySelector('.content').getBoundingClientRect().width;
          let personBlockWidth = this.getBoundingClientRect().width;
          personBlockWidth = personBlockWidth/2;
          positionLeft = positionLeft-contentWidth/2;
          positionLeft = positionLeft+personBlockWidth;
          
          positionTop = positionTop-200;

          // hide siblings of chosen actor
          let content = Array.from(document.querySelector('.content').children);
          content.map((item) => item.style.display ='none' ); // hide all blocks

           
          // set CSS of clicked element
          let personCssSetBeforeAnimation = `display: block; transform: translate(${positionLeft}px, ${positionTop}px);`;
          //clickedPerson.style.cssText = personCssSetBeforeAnimation;
          clickedPerson.style.cssText = personCssSetBeforeAnimation;
          
          // animate chosen block to the top left corner
          personAnimationToTop(clickedPerson);

          // move the item to the top center
          function personAnimationToTop(person){
            setTimeout(function(){
              person.style.transition = 'transform 2s';
              person.style.transform = `translate(0, -200px)`;
              person.childNodes[1].style.animation = "image-to-top-animate 2s forwards"; // select img to animate
       
            }, 550);
            
          }
          person.style.pointerEvents = "none";    // prevent from clicking multiple times

        
          
        });
       });
       
    },

    setIndicator: function(level, color){
      let indicator = document.querySelector(`.progress_bar--${level}`);
      indicator.style.backgroundColor = color;
    },

    continueGame: function(){
      console.log('Actor questions complete!');
      document.querySelector('.welcome-text').textContent = "Actor riddles completed!"; // change text before level 2 start
      LocalStorageCtrl.addScore(4);
      let actor = PersonCtrl.getPerson();
      let actorId = actor.id;
      LocalStorageCtrl.setPersonIdToLS(actorId);  // put id to local storage to filter it out at new game
  
      document.querySelector('.nextActor').style.opacity = "1";
      document.querySelector('.nextActor').style.transform = 'translateY(-600px) translateX(-50%)';
      document.querySelector('.nextActor').style.transition = '250ms all ease';

    },

    winGame: function(){
      console.log('Game completed');
      document.querySelector('.local-storage-reset').style.transform = 'translateY(-600px) translateX(-50%)';
      document.querySelector('.statistics').style.display = "none";
      document.querySelector('.content').style.display = "none";
      document.querySelector('.button-container').style.display = "none";
    },

    resetGame: function(e){
      e.preventDefault();
      // empty local storage
      LocalStorageCtrl.deletePersonFromLocalStorage();
      LocalStorageCtrl.deleteIdFromLS();
      LocalStorageCtrl.deleteScore();
  
      location.reload(true);
    },
    cleanUI: function(){

    },
    
    gameOver: function(){

      let totalScore = LevelCtrl.getScore();
      if(totalScore == ''){
        totalScore = 0;
      }
      if(totalScore===1){
        totalScore = totalScore+' point';
      } else { totalScore = totalScore+' points'}

      let level = LevelCtrl.getLevel();    // get level
      UICtrl.setIndicator(level, 'red'); // set red indicator

      document.querySelector('#game-over-points').textContent = totalScore;
      
      document.querySelector('#restart').addEventListener('click', UICtrl.resetGame);
      document.querySelector('.statistics').style.display = "none";
      document.querySelector('.content').style.display = "none";
      document.querySelector('.button-container').style.display = "none";
      document.querySelector('.answers').style.display = "none";
      document.querySelector('.welcome-text').style.display = "none";
      document.querySelector('.scoreDiv').style.display = "none";
      document.querySelector('.local-storage-reset').style.display = "none";

      document.querySelector('.game-over').style.display = "grid";
    }
    
   
  }
})();

export default UICtrl;
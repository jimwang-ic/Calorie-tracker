var anyDB = require('any-db');
var conn = anyDB.createConnection('sqlite3://database.db');


/**
 * 
 * Takes in meal object and adds its contents to database
 * Meal object will be {
 * 	[food],time
 * }
 * 
 */
function addMeal(meal) {
  food = meal['food']
  time = meal['time']
  for (int i = 0; i < food.length; i++) {
    conn.query('INSERT INTO calendar VALUES ($1,$2,$3,$4,$5,$6)', time,food[0],food[1],food[2],food[3],food[4]) 
    .on('end', function() {
      console.log('Made table!');
    });
  }
  
}



/**
 * given day returns meal
 * 
 */
function getMeal(time) {
  var item = conn.query('SELECT * FROM calendar WHERE datetime = $1',time)
}
Calorie-tracker
===============
## Overview
This is the final project for cs132.

We use **node.js** as our web server, and access to the food/calorie database through **FatSecretAPI**. (<http://platform.fatsecret.com/api/>)

--- 
### Module in Node.js

**express** : as our web application framework

**sqlite3** : as our database 

**Mustache**  : as our templating language

**Hogan** : as our templating engines 

**Dnode** : make PHP and node.js talk to each other

---

### FatSecretAPI
We wrote our FatSecret REST API calls using PHP, Dnode make it possible for Node.js to call PHP functions through TCP connection. 

(The source code for FatSecret REST API calls is here : <https://github.com/danny2000tw/php_server_fatAPI>)

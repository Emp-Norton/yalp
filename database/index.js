const mysql = require('mysql');
// requiring all the database querying functions from v2 team
const v2functions = require('./v2-index.js');

let connection;

if (process.env.JAWSDB_URL) {
  connection = mysql.createConnection({
    host: 'lg7j30weuqckmw07.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'ybr7ph732nxw8g1g',
    password: 'cmk1cc2z3q81thtz',
    database: 'e36d84um3m6uotkz'
  })
} else {
  connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'toor',
    database: 'yalp'
  })
}

const getUser = function (user, cb) {
  //user obj contain username & pw for authentication
  let query = `SELECT * FROM users;`

  connection.query(query, (err, results) => {
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const postUser = function (user, cb) {

  let test = connection.query(`SELECT * FROM users WHERE users.name = "${user.name}"`);

  if (test.length) {
    cb(false)
  } else {
    let query = `INSERT INTO users (name, email, password, username) VALUES (?, ?, ?, ?);`

    connection.query(query, [user.name, user.email, user.password, user.username], (err, results) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, results);
      }
      return;
    })
  }
}

//get user by id

const getUserByUsername = function (user, cb) {

  let query = `SELECT * FROM users WHERE users.username = ? AND users.password = ?;`

  connection.query(query, [user.username, user.password], (err, results) => {
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

//get business by id

const getBusinessById = function (id, cb) {

  let query = `SELECT businesses.name FROM businesses WHERE businesses.id = ${id};`

  connection.query(query, (err, results) => {
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const addFriend = function (userId, friendId, cb) {

  let query = `INSERT INTO friends (user_id1, user_id2) VALUES (${userId}, ${friendId});`;

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err)
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const friendChecker = function (userId, friendId, cb) {

  let query1 = `SELECT friends.user_id2 FROM friends WHERE friends.user_id1 = ${userId} AND friends.user_id2 = ${friendId};`;
  let query2 = `SELECT friends.user_id1 FROM friends WHERE friends.user_id2 = ${userId} AND friends.user_id1 = ${friendId};`;
  let checker = false;

  connection.query(query1, (err, results) => {
    if (err) {
      cb(err)
    } else if (results.length) {
      checker = true;
    }
  })
  connection.query(query2, (err, results) => {
    if (err) {
      cb(err)
    } else if (results.length) {
      checker = true;
    }
  })
  cb(null, checker);
}

const getFriendsReviews = function (userId, businessId, cb) {

  let query = `SELECT reviews.text, reviews.user_id, reviews.rating FROM reviews INNER JOIN friends ON friends.user_id1 = ${userId} AND friends.user_id2 = reviews.user_id AND reviews.business_id = "${businessId}";`

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err)
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

//get non-friends' reviews for a specific business

const getStrangersReviews = function (userId, businessId, cb) {

  let query = `SELECT reviews.text, reviews.user_id, reviews.rating FROM reviews WHERE reviews.text NOT IN (SELECT reviews.text FROM reviews INNER JOIN friends ON friends.user_id1 = ${userId} AND friends.user_id2 = reviews.user_id) AND reviews.business_id = "${businessId}";`

  connection.query(query, (err, results) => {
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const checkFavorite = function (userId, businessId, cb) {

  let query = `SELECT * FROM favorites WHERE favorites.user_id = ? AND favorites.business_id = ?;`

  connection.query(query, [userId, businessId], (err, results) => {
    if (err) {
      cb(err, false);
    } else {
      if (results.length) {
        cb(null, true)
      } else {
        cb(null, false)
      }
    }
  })
}

const addFavorite = function (userId, businessId, businessName, cb) {
  checkFavorite(userId, businessId, (err, bool) => {
    if (bool) {
      cb(null, false)
    } else {
      let query = `INSERT INTO favorites (user_id, business_id, business_name) VALUES (?, ?, ?);`

      connection.query(query, [userId, businessId, businessName], (err, results) => {
        if (err) {
          cb(err, false)
        } else {
          cb(null, true)
        }
      })
    }

  })
}

const checkCheckIn = function (userId, businessId, cb) {

  let query = `SELECT * FROM checkins WHERE checkins.user_id = ${userId} AND checkins.business_id = "${businessId}";`

  connection.query(query, (err, results) => {
    if (err) {
      cb(err)
    } else {
      if (results.length) {
        cb(null, true)
      } else {
        cb(null, false)
      }
    }
  })
}

//for a particular business, return all checkins of friends
  //requires two separate checkin functions (getCheckins1 & getCheckins2), since friends table operates in two directions.
const getFriendsCheckins1 = function(userId, businessId, cb) {

  let query = `SELECT checkins.user_id, checkins.createdAt FROM checkins INNER JOIN friends ON friends.user_id1 = ${userId} AND checkins.business_id = ${businessId} AND friends.user_id2 = checkins.user_id;`;

  connection.query(query, (err, results) => {
    console.log(results)
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const getFriendsCheckins2 = function(userId, businessId, cb) {

  let query = `SELECT checkins.user_id, checkins.createdAt FROM checkins INNER JOIN friends ON friends.user_id2 = ${userId} AND checkins.business_id = ${businessId} AND friends.user_id1 = checkins.user_id;`;

  connection.query(query, (err, results) => {
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const getFriendsFavorites1 = function(userId, businessId, cb) {

  let query = `SELECT favorites.user_id, favorites.createdAt FROM favorites INNER JOIN friends ON friends.user_id1 = ${userId} AND favorites.business_id = ${businessId} AND friends.user_id2 = favorites.user_id;`;

  connection.query(query, (err, results) => {
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const getFriendsFavorites2 = function(userId, businessId, cb) {

  let query = `SELECT favorites.user_id, favorites.createdAt FROM favorites INNER JOIN friends ON friends.user_id2 = ${userId} AND favorites.business_id = ${businessId} AND friends.user_id1 = favorites.user_id;`;

  connection.query(query, (err, results) => {
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const addCheckIn = function (userId, businessId, businessName, cb) {
  checkCheckIn(userId, businessId, (err, bool) => {
    if (bool) {
      cb(false)
    } else {
      let query = `INSERT INTO checkins (user_id, business_id, business_name) VALUES (${userId}, "${businessId}", "${businessName}");`

      connection.query(query, (err, results) => {
        if (err) {
          cb(err)
        } else {
          cb(null, results)
        }
      })
    }
  })
}

//temp function for searches, using mock data

const tempSearch = function (search, cb) {
  let query = `SELECT * FROM businesses;`

  connection.query(query, (err, results) => {
    if (err) {
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const addNewReview = function (userId, businessId, review, cb) {

  let query = 'INSERT INTO reviews (user_id, business_id, rating, text) VALUES (?, ?, ?, ?)';
  let params = [userId, businessId, review.rating, review.text];

  connection.query(query, params, (err, results) => {
    if (err) {
      console.log(err)
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const getUsernameById = function(userId, cb) {
  let query = `SELECT * FROM users WHERE id=${userId}`;

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err)
      cb(err)
    } else {
      cb(null, results)
    }
  })
}

const getFavorite = function (userId, cb) {
  let query = 'SELECT * from favorites where favorites.user_id = ?';

  connection.query(query, [userId], (err, results) => {
    if (err) {
      cb(err, null);
    } else {
      cb(null, results);
    }
  });
};

const getFriends = function(userId, cb) {
    let query = 'select users.* from (select * from friends where user_id1 = ?) a left join users on a.user_id2 = users.id;';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            cb(err, null);
        } else {
            cb(null, results);
        }
    });
};

const getCheckins = function(userId, cb) {
   // let query = 'select a.id, businesses.name, a.createdAt from (select * from checkins where checkins.user_id = ?) a left join businesses on businesses.id = a.business_id;';
    let query = 'select * from checkins where user_id = ?;'
    connection.query(query, [userId], (err, results) => {
        if (err) {
            cb(err, null);
        } else {
            cb(null, results);
        }
    });
};

const getReviews = function(userId, cb) {
    let query = 'select a.id, businesses.name, a.text, a.rating, a.createdAt from (select * from reviews where reviews.user_id = ?) a left join businesses on a.business_id = businesses.id';

    connection.query(query, [userId], (err, results) => {
        if (err) {
            cb(err, null);
        } else {
            cb(null, results);
        }
    });

};

const getFavorites = function(userId, cb) {
    // let query = 'select a.id, businesses.name from (select * from favorites where favorites.user_id = ?) a left join businesses on businesses.id = a.business_id;';
    let query = 'select * from favorites where user_id = ?;';
    connection.query(query, [userId], (err, results) => {
        if (err) {
            cb(err, null);
        } else {
          console.log(results)
            cb(null, results);
        }
    });
};

const saveLocation = (userId, location, cb) => {
  let queryStr = 'UPDATE users SET location = ? where id = ?';
  let params = [location, userId];
  connection.query(queryStr, params, (err, results) => {
    if(err){
      cb(err, null);
    } else {
      cb(null, results);
    }
  });
}

const getLocation = (userID, cb) => {
  let queryStr = 'SELECT location FROM users WHERE id = ?';
  connection.query(queryStr, userID, (err, results) => {
    if(err) {
      cb(err, null)
    } else {
      cb(null, results)
    }
  })
}

//MYSQL QUERIES FOR:

// Businesses

// INSERT INTO businesses (name) VALUE ("Tu Lan");
// INSERT INTO businesses (name) VALUE ("Chipotle");
// INSERT INTO businesses (name) VALUE ("McDonalds");
// INSERT INTO businesses (name) VALUE ("Fancy Steak House");
// INSERT INTO businesses (name) VALUE ("Tempest");
// INSERT INTO businesses (name) VALUE ("Some Expensive Place");

//Users

// INSERT INTO users (name, email, password, username) VALUES ("Chris", "Chris@Chris.com", "Chris", "ChrisChris");
// INSERT INTO users (name, email, password, username) VALUES ("Kayleigh", "Kayleigh@Kayleigh.com", "Kayleigh", "Kayleigh");
// INSERT INTO users (name, email, password, username) VALUES ("Connor", "Connor@Connor.com", "Connor", "Connor");
// INSERT INTO users (name, email, password, username) VALUES ("Peter", "Peter@Peter.com", "Peter", "PeterPeterPumpkinEater");
// INSERT INTO users (name, email, password, username) VALUES ("Fred", "Fred@Fred.com", "Fred", "Fred");
// INSERT INTO users (name, email, password, username) VALUES ("Moises", "Moises@Chris.com", "BigCuddlyBear", "Weird");

//Reviews
//user_id, business_id, text

// INSERT INTO reviews (user_id, business_id, text) VALUES (1, 1, "this place is really tasty");
// INSERT INTO reviews (user_id, business_id, text) VALUES (2, 2, "this place sucks ass");
// INSERT INTO reviews (user_id, business_id, text) VALUES (3, 3, "this place could use better service");
// INSERT INTO reviews (user_id, business_id, text) VALUES (4, 4, "this place is pretty mediocre");
// INSERT INTO reviews (user_id, business_id, text) VALUES (5, 5, "this place is pretty good");
// INSERT INTO reviews (user_id, business_id, text) VALUES (6, 6, "this place is utter trash");

//CheckIns

// INSERT INTO checkins (user_id, business_id) VALUES (1, 1);
// INSERT INTO checkins (user_id, business_id) VALUES (2, 2);
// INSERT INTO checkins (user_id, business_id) VALUES (3, 3);
// INSERT INTO checkins (user_id, business_id) VALUES (4, 4);
// INSERT INTO checkins (user_id, business_id) VALUES (5, 5);
// INSERT INTO checkins (user_id, business_id) VALUES (6, 6);

//friends

// INSERT INTO checkins (user_id1, user_id2) VALUES (1, 2);
// INSERT INTO checkins (user_id1, user_id2) VALUES (1, 3);
// INSERT INTO checkins (user_id1, user_id2) VALUES (1, 4);
// INSERT INTO checkins (user_id1, user_id2) VALUES (1, 6);
// INSERT INTO checkins (user_id1, user_id2) VALUES (2, 3);
// INSERT INTO checkins (user_id1, user_id2) VALUES (2, 5);
// INSERT INTO checkins (user_id1, user_id2) VALUES (2, 6);
// INSERT INTO checkins (user_id1, user_id2) VALUES (3, 4);
// INSERT INTO checkins (user_id1, user_id2) VALUES (3, 5);
// INSERT INTO checkins (user_id1, user_id2) VALUES (3, 6);
// INSERT INTO checkins (user_id1, user_id2) VALUES (4, 6);
// INSERT INTO checkins (user_id1, user_id2) VALUES (5, 6);



//TEST FUNCTION CALLS

// connection.query(`SELECT * from USERS`, (err, results) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log(results);
//     }
// })

// postUser({ name: "testName", email: "testEmail", password: "testPassword", username: "testUsername" }, (err, results) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log(results)
//     }
// })

// getUserById(1, (err, results) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log(results);
//     }
// })

// getBusinessById(1, (err, results) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log(results);
//     }
// })


//connection.queries

module.exports = {
  v2functions,
  connection,
  getUser,
  postUser,
  getUserByUsername,
  getBusinessById,
  tempSearch,
  getStrangersReviews,
  getFriendsReviews,
  addFavorite,
  addCheckIn,
  checkCheckIn,
  checkFavorite,
  addNewReview,
  getUsernameById,
  getFavorite,
  getFriendsCheckins1,
  getFriendsCheckins2,
  addFriend,
  friendChecker,
  getFriends,
  getCheckins,
  getReviews,
  getFavorites,
  saveLocation,
  getLocation
}

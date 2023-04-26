const { Pool } = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});


pool.query(`SELECT title FROM properties LIMIT 10;`).then(response => {})


const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {

  return pool.query(`SELECT * FROM users WHERE email = $1`, [email])
  .then((result) => {
    // console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
  
//   let resolvedUser = null;
//   for (const userId in users) {
//     const user = users[userId];
//     if (user.email.toLowerCase() === email.toLowerCase()) {
//       resolvedUser = user;
//     }
//   }
//   return Promise.resolve(resolvedUser);
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {

  return pool.query(`SELECT * FROM users WHERE id = $1`, [id])
  .then((result) => {
    // console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });

  // return Promise.resolve(users[id]);
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool.query(`INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *`, [user.name, user.email, user.password])
  .then((result) => {
    // console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {

  return pool.query(`SELECT * FROM reservations WHERE guest_id=$1`, [guest_id])
  .then((result) => {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });

  // return getAllProperties(null, 2);
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
// const getAllProperties = function (options, limit = 10) {
  
//       return pool.query(`
//           SELECT properties.*, avg(property_reviews.rating) as average_rating
//           FROM properties
//           JOIN property_reviews ON properties.id = property_id
//           WHERE  city = $1, owner_id = $2, minimum_price_per_night = $3, maximum_price_per_night = $4, minimum_rating = $5)`, 
//           [city, owner_id, minimum_price_per_night, maximum_price_per_night, minimum_rating])  
          
          const getAllProperties = function (options, limit = 10) {
            // 2 
            console.log(options)
            let whereclausemap = {city: 'city like $', 
                          owner_id: 'owner_id = $',
                          minimum_price_per_night: 'cost_per_night > $', 
                          maximum_price_per_night: 'cost_per_night < $', 
                          minimum_rating: 'average_rating > $'
                        };
            let presentoptions = Object.keys(options).filter(key => options[key])
            let whereclause = presentoptions.map((key, index) => whereclausemap[key] + (index+1)).join(' AND ')
            // 1

            const queryParams = presentoptions.map(key => {
              console.log('key is', key)
              return whereclausemap[key].includes(' like ') ? `%${options[key]}%` : options[key]
            });

            // 
            let queryString = `
            SELECT properties.*, avg(property_reviews.rating) as average_rating
            FROM properties
            JOIN property_reviews ON properties.id = property_id
            ${(whereclause ? 'WHERE ' : '') + whereclause}
            `;
          
            // // 3
            // if (options.city) {
            //   queryParams.push(`%${options.city}%`);
            //   queryString += `WHERE city LIKE $${queryParams.length} `;
            // }
            // // 
            // if (options.minimum_cost) {
            //   queryParams.push(`%${options.minimum_cost}`);
            //   queryString += `WHERE minimum_cost`;
            // }
            // // 
            // if (options.maximum_cost) {
            //   queryParams.push(`%${options.maximum_cost}`);
            //   queryString += `WHERE maximum_cost`;
            // }
            // // 
            // if (options.minimum_rating) {
            //   queryParams.push(`%${options.minimum_rating}`);
            //   queryString += `WHERE minimum_rating`;
            // }
            // 4
            queryParams.push(limit);
            queryString += `
            GROUP BY properties.id
            ORDER BY cost_per_night
            LIMIT $${queryParams.length};
            `;
          
            // 5
            console.log(queryString, queryParams);
          
            // 6
            return pool.query(queryString, queryParams)
            // .then((res) => res.rows);
          
  // return pool.query(`SELECT * FROM properties LIMIT $1`, [limit])
      .then((result) => {
        console.log(result.rows);
        return result.rows;
      })
      .catch((err) => {
        console.log(err.message);
      });
  
  // const limitedProperties = {};
  // for (let i = 1; i <= limit; i++) {
  //   limitedProperties[i] = properties[i];
  // }
  // return Promise.resolve(limitedProperties);
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};

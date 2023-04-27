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

const getUserWithEmail = function (email) {

  return pool.query(`SELECT * FROM users WHERE email = $1`, [email])
  .then((result) => {
    // console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
};

//getuserwithid
const getUserWithId = function (id) {

  return pool.query(`SELECT * FROM users WHERE id = $1`, [id])
  .then((result) => {
    // console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
};

//AddUser
const addUser = function (user) {
  return pool.query(`INSERT INTO users(name, email, password) VALUES ($1, $2, $3) RETURNING *`, [user.name, user.email, user.password])
  .then((result) => {
    // console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
};

/// Reservations
const getAllReservations = function (guest_id, limit = 10) {

  return pool.query(`SELECT * FROM reservations WHERE guest_id=$1`, [guest_id])
  .then((result) => {
    console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
};

// Properties        
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

    const queryParams = presentoptions.map(key => {
      // console.log('key is', key)
      return whereclausemap[key].includes(' like ') ? `%${options[key]}%` : options[key]
    });

    let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    ${(whereclause ? 'WHERE ' : '') + whereclause}
    `;

    queryParams.push(limit);
    queryString += `
    GROUP BY properties.id
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
    `;
  
    console.log(queryString, queryParams);
  
    return pool.query(queryString, queryParams)
  
  .then((result) => {
    // console.log(result.rows);
    return result.rows;
  })
  .catch((err) => {
    console.log(err.message);
  });
};

//AddProperty
const addProperty = function (property) {

  return pool.query
  (`
  INSERT INTO properties(owner_id, title, description, thumbnail_photo_url, cover_photo_url, 
    cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, 
    number_of_bedrooms) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
    RETURNING *`, 
    [property.owner_id, property.title, property.description, property.thumbnail_photo_url, 
      property.cover_photo_url, property.cost_per_night, property.street, property.city,
      property.province, property.post_code, property.country, property.parking_spaces, 
      property.number_of_bathrooms, property.number_of_bedrooms]
  )
  .then((result) => {
    // console.log(result.rows[0]);
    return result.rows[0];
  })
  .catch((err) => {
    console.log(err.message);
  });
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};



// owner_id, title, description, thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms
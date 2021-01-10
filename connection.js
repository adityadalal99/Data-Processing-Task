const pgp = require('pg-promise')();

const client = {
  host: `${process.env.DB_HOST}`,
  port: process.env.DB_PORT,
  user: `${process.env.DB_USER}`,
  password: `${process.env.DB_PASS}`,
};

let db_connection = null;

exports.getConnection = async ()=>{
    return new Promise((resolve,reject) => {
        try{
            if(db_connection == null)
            {
                db_connection = pgp(client);
            }
            resolve(db_connection);
        }
        catch(er){
            console.error(er);
            reject(er);
        }
    });
};

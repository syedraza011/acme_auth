const Sequelize = require("sequelize");
const { STRING } = Sequelize;
const config = {
  logging: false,
};

if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);

const User = conn.define("user", {
  username: STRING,
  password: STRING,
});


User.byToken = async(token)=> {
    try {
      //function accepts a token, here we're searching for a user that includes that token and assigning it to a variable
      const user = await User.findByPk(token);
      // if user is true (we found a user!) then return it
      if(user){
        return user;
      }
      //otherwise do not and throw an error, instead
      const error = Error('bad credentials');
      error.status = 401;
      throw error;
    }
    catch(ex){
      const error = Error('bad credentials');
      error.status = 401;
      throw error;
    }
  };
  





// User.byToken = async (token) => {
//   try {
//     const user = await User.findByPk(token);
//     if (user) {
//       return user;
//     }
//     const error = Error("bad credentials");
//     error.status = 401;
//     throw error;
//   } catch (ex) {
//     const error = Error("bad credentials");
//     error.status = 401;
//     throw error;
//   }
// };

User.authenticate = async ({ username, password }) => {
  const user = await User.findOne({
    where: {
      username,
      password,
    },
  });
  if (user) {
    return user.id;
  }
  const error = Error("bad credentials");
  error.status = 401;
  throw error;
};

const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: "lucy_pw" },
    { username: "moe", password: "moe_pw" },
    { username: "larry", password: "larry_pw" },
  ];
  const [lucy, moe, larry] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  return {
    users: {
      lucy,
      moe,
      larry,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
  },
};

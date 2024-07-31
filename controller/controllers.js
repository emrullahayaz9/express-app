const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");

const users = [];
const registeredUsers = [];

const MainPageController = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      res.redirect("/welcome-admin");
    } else if (req.session.user.role === "normal_user") {
      res.redirect("/welcome-user");
    } else {
      res.redirect("/");
    }
  } else {
    res.render("MainPage");
  }
};

const AddUserGet = (req, res) => {
  res.render("AddUser");
};

const AddUserPost = async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(30).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional().allow(""),
    role: Joi.string().valid("admin", "normal_user").required(),
  });

  try {
    await schema.validateAsync(req.body);

    const { name, email, phone, role } = req.body;
    const id = uuidv4();

    const adminId = req.session.user.id;
    users.push({ id, name, email, phone, role, addedBy: adminId });

    res.redirect("/welcome-admin");
  } catch (error) {
    res.render("AddUser", { error: error.details[0].message });
  }
};

const DeleteUser = (req, res) => {
  const id = req.params.id;
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex > -1) {
    users.splice(userIndex, 1);
    res.redirect("/tum");
  } else {
    res.status(404).send("User not found");
  }
};

const UpdateUserGet = (req, res) => {
  const user = users.find((user) => user.id === req.params.id);
  if (user) {
    res.render("UpdateUser", { user });
  } else {
    res.status(404).send("User not found");
  }
};

const UpdateUserPost = async (req, res) => {
  const id = req.params.id;
  const { name, email, phone, role } = req.body;
  const userIndex = users.findIndex((user) => user.id === id);

  if (userIndex > -1) {
    const schema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      email: Joi.string().email().required(),
      phone: Joi.string().optional().allow(""),
      role: Joi.string().valid("admin", "normal_user").required(),
    });

    try {
      await schema.validateAsync(req.body);
      users[userIndex] = { id, name, email, phone, role };
      res.redirect("/tum");
    } catch (error) {
      res.render("UpdateUser", {
        user: req.body,
        error: error.details[0].message,
      });
    }
  } else {
    res.status(404).send("User not found");
  }
};

const RegisterUserGet = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      res.redirect("/welcome-admin");
    } else if (req.session.user.role === "normal_user") {
      res.redirect("/welcome-user");
    } else {
      res.redirect("/");
    }
  } else {
    res.render("register");
  }
};

const RegisterUserPost = async (req, res) => {
  const schema = Joi.object({
    username: Joi.string().min(1).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(2).required(),
    role: Joi.string().valid("admin", "normal_user").required(),
  });

  try {
    await schema.validateAsync(req.body);

    const { username, email, password, role } = req.body;
    const existingUser = registeredUsers.find((user) => user.email === email);
    if (existingUser) {
      throw new Error("Email already registered");
    }

    const id = uuidv4();
    registeredUsers.push({ id, username, email, password, role });
    res.redirect("/login");
  } catch (error) {
    console.log(error.message);
    res.render("register", {
      error: error.message || error.details[0].message,
    });
  }
};

const LoginUserGet = (req, res) => {
  if (req.session.user) {
    if (req.session.user.role === "admin") {
      res.redirect("/welcome-admin");
    } else if (req.session.user.role === "normal_user") {
      res.redirect("/welcome-user");
    } else {
      res.redirect("/");
    }
  } else {
    res.render("login");
  }
};

const LoginUserPost = async (req, res) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(2).required(),
  });

  try {
    await schema.validateAsync(req.body);

    const { email, password } = req.body;
    const user = registeredUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (user) {
      req.session.user = user;
      if (user.role === "admin") {
        res.redirect("/welcome-admin");
      } else if (user.role === "normal_user") {
        res.redirect("/welcome-user");
      } else {
        res.redirect("/");
      }
    } else {
      res.render("login", { error: "Invalid email or password" });
    }
  } catch (error) {
    res.render("login", { error: error.details[0].message });
  }
};

const WelcomeAdminGet = (req, res) => {
  if (req.session.user && req.session.user.role === "admin") {
    const adminUsers = users.filter(
      (user) => user.addedBy === req.session.user.id
    );
    res.render("WelcomeAdmin", {
      user: req.session.user,
      users: adminUsers,
    });
  } else {
    res.redirect("/login");
  }
};

const WelcomeNormalUserGet = (req, res) => {
  if (req.session.user && req.session.user.role === "normal_user") {
    res.render("WelcomeNormalUser", {
      user: req.session.user,
    });
  } else {
    res.redirect("/login");
  }
};
const LogoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out");
    }
    res.redirect("/login");
  });
};

module.exports = {
  MainPageController,
  LogoutUser,
  AddUserGet,
  AddUserPost,
  DeleteUser,
  UpdateUserGet,
  UpdateUserPost,
  RegisterUserGet,
  RegisterUserPost,
  LoginUserGet,
  LoginUserPost,
  WelcomeAdminGet,
  WelcomeNormalUserGet,
  users,
  registeredUsers,
};

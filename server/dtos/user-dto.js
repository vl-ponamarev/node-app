module.exports = class UserDto {
  email;
  id;
  isActivated;
  remember;
  role;

  constructor(model) {
    this.email = model.email;
    this.id = model._id;
    this.isActivated = model.isActivated;
    this.remember = model.remember;
    this.role = model.role;
  }
};

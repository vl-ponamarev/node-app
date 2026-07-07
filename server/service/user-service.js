const bcrypt = require('bcrypt')
const uuid = require('uuid')
const UserModel = require('../models/user-model')
const mailService = require('./mail-service')
const tokenService = require('./tokenService')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')

function resolveRole(email) {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(item => item.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase()) ? 'admin' : 'user';
}

class UserService {
  async registration(email, password) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`Пользователь c почтовым адресом ${email} уже существует`);
    }
    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = uuid.v4();
    const user = await UserModel.create({
      email,
      password: hashPassword,
      activationLink,
      role: resolveRole(email),
    });

    try {
      await mailService.sendActivationMail(
        email,
        `${process.env.API_URL}/activate/${activationLink}`,
      );
    } catch (error) {
      await UserModel.deleteOne({ _id: user._id });
      throw ApiError.ServiceUnavailable(
        'Не удалось отправить письмо для подтверждения почты. Попробуйте зарегистрироваться позже.',
      );
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest('Некорректная ссылка активации');
    }
    user.isActivated = true;

    await user.save();
  }

  async login(email, password, remember) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw ApiError.BadRequest('Пользователь с таким email не найден');
    }
    const isPasswordEquals = await bcrypt.compare(password, user.password);
    if (!isPasswordEquals) {
      throw ApiError.BadRequest('Неверный пароль');
    }
    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      { $set: { remember, role: resolveRole(email) } },
      { new: true },
    );
    const userDto = new UserDto(updatedUser);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }
    const user = await UserModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return {
      ...tokens,
      user: userDto,
    };
  }

  async getAllUsers() {
    const users = await UserModel.find();
    return users;
  }

  async getUserById(id) {
    const user = await UserModel.findById(id);
    return user;
  }
}

module.exports = new UserService();

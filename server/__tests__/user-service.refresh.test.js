const tokenService = require('../service/tokenService');
const UserModel = require('../models/user-model');

jest.mock('../service/tokenService');
jest.mock('../models/user-model');
jest.mock('../service/mail-service');

const UserService = require('../service/user-service');

describe('UserService.refresh', () => {
  beforeEach(() => jest.clearAllMocks());

  test('throws 401 when refresh token is missing', async () => {
    await expect(UserService.refresh(null)).rejects.toMatchObject({ status: 401 });
    await expect(UserService.refresh(undefined)).rejects.toMatchObject({ status: 401 });
    await expect(UserService.refresh('')).rejects.toMatchObject({ status: 401 });
  });

  test('throws 401 when refresh token is invalid (signature/expired)', async () => {
    tokenService.validateRefreshToken.mockReturnValue(null);
    tokenService.findToken.mockResolvedValue({ refreshToken: 'whatever' });

    await expect(UserService.refresh('bad-token')).rejects.toMatchObject({ status: 401 });
    expect(tokenService.generateTokens).not.toHaveBeenCalled();
  });

  test('throws 401 when refresh token is not persisted in DB (revoked)', async () => {
    tokenService.validateRefreshToken.mockReturnValue({ id: 'u1' });
    tokenService.findToken.mockResolvedValue(null);

    await expect(UserService.refresh('orphan')).rejects.toMatchObject({ status: 401 });
    expect(tokenService.generateTokens).not.toHaveBeenCalled();
  });

  test('returns a fresh token pair and user DTO for a valid refresh', async () => {
    const userDoc = { _id: 'u1', email: 'a@b.c', isActivated: true, remember: true };

    tokenService.validateRefreshToken.mockReturnValue({ id: 'u1' });
    tokenService.findToken.mockResolvedValue({ refreshToken: 'r' });
    UserModel.findById.mockResolvedValue(userDoc);
    tokenService.generateTokens.mockReturnValue({ accessToken: 'A', refreshToken: 'R' });
    tokenService.saveToken.mockResolvedValue({});

    const result = await UserService.refresh('r');

    expect(result).toEqual({
      accessToken: 'A',
      refreshToken: 'R',
      user: expect.objectContaining({
        id: 'u1',
        email: 'a@b.c',
        isActivated: true,
      }),
    });
    expect(tokenService.saveToken).toHaveBeenCalledWith('u1', 'R');
  });
});

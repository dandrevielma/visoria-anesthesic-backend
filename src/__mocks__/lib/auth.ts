// Mock better-auth for testing
export const auth = {
  handler: jest.fn(),
  api: {
    getSession: jest.fn(),
  },
};

export const betterAuth = jest.fn(() => auth);

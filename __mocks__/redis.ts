import { jest } from "@jest/globals";

module.exports = {
  createClient: jest.fn().mockReturnValue({
    on: jest.fn(),
    connect: jest.fn(),
    get: jest.fn(),
  }),
};

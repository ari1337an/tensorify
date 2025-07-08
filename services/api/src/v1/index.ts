import { initContract } from "@ts-rest/core";
import {
  contract as userGetUserContract,
  action as userGetUserAction,
} from "./user/getUser";

const c = initContract();

export const contracts = c.router(
  {
    userGetUser: userGetUserContract,
  },
  {
    pathPrefix: "/v1",
    strictStatusCodes: true,
  }
);

export const actions = {
  userGetUser: userGetUserAction,
};

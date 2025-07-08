import { initContract } from "@ts-rest/core";
import {
  contract as accountGetUserContract,
  action as accountGetUserAction,
} from "./account/getUser";
import {
  contract as userGetUserContract,
  action as userGetUserAction,
} from "./user/getUser";

const c = initContract();

export const contracts = c.router(
  {
    accountGetUser: accountGetUserContract,
    userGetUser: userGetUserContract,
  },
  {
    pathPrefix: "/v2",
    strictStatusCodes: true,
  }
);

export const actions = {
  accountGetUser: accountGetUserAction,
  userGetUser: userGetUserAction,
};

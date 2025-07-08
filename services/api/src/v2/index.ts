import { initContract } from "@ts-rest/core";
import {
  contract as getUserContract,
  action as getUserAction,
} from "./user/getUser";

const c = initContract();

export const contracts = c.router(
  {
    getUser: getUserContract,
  },
  {
    pathPrefix: "/v2",
    strictStatusCodes: true,
  }
);

export const actions = {
  getUser: getUserAction,
};

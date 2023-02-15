import { PLACE_SEARCHED } from "./constant";

export const historyPlaceSearched = (data = [], action) => {
  switch (action.type) {
    case PLACE_SEARCHED:
      return [action.data, ...data];
    default:
      return data;
  }
};

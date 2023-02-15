import { PLACE_SEARCHED } from "./constant"

export const placeSearched = (data) => {
    return {
        type: PLACE_SEARCHED,
        data
    }
}
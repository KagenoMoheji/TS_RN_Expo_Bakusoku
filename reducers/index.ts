import {combineReducers} from "redux";

import ReviewReducer from "./review_reducer";

// 複数のreducerをひとまとめにしてexport．
export default combineReducers({
    review: ReviewReducer
});
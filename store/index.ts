import {createStore, compose, applyMiddleware} from "redux";
import thunk from "redux-thunk";

import reducers from "../reducers";

const store = createStore( // storeを作成
    reducers, // Reducerを適用
    {},
    compose(
        applyMiddleware(thunk), // Reduxで非同期処理を扱うredux-thunkを適用
    )
);

export default store;